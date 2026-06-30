import { z } from "zod";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { sendVerificationEmail, sendPasswordResetEmail } from "~/lib/email";
import crypto from "crypto";

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2, "Nama minimal 2 karakter"),
        email: z.string().email("Format email tidak valid"),
        phone: z
          .string()
          .min(10, "Nomor HP minimal 10 digit")
          .regex(
            /^(\+62|62|0)8[1-9][0-9]{6,9}$/,
            "Format nomor HP tidak valid (contoh: 08123456789)",
          ),
        password: z.string().min(8, "Password minimal 8 karakter"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, phone, password } = input;
      const email = input.email.toLowerCase();

      const existingUser = await ctx.db.user.findUnique({ where: { email } });

      if (existingUser) {
        // If email is not verified yet, it means they abandoned the OTP step previously.
        // We can just update their info and resend the OTP.
        if (!existingUser.emailVerified) {
          const hashed = await bcrypt.hash(password, 12);
          await ctx.db.user.update({
            where: { email },
            data: {
              name,
              phoneNumber: phone,
              password: hashed,
            },
          });
          // Proceed to send OTP outside this block
        } 
        // Google SSO user completing profile (phoneNumber not set yet)
        else if (!existingUser.phoneNumber) {
          const hashed = await bcrypt.hash(password, 12);
          await ctx.db.user.update({
            where: { email },
            data: {
              name,
              phoneNumber: phone,
              password: hashed,
              role: existingUser.role === "ADMIN" ? "ADMIN" : "CREATOR",
              emailVerified: new Date(),
            },
          });

          return { success: true };
        } 
        // Otherwise, they are fully registered and verified
        else {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email sudah terdaftar, silakan login",
          });
        }
      } else {
        const hashed = await bcrypt.hash(password, 12);
        await ctx.db.user.create({
          data: {
            name,
            email,
            phoneNumber: phone,
            password: hashed,
            role: "CREATOR",
          },
        });
      }

      // Generate 6-digit OTP
      const otp = crypto.randomInt(100000, 999999).toString();
      const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Cleanup existing tokens for this email
      await ctx.db.verificationToken.deleteMany({
        where: { identifier: email },
      });

      await ctx.db.verificationToken.create({
        data: {
          identifier: email,
          token: otp,
          expires,
        },
      });

      await sendVerificationEmail({ email, name, otp });

      return { success: true };
    }),

  verifyOtp: publicProcedure
    .input(
      z.object({
        otp: z.string().length(6, "OTP harus 6 digit"),
        email: z.string().email(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { otp } = input;
      const email = input.email.toLowerCase();

      const verificationToken = await ctx.db.verificationToken.findFirst({
        where: {
          identifier: email,
        },
      });

      if (!verificationToken) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kode OTP tidak ditemukan. Silakan kirim ulang.",
        });
      }

      if (new Date() > verificationToken.expires) {
        await ctx.db.verificationToken.deleteMany({ where: { identifier: email } });
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kode OTP sudah kedaluwarsa",
        });
      }

      if (verificationToken.token !== otp) {
        const updatedToken = await ctx.db.verificationToken.update({
          where: { token: verificationToken.token },
          data: { attempts: { increment: 1 } },
        });

        if (updatedToken.attempts >= 3) {
          await ctx.db.verificationToken.deleteMany({ where: { identifier: email } });
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Terlalu banyak percobaan salah. Silakan minta kode OTP baru.",
          });
        }

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Kode OTP salah. Sisa percobaan: ${3 - updatedToken.attempts}`,
        });
      }

      await ctx.db.user.update({
        where: { email },
        data: { emailVerified: new Date() },
      });

      await ctx.db.verificationToken.deleteMany({
        where: { identifier: email },
      });

      return { success: true };
    }),

  resendOtp: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const email = input.email.toLowerCase();

      const user = await ctx.db.user.findUnique({
        where: { email },
        select: { name: true, emailVerified: true },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User tidak ditemukan",
        });
      }

      if (user.emailVerified) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email sudah diverifikasi",
        });
      }

      const otp = crypto.randomInt(100000, 999999).toString();
      const expires = new Date(Date.now() + 10 * 60 * 1000);

      await ctx.db.verificationToken.deleteMany({
        where: { identifier: email },
      });

      await ctx.db.verificationToken.create({
        data: {
          identifier: email,
          token: otp,
          expires,
        },
      });

      await sendVerificationEmail({ email, name: user.name ?? "User", otp });

      return { success: true };
    }),

  checkEmailVerified: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ ctx, input }) => {
      const email = input.email.toLowerCase();
      const user = await ctx.db.user.findUnique({
        where: { email },
        select: { emailVerified: true },
      });
      if (!user) return { exists: false, verified: false };
      return { exists: true, verified: !!user.emailVerified };
    }),

  checkResetToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const { token } = input;

      const verificationToken = await ctx.db.verificationToken.findUnique({
        where: { token },
      });

      if (
        !verificationToken ||
        !verificationToken.identifier.startsWith("RESET:") ||
        new Date() > verificationToken.expires
      ) {
        return { valid: false };
      }

      const email = verificationToken.identifier.replace("RESET:", "");
      return { valid: true, email };
    }),

  forgotPassword: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const email = input.email.toLowerCase();

      const user = await ctx.db.user.findUnique({
        where: { email },
        select: { id: true, name: true },
      });

      // For security, always return success even if user not found
      if (!user) return { success: true };

      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // We prefix the identifier to distinguish it from normal email verification
      const identifier = `RESET:${email}`;

      await ctx.db.verificationToken.deleteMany({
        where: { identifier },
      });

      await ctx.db.verificationToken.create({
        data: {
          identifier,
          token,
          expires,
        },
      });

      await sendPasswordResetEmail({
        email,
        name: user.name ?? "User",
        token,
      });

      return { success: true };
    }),

  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string(),
        password: z.string().min(8, "Password minimal 8 karakter"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { token, password } = input;

      const verificationToken = await ctx.db.verificationToken.findUnique({
        where: { token },
      });

      if (!verificationToken || !verificationToken.identifier.startsWith("RESET:")) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Token tidak valid atau sudah kedaluwarsa",
        });
      }

      if (new Date() > verificationToken.expires) {
        await ctx.db.verificationToken.delete({ where: { token } });
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Token sudah kedaluwarsa",
        });
      }

      const email = verificationToken.identifier.replace("RESET:", "");

      const user = await ctx.db.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User tidak ditemukan",
        });
      }

      const hashed = await bcrypt.hash(password, 12);

      await ctx.db.$transaction([
        ctx.db.user.update({
          where: { id: user.id },
          data: { 
            password: hashed,
            emailVerified: new Date(), // Auto verify on password reset
          },
        }),
        ctx.db.verificationToken.delete({ where: { token } }),
        ctx.db.session.deleteMany({
          where: { userId: user.id },
        }),
      ]);

      return { success: true };
    }),
  });

