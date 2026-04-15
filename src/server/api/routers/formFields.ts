import { z } from "zod";
import { Prisma } from "../../../../prisma/generated/prisma";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const FieldTypeEnum = z.enum(["SHORT", "LONG", "MULTIPLE_CHOICE", "CHECKBOX", "DROPDOWN"]);

export const formFieldsRouter = createTRPCRouter({
    // Get all form fields for a product (creator dashboard)
    getByProductId: protectedProcedure
        .input(z.object({ productId: z.string() }))
        .query(async ({ ctx, input }) => {
            // Verify product belongs to user
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

    // Get form fields for public checkout page (no auth required)
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

    // Bulk save form fields (delete existing + create new)
    save: protectedProcedure
        .input(
            z.object({
                productId: z.string(),
                fields: z.array(
                    z.object({
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
            // Verify product belongs to user
            const product = await ctx.db.product.findUnique({
                where: { id: input.productId, userId: ctx.session.user.id },
                select: { id: true },
            });
            if (!product) throw new Error("Produk tidak ditemukan atau bukan milikmu");

            // Transaction: delete all existing fields, then create new ones
            await ctx.db.$transaction(async (tx) => {
                // Delete existing form fields (cascade will delete answers too)
                await tx.formField.deleteMany({
                    where: { productId: input.productId },
                });

                // Create new fields
                if (input.fields.length > 0) {
                    await tx.formField.createMany({
                        data: input.fields.map((field) => ({
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
