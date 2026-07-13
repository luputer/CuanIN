import { TRPCError } from "@trpc/server";
import { withdrawalSchema } from "~/lib/validation";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getCreatorBalance, getAdminBalance } from "~/lib/balance";
import { sendWithdrawalPendingEmail, sendWithdrawalOtpEmail } from "~/lib/email";
import { createNotification } from "~/lib/notification";
import crypto from "crypto";
import { z } from "zod";

const BANK_OPTIONS = {
  bca: { name: "BCA", channelCode: "ID_BCA" },
  bni: { name: "BNI", channelCode: "ID_BNI" },
  bri: { name: "BRI", channelCode: "ID_BRI" },
  mandiri: { name: "Mandiri", channelCode: "ID_MANDIRI" },
  cimb: { name: "CIMB Niaga", channelCode: "ID_CIMB" },
  bsi: { name: "BSI", channelCode: "ID_BSI" },
} as const;

export const withdrawalsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(withdrawalSchema)
    .mutation(async ({ ctx, input }) => {
      const isAdmin = ctx.session.user.role === "ADMIN";
      const payoutAmount = input.amount;
      const platformFee = isAdmin ? 0 : Math.round(payoutAmount * 0.02);
      const transferFee = 4000;
      const totalDeduction = payoutAmount + platformFee + transferFee;

      if (payoutAmount < 5000) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Nominal penarikan minimal Rp5.000.",
        });
      }

      // OTP Verification (only for Creator/Non-Admin)
      if (!isAdmin) {
        if (!input.otp) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "OTP penarikan wajib diisi.",
          });
        }

        const identifier = `WITHDRAWAL:${ctx.session.user.id}`;
        const verificationToken = await ctx.db.verificationToken.findFirst({
          where: { identifier },
        });

        if (!verificationToken) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Kode OTP tidak ditemukan. Silakan kirim ulang.",
          });
        }

        if (new Date() > verificationToken.expires) {
          await ctx.db.verificationToken.deleteMany({ where: { identifier } });
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Kode OTP sudah kedaluwarsa. Silakan minta kode baru.",
          });
        }

        if (verificationToken.token !== input.otp) {
          const updatedToken = await ctx.db.verificationToken.update({
            where: { token: verificationToken.token },
            data: { attempts: { increment: 1 } },
          });

          if (updatedToken.attempts >= 3) {
            await ctx.db.verificationToken.deleteMany({ where: { identifier } });
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

        // Delete token after successful verification
        await ctx.db.verificationToken.deleteMany({ where: { identifier } });
      }

      const bank = BANK_OPTIONS[input.bank];

      const withdrawal = await ctx.db.$transaction(async (tx) => {
        // Cek saldo
        let balanceAvailable = 0;
        if (isAdmin) {
          const adminBalance = await getAdminBalance(tx);
          balanceAvailable = adminBalance.balance;
        } else {
          const balance = await getCreatorBalance(tx, ctx.session.user.id);
          balanceAvailable = balance.balance;
        }

        if (totalDeduction > balanceAvailable) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Saldo tidak cukup. Total yang dibutuhkan: Rp${totalDeduction.toLocaleString("id-ID")}`,
          });
        }

        // Buat withdrawal dengan status PENDING
        const newWithdrawal = await tx.withdrawal.create({
          data: {
            userId: ctx.session.user.id,
            amount: totalDeduction,
            feeAmount: platformFee,
            bankCode: bank.channelCode,
            bankName: bank.name,
            accountNumber: input.accountNumber,
            accountHolderName: input.accountHolderName,
            email: ctx.session.user.email ?? "",
            referenceId: `WD-${ctx.session.user.id.slice(0, 5)}-${Date.now()}`,
            status: "PENDING",
          },
        });

        // Debit ledger
        await tx.balanceEntry.create({
          data: {
            userId: ctx.session.user.id,
            amount: -totalDeduction,
            type: isAdmin ? "ADMIN_WITHDRAWAL_REQUESTED" : "WITHDRAWAL_REQUESTED",
            refId: newWithdrawal.id,
            note: `Penarikan ke ${bank.name} (${input.accountNumber}). Bersih: ${payoutAmount}`,
          },
        });

        // Kirim notifikasi ke creator
        try {
          await createNotification(tx, {
            userId: ctx.session.user.id,
            type: "WITHDRAWAL",
            title: "Penarikan Saldo Diproses",
            message: `Permintaan penarikan saldo Rp${payoutAmount.toLocaleString("id-ID")} ke ${bank.name} sedang diproses oleh admin.`,
            refId: newWithdrawal.id,
          });
        } catch (notifError) {
          console.error("❌ Gagal kirim notifikasi:", notifError);
        }

        // Kirim notifikasi ke semua admin
        try {
          const admins = await tx.user.findMany({ where: { role: "ADMIN" } });
          for (const admin of admins) {
            await createNotification(tx, {
              userId: admin.id,
              type: "WITHDRAWAL",
              title: "Penarikan Saldo Baru",
              message: `${ctx.session.user.name ?? "Kreator"} mengajukan penarikan saldo Rp${payoutAmount.toLocaleString("id-ID")} ke ${bank.name}.`,
              refId: newWithdrawal.id,
            });
          }
        } catch (notifError) {
          console.error("❌ Gagal kirim notifikasi admin:", notifError);
        }

        try {
          await sendWithdrawalPendingEmail({
            email: ctx.session.user.email ?? "",
            amount: totalDeduction,
            feeAmount: platformFee,
            bankName: bank.name,
            accountNumber: input.accountNumber,
            accountHolderName: input.accountHolderName,
          });
        } catch (emailError) {
          console.error("Email gagal dikirim:", emailError);
        }

        return newWithdrawal;
      });

      return withdrawal;
    }),

  sendWithdrawalOtp: protectedProcedure
    .input(z.object({ amount: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const email = ctx.session.user.email;
      if (!email) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email pengguna tidak ditemukan.",
        });
      }

      const isAdmin = ctx.session.user.role === "ADMIN";
      const payoutAmount = input.amount;
      const platformFee = isAdmin ? 0 : Math.round(payoutAmount * 0.02);
      const transferFee = 4000;
      const totalDeduction = payoutAmount + platformFee + transferFee;

      if (payoutAmount < 5000) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Nominal penarikan minimal Rp5.000.",
        });
      }

      // Check balance
      let balanceAvailable = 0;
      if (isAdmin) {
        const adminBalance = await getAdminBalance(ctx.db);
        balanceAvailable = adminBalance.balance;
      } else {
        const balance = await getCreatorBalance(ctx.db, ctx.session.user.id);
        balanceAvailable = balance.balance;
      }

      if (totalDeduction > balanceAvailable) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Saldo tidak cukup. Total yang dibutuhkan: Rp${totalDeduction.toLocaleString("id-ID")}`,
        });
      }

      // Generate 6-digit OTP
      const otp = crypto.randomInt(100000, 999999).toString();
      const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      const identifier = `WITHDRAWAL:${ctx.session.user.id}`;

      // Cleanup existing withdrawal tokens for this user
      await ctx.db.verificationToken.deleteMany({
        where: { identifier },
      });

      // Save token to DB
      await ctx.db.verificationToken.create({
        data: {
          identifier,
          token: otp,
          expires,
        },
      });

      // Send email
      const name = ctx.session.user.name ?? "Kreator";
      await sendWithdrawalOtpEmail({
        email,
        name,
        amount: payoutAmount,
        otp,
      });

      return { success: true };
    }),
});