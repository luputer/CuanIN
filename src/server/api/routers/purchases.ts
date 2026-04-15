import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const purchasesRouter = createTRPCRouter({
    // Create a purchase (public — called from checkout page)
    create: publicProcedure
        .input(
            z.object({
                productId: z.string(),
                buyerName: z.string().min(1, "Nama wajib diisi"),
                buyerEmail: z.string().email("Email tidak valid"),
                buyerPhone: z.string().min(1, "Nomor telepon wajib diisi"),
                answers: z.array(
                    z.object({
                        formFieldId: z.string(),
                        answer: z.string(),
                    })
                ).optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Get the product to determine amount
            const product = await ctx.db.product.findUnique({
                where: { id: input.productId, status: "published" },
                select: { id: true, price: true },
            });
            if (!product) throw new Error("Produk tidak ditemukan atau tidak tersedia");

            // Create purchase with form answers in a transaction
            const purchase = await ctx.db.$transaction(async (tx) => {
                const newPurchase = await tx.purchase.create({
                    data: {
                        productId: input.productId,
                        buyerName: input.buyerName,
                        buyerEmail: input.buyerEmail,
                        buyerPhone: input.buyerPhone,
                        amount: product.price,
                        status: "completed",
                    },
                });

                // Create form answers if provided
                if (input.answers && input.answers.length > 0) {
                    await tx.formAnswer.createMany({
                        data: input.answers.map((a) => ({
                            purchaseId: newPurchase.id,
                            formFieldId: a.formFieldId,
                            answer: a.answer,
                        })),
                    });
                }

                return newPurchase;
            });

            return purchase;
        }),

    // List all purchases for a product (creator dashboard, with pagination + search)
    getByProductId: protectedProcedure
        .input(
            z.object({
                productId: z.string(),
                page: z.number().min(1).default(1),
                limit: z.number().min(1).max(100).default(7),
                search: z.string().optional(),
            })
        )
        .query(async ({ ctx, input }) => {
            // Verify product belongs to user
            const product = await ctx.db.product.findUnique({
                where: { id: input.productId, userId: ctx.session.user.id },
                select: { id: true },
            });
            if (!product) throw new Error("Produk tidak ditemukan atau bukan milikmu");

            const page = input.page;
            const limit = input.limit;
            const skip = (page - 1) * limit;

            const where = {
                productId: input.productId,
                ...(input.search
                    ? {
                          buyerName: {
                              contains: input.search,
                              mode: "insensitive" as const,
                          },
                      }
                    : {}),
            };

            const [items, total] = await Promise.all([
                ctx.db.purchase.findMany({
                    where,
                    orderBy: { createdAt: "desc" },
                    skip,
                    take: limit,
                }),
                ctx.db.purchase.count({ where }),
            ]);

            return {
                items,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        }),

    // Get single purchase detail with form answers (creator dashboard)
    getDetail: protectedProcedure
        .input(z.object({ purchaseId: z.string() }))
        .query(async ({ ctx, input }) => {
            const purchase = await ctx.db.purchase.findUnique({
                where: { id: input.purchaseId },
                include: {
                    product: {
                        select: { userId: true },
                    },
                    answers: {
                        include: {
                            formField: {
                                select: { label: true, type: true },
                            },
                        },
                    },
                },
            });

            if (!purchase) throw new Error("Data pembelian tidak ditemukan");
            if (purchase.product.userId !== ctx.session.user.id) {
                throw new Error("Kamu tidak memiliki akses ke data ini");
            }

            return purchase;
        }),

    // Count purchases for a product (for product list page)
    countByProductId: protectedProcedure
        .input(z.object({ productId: z.string() }))
        .query(async ({ ctx, input }) => {
            return await ctx.db.purchase.count({
                where: { productId: input.productId },
            });
        }),

    // Batch count purchases for multiple products (for product list page)
    countByProductIds: protectedProcedure
        .input(z.object({ productIds: z.array(z.string()) }))
        .query(async ({ ctx, input }) => {
            const counts = await ctx.db.purchase.groupBy({
                by: ["productId"],
                where: { productId: { in: input.productIds } },
                _count: { id: true },
            });

            const countMap: Record<string, number> = {};
            for (const c of counts) {
                countMap[c.productId] = c._count.id;
            }
            return countMap;
        }),
});
