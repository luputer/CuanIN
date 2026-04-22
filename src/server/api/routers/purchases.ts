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

    // Get all unique participants across all products owned by the creator
    getAllParticipants: protectedProcedure
        .input(
            z.object({
                page: z.number().min(1).default(1),
                limit: z.number().min(1).max(100).default(10),
                search: z.string().optional(),
            })
        )
        .query(async ({ ctx, input }) => {
            const skip = (input.page - 1) * input.limit;

            // Get all product IDs owned by this creator
            const products = await ctx.db.product.findMany({
                where: { userId: ctx.session.user.id },
                select: { id: true },
            });
            const productIds = products.map((p) => p.id);

            if (productIds.length === 0) {
                return {
                    items: [],
                    total: 0,
                    page: input.page,
                    limit: input.limit,
                    totalPages: 0,
                };
            }

            // Define base where clause
            const whereClause = {
                productId: { in: productIds },
                ...(input.search
                    ? {
                          OR: [
                              { buyerName: { contains: input.search, mode: "insensitive" as const } },
                              { buyerEmail: { contains: input.search, mode: "insensitive" as const } },
                          ],
                      }
                    : {}),
            };

            // First, get unique emails to handle pagination correctly
            // Prisma doesn't support easy pagination on groupBy yet for all fields
            // So we'll get the aggregate data first
            const participantsAggregate = await ctx.db.purchase.groupBy({
                by: ["buyerEmail", "buyerName", "buyerPhone"],
                where: whereClause,
                _count: {
                    id: true,
                },
                _sum: {
                    amount: true,
                },
                orderBy: {
                    buyerName: "asc",
                },
            });

            const total = participantsAggregate.length;
            const paginatedItems = participantsAggregate.slice(skip, skip + input.limit);

            return {
                items: paginatedItems.map((p) => ({
                    email: p.buyerEmail,
                    name: p.buyerName,
                    phone: p.buyerPhone,
                    productsBought: p._count.id,
                    totalTransaction: Number(p._sum.amount ?? 0),
                })),
                total,
                page: input.page,
                limit: input.limit,
                totalPages: Math.ceil(total / input.limit),
            };
        }),

    // Delete single purchase (creator dashboard)
    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const purchase = await ctx.db.purchase.findUnique({
                where: { id: input.id },
                include: { product: { select: { userId: true } } },
            });

            if (!purchase) throw new Error("Data pembeli tidak ditemukan");
            if (purchase.product.userId !== ctx.session.user.id) {
                throw new Error("Kamu tidak memiliki akses ke data ini");
            }

            await ctx.db.purchase.delete({
                where: { id: input.id },
            });

            return { success: true };
        }),
});
