import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { type Prisma } from "../../../../prisma/generated/prisma";

export const vouchersRouter = createTRPCRouter({
    getAll: protectedProcedure
        .input(
            z.object({
                page: z.number().default(1),
                limit: z.number().default(10),
                search: z.string().optional(),
                sortBy: z.enum(["code", "createdAt", "startDate"]).default("createdAt"),
                sortOrder: z.enum(["asc", "desc"]).default("desc"),
                type: z.enum(["ALL", "PERSEN", "NOMINAL"]).default("ALL"),
                status: z.string().default("ALL"),
            })
        )
        .query(async ({ ctx, input }) => {
            const { page, limit, search, sortBy, sortOrder, type, status } = input;
            const skip = (page - 1) * limit;

            const where: Prisma.VoucherWhereInput = {
                userId: ctx.session.user.id,
            };

            if (search) {
                where.code = {
                    contains: search,
                    mode: "insensitive",
                };
            }

            if (type !== "ALL") {
                where.type = type;
            }

            if (status !== "ALL") {
                where.status = status;
            }

            const orderBy: Prisma.VoucherOrderByWithRelationInput =
                sortBy === "code"
                    ? { code: sortOrder }
                    : sortBy === "startDate"
                        ? { startDate: sortOrder }
                        : { createdAt: sortOrder };

            const [items, total] = await Promise.all([
                ctx.db.voucher.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy,
                    include: {
                        _count: {
                            select: {
                                purchases: {
                                    where: {
                                        status: { in: ["completed", "pending"] }
                                    }
                                }
                            }
                        }
                    }
                }),
                ctx.db.voucher.count({ where }),
            ]);

            return {
                items: items.map(item => {
                    const now = new Date();
                    const endDate = new Date(item.endDate);
                    const effectiveStatus = item.status === "aktif" && endDate < now
                        ? "expired"
                        : item.status;
                    return {
                        ...item,
                        status: effectiveStatus,
                        usageCount: item._count.purchases
                    };
                }),
                total,
                totalPages: Math.ceil(total / limit) || 1,
            };
        }),

    create: protectedProcedure
        .input(
            z.object({
                code: z.string().min(1, "Kode voucher wajib diisi"),
                name: z.string().min(1, "Nama voucher wajib diisi"),
                type: z.enum(["PERSEN", "NOMINAL"]),
                discount: z.number().min(0),
                startDate: z.string().min(1),
                endDate: z.string().min(1),
                status: z.enum(["aktif", "nonaktif", "expired"]),
                usageType: z.enum(["ALL_PRODUCTS", "SELECTED_PRODUCTS"]).optional(),
                usageLimit: z.number().min(1).nullable().optional(),
                isLimitPerUser: z.boolean().optional(),
                productIds: z.array(z.string()).optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            try {
                const existing = await ctx.db.voucher.findFirst({
                    where: {
                        userId: ctx.session.user.id,
                        code: input.code
                    }
                });

                if (existing) {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: "Kode voucher sudah digunakan"
                    });
                }

                return await ctx.db.voucher.create({
                    data: {
                        code: input.code,
                        name: input.name,
                        type: input.type,
                        discount: input.discount,
                        startDate: new Date(input.startDate),
                        endDate: new Date(input.endDate),
                        status: input.status,
                        usageType: input.usageType || "ALL_PRODUCTS",
                        usageLimit: input.usageLimit,
                        isLimitPerUser: input.isLimitPerUser || false,
                        userId: ctx.session.user.id,
                        products: input.productIds ? {
                            connect: input.productIds.map(id => ({ id }))
                        } : undefined,
                    },
                });
            } catch (error: any) {
                if (error instanceof TRPCError) throw error;

                if (error.code === "P2002") {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: "Kode voucher sudah digunakan"
                    });
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Terjadi kesalahan saat memproses data voucher"
                });
            }
        }),

    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const voucher = await ctx.db.voucher.findUnique({
                where: { id: input.id },
                include: {
                    products: true,
                    _count: {
                        select: {
                            purchases: {
                                where: {
                                    status: { in: ["completed", "pending"] }
                                }
                            }
                        }
                    }
                },
            });

            if (voucher?.userId !== ctx.session.user.id) {
                throw new Error("Voucher tidak ditemukan atau Anda tidak memiliki akses");
            }

            return {
                ...voucher,
                usageCount: voucher._count.purchases
            };
        }),

    update: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                code: z.string().min(1, "Kode voucher wajib diisi"),
                name: z.string().min(1, "Nama voucher wajib diisi"),
                type: z.enum(["PERSEN", "NOMINAL"]),
                discount: z.number().min(0),
                startDate: z.string().min(1),
                endDate: z.string().min(1),
                status: z.enum(["aktif", "nonaktif", "expired"]),
                usageType: z.enum(["ALL_PRODUCTS", "SELECTED_PRODUCTS"]).optional(),
                usageLimit: z.number().min(1).nullable().optional(),
                isLimitPerUser: z.boolean().optional(),
                productIds: z.array(z.string()).optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            try {
                const voucher = await ctx.db.voucher.findUnique({
                    where: { id: input.id },
                });

                if (voucher?.userId !== ctx.session.user.id) {
                    throw new Error("Voucher tidak ditemukan atau Anda tidak memiliki akses");
                }

                const updated = await ctx.db.voucher.update({
                    where: { id: input.id },
                    data: {
                        code: input.code,
                        name: input.name,
                        type: input.type,
                        discount: input.discount,
                        startDate: new Date(input.startDate),
                        endDate: new Date(input.endDate),
                        status: input.status,
                        ...(input.usageType && { usageType: input.usageType }),
                        ...(input.usageLimit !== undefined && { usageLimit: input.usageLimit }),
                        isLimitPerUser: input.isLimitPerUser ?? voucher.isLimitPerUser,
                        products: input.productIds ? {
                            set: input.productIds.map(id => ({ id }))
                        } : undefined,
                    },
                });

                return updated;
            } catch (error: any) {
                if (error instanceof TRPCError) throw error;

                if (error.code === "P2002") {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: "Kode voucher sudah digunakan"
                    });
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Terjadi kesalahan saat memproses data voucher"
                });
            }
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const voucher = await ctx.db.voucher.findUnique({
                where: { id: input.id },
            });

            if (voucher?.userId !== ctx.session.user.id) {
                throw new Error("Voucher tidak ditemukan atau Anda tidak memiliki akses");
            }

            await ctx.db.voucher.delete({
                where: { id: input.id },
            });

            return { success: true };
        }),

    validatePromoCode: publicProcedure
        .input(
            z.object({
                code: z.string().min(1, "Kode promo wajib diisi"),
                productId: z.string().min(1, "Product ID wajib diisi"),
                buyerEmail: z.string().optional(),
            })
        )
        .query(async ({ ctx, input }) => {
            const { code, productId, buyerEmail } = input;
            const now = new Date();

            const product = await ctx.db.product.findUnique({
                where: { id: productId },
                select: { userId: true }
            });

            if (!product) {
                throw new Error("Produk tidak ditemukan");
            }

            const voucher = await ctx.db.voucher.findFirst({
                where: {
                    code,
                    userId: product.userId
                },
                include: {
                    products: {
                        select: { id: true }
                    }
                }
            });

            if (!voucher) {
                throw new Error("Kode voucher tidak valid atau tidak ditemukan");
            }

            if (voucher.status !== "aktif") {
                throw new Error("Voucher tidak aktif");
            }

            const adjustedStartDate = new Date(voucher.startDate);
            adjustedStartDate.setUTCHours(0, 0, 0, 0);

            const adjustedEndDate = new Date(voucher.endDate);
            adjustedEndDate.setUTCHours(23, 59, 59, 999);

            if (now < adjustedStartDate || now > adjustedEndDate) {
                throw new Error("Voucher sudah kedaluwarsa atau belum berlaku");
            }

            if (voucher.usageType === "SELECTED_PRODUCTS") {
                const isLinked = voucher.products.some(p => p.id === productId);
                if (!isLinked) {
                    throw new Error("Voucher tidak berlaku untuk produk ini");
                }
            }

            if (voucher.usageLimit !== null && voucher.usageLimit !== undefined) {
                const usageCount = await ctx.db.purchase.count({
                    where: {
                        voucherId: voucher.id,
                        status: { in: ["completed", "pending"] },
                    },
                });
                if (usageCount >= voucher.usageLimit) {
                    throw new Error("Kuota penggunaan voucher ini sudah habis");
                }
            }

            if (voucher.isLimitPerUser) {
                if (!buyerEmail) {
                    throw new Error("Silakan isi form Email terlebih dahulu untuk memvalidasi voucher ini");
                }

                const userUsageCount = await ctx.db.purchase.count({
                    where: {
                        voucherId: voucher.id,
                        buyerEmail: {
                            equals: buyerEmail,
                            mode: "insensitive",
                        },
                        status: { in: ["completed", "pending"] },
                    },
                });

                if (userUsageCount > 0) {
                    throw new Error("Email ini sudah pernah menggunakan kode voucher ini");
                }
            }

            return {
                id: voucher.id,
                code: voucher.code,
                name: voucher.name,
                type: voucher.type,
                discount: Number(voucher.discount),
                isLimitPerUser: voucher.isLimitPerUser,
            };
        }),
});
