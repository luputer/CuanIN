import { z } from "zod";
import { Prisma } from "../../../../prisma/generated/prisma";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const FieldTypeEnum = z.enum(["SHORT", "LONG", "MULTIPLE_CHOICE", "CHECKBOX", "DROPDOWN"]);

export const formFieldsRouter = createTRPCRouter({

    // ----------------------------------------------------------------
    // GET — Ambil semua field milik produk (untuk creator dashboard)
    // ----------------------------------------------------------------
    getByProductId: protectedProcedure
        .input(z.object({ productId: z.string() }))
        .query(async ({ ctx, input }) => {
            const product = await ctx.db.product.findUnique({
                where: { id: input.productId, userId: ctx.session.user.id },
                select: { id: true },
            });

            if (!product) throw new Error("Produk tidak ditemukan atau bukan milikmu");

            return await ctx.db.formField.findMany({
                where: { productId: input.productId },
                orderBy: { order: "asc" },
            });
        }),

    // ----------------------------------------------------------------
    // GET PUBLIC — Ambil field untuk halaman checkout (tanpa auth)
    // ----------------------------------------------------------------
    getPublicByProductId: publicProcedure
        .input(z.object({ productId: z.string() }))
        .query(async ({ ctx, input }) => {
            return await ctx.db.formField.findMany({
                where: { productId: input.productId },
                orderBy: { order: "asc" },
                select: {
                    id: true,
                    label: true,
                    type: true,
                    options: true,
                    required: true,
                    order: true,
                },
            });
        }),

    // ----------------------------------------------------------------
    // SAVE — Bulk save (delete lama + insert baru dalam 1 transaction)
    // ----------------------------------------------------------------
    save: protectedProcedure
        .input(
            z.object({
                productId: z.string(),
                fields: z.array(
                    z.object({
                        id: z.string(),       // ← ID dikirim dari frontend
                        label: z.string().min(1, "Label wajib diisi"),
                        type: FieldTypeEnum,
                        options: z.array(z.string()).optional(),
                        required: z.boolean(),
                        order: z.number(),
                    })
                ),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const product = await ctx.db.product.findUnique({
                where: { id: input.productId, userId: ctx.session.user.id },
                select: { id: true },
            });

            if (!product) throw new Error("Produk tidak ditemukan atau bukan milikmu");

            await ctx.db.$transaction(async (tx) => {
                // Hapus semua field lama milik produk ini
                await tx.formField.deleteMany({
                    where: { productId: input.productId },
                });

                // Insert field baru (hanya kalau ada)
                if (input.fields.length > 0) {
                    await tx.formField.createMany({
                        data: input.fields.map((field) => ({
                            id: field.id,                        // ← pakai ID dari frontend
                            productId: input.productId,
                            label: field.label,
                            type: field.type,
                            options: field.options ?? Prisma.JsonNull,
                            required: field.required,
                            order: field.order,
                        })),
                    });
                }
            });

            return { success: true };
        }),
});