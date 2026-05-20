import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
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
                }),
                ctx.db.voucher.count({ where }),
            ]);

            return {
                items,
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
                usageType: z.enum(["ALL_PRODUCTS", "SELECTED_PRODUCTS", "SINGLE_CHECKOUT"]).optional(),
                usageLimit: z.number().min(1).nullable().optional(),
                productIds: z.array(z.string()).optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
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
                    userId: ctx.session.user.id,
                    products: input.productIds ? {
                        connect: input.productIds.map(id => ({ id }))
                    } : undefined,
                },
            });
        }),

    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const voucher = await ctx.db.voucher.findUnique({
                where: { id: input.id },
                include: {
                    products: true,
                },
            });

            if (voucher?.userId !== ctx.session.user.id) {
                throw new Error("Voucher tidak ditemukan atau Anda tidak memiliki akses");
            }

            return voucher;
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
                usageType: z.enum(["ALL_PRODUCTS", "SELECTED_PRODUCTS", "SINGLE_CHECKOUT"]).optional(),
                usageLimit: z.number().min(1).nullable().optional(),
                productIds: z.array(z.string()).optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
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
                    products: input.productIds ? {
                        set: input.productIds.map(id => ({ id }))
                    } : undefined,
                },
            });

            return updated;
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
});
