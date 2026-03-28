import { z } from "zod";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

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
                        "Format nomor HP tidak valid (contoh: 08123456789)"
                    ),
                password: z.string().min(8, "Password minimal 8 karakter"),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { name, email, phone, password } = input;

            const existingUser = await ctx.db.user.findUnique({ where: { email } });

            if (existingUser) {
                // Google SSO user completing profile (phoneNumber not set yet)
                if (!existingUser.phoneNumber) {
                    const hashed = await bcrypt.hash(password, 12);
                    await ctx.db.user.update({
                        where: { email },
                        data: { name, phoneNumber: phone, password: hashed },
                    });
                    return { success: true };
                }

                throw new TRPCError({
                    code: "CONFLICT",
                    message: "Email sudah terdaftar",
                });
            }

            const hashed = await bcrypt.hash(password, 12);
            await ctx.db.user.create({
                data: { name, email, phoneNumber: phone, password: hashed },
            });

            return { success: true };
        }),
});
