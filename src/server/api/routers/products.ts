import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const ProductType = z.enum(["WEBINAR", "DIGITAL_PRODUCT", "KELAS_ONLINE"]);

export const productsRouter = createTRPCRouter({
    // Get all products milik user yang login (dashboard)
    getAll: protectedProcedure
        .input(z.object({ type: ProductType.optional() }).optional())
        .query(async ({ ctx, input }) => {
            return await ctx.db.product.findMany({
                where: {
                    userId: ctx.session.user.id, // ← hanya milik user ini
                    ...(input?.type ? { type: input.type } : {}),
                },
                orderBy: { createdAt: "desc" },
            });
        }),

    // Get product by ID — hanya boleh akses milik sendiri
    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            return await ctx.db.product.findUnique({
                where: {
                    id: input.id,
                    userId: ctx.session.user.id, // ← pastikan milik user ini
                },
            });
        }),

    // Create a new product
    create: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1, "Product name is required"),
                price: z.number().min(0, "Price must be >= 0"),
                description: z.string().optional(),
                type: ProductType.optional(),
                startDate: z.date().optional(),
                endDate: z.date().optional(),
                link: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            return await ctx.db.product.create({
                data: {
                    ...input,
                    userId: ctx.session.user.id,
                },
            });
        }),

    // Update a product — hanya milik sendiri
    update: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string().min(1, "Product name is required").optional(),
                price: z.number().min(0).optional(),
                description: z.string().optional(),
                type: ProductType.optional(),
                startDate: z.date().optional(),
                endDate: z.date().optional(),
                link: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { id, ...data } = input;
            // Pastikan produk milik user yang login
            const product = await ctx.db.product.findUnique({
                where: { id, userId: ctx.session.user.id },
            });
            if (!product) throw new Error("Produk tidak ditemukan atau bukan milikmu");
            return await ctx.db.product.update({ where: { id }, data });
        }),

    // Delete a product — hanya milik sendiri
    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const product = await ctx.db.product.findUnique({
                where: { id: input.id, userId: ctx.session.user.id },
            });
            if (!product) throw new Error("Produk tidak ditemukan atau bukan milikmu");
            return await ctx.db.product.delete({ where: { id: input.id } });
        }),
});