import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { s3Client } from "./s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { env } from "~/env";

const ProductType = z.enum(["WEBINAR", "DIGITAL_PRODUCT", "KELAS_ONLINE"]);

export const productsRouter = createTRPCRouter({
    // Get all products milik user yang login (dashboard) dengan pagination
    getAll: protectedProcedure
        .input(
            z.object({
                type: ProductType.optional(),
                page: z.number().min(1).default(1),
                limit: z.number().min(1).max(100).default(10),
                search: z.string().optional(),
            }).optional()
        )
        .query(async ({ ctx, input }) => {
            const page = input?.page ?? 1;
            const limit = input?.limit ?? 10;
            const skip = (page - 1) * limit;

            const where = {
                userId: ctx.session.user.id,
                ...(input?.type ? { type: input.type } : {}),
                ...(input?.search ? {
                    name: {
                        contains: input.search,
                        mode: 'insensitive' as const,
                    }
                } : {}),
            };

            const [items, total] = await Promise.all([
                ctx.db.product.findMany({
                    where,
                    include: {
                        user: {
                            select: {
                                name: true,
                                image: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                    skip,
                    take: limit,
                }),
                ctx.db.product.count({ where }),
            ]);

            return {
                items,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
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
                image: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Generate slug from product name
            const baseSlug = input.name
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-")
                .slice(0, 60);

            // Ensure slug is unique — append suffix if collision
            let slug = baseSlug;
            let counter = 1;
            while (await ctx.db.product.findUnique({ where: { slug } })) {
                slug = `${baseSlug}-${counter++}`;
            }

            return await ctx.db.product.create({
                data: {
                    ...input,
                    slug,
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
                image: z.string().optional(),
                status: z.string().optional(),
            })
        )

        .mutation(async ({ ctx, input }) => {
            const { id, name, ...rest } = input;
            // Pastikan produk milik user yang login
            const product = await ctx.db.product.findUnique({
                where: { id, userId: ctx.session.user.id },
            });
            if (!product) throw new Error("Produk tidak ditemukan atau bukan milikmu");

            let slug: string | undefined;
            if (name && name !== product.name) {
                const baseSlug = name
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9\s-]/g, "")
                    .replace(/\s+/g, "-")
                    .replace(/-+/g, "-")
                    .slice(0, 60);

                slug = baseSlug;
                let counter = 1;
                while (await ctx.db.product.findFirst({ where: { slug, NOT: { id } } })) {
                    slug = `${baseSlug}-${counter++}`;
                }
            }

            return await ctx.db.product.update({
                where: { id },
                data: { ...rest, ...(name ? { name } : {}), ...(slug ? { slug } : {}) },
            });
        }),

    // Delete a product — hanya milik sendiri
    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const product = await ctx.db.product.findUnique({
                where: { id: input.id, userId: ctx.session.user.id },
            });

            if (!product) throw new Error("Produk tidak ditemukan atau bukan milikmu");

            // Jika ada gambar, hapus dari S3
            if (product.image) {
                try {
                    const url = new URL(product.image);
                    const key = url.pathname.startsWith("/")
                        ? url.pathname.substring(1)
                        : url.pathname;

                    const deleteObjectCommand = new DeleteObjectCommand({
                        Bucket: env.BUCKET_NAME,
                        Key: key,
                    });

                    await s3Client.send(deleteObjectCommand);
                } catch (e) {
                    console.error("Gagal menghapus gambar dari S3:", e);
                    // Kita tetap lanjut hapus record DB walaupun S3 gagal
                }
            }

            return await ctx.db.product.delete({ where: { id: input.id } });
        }),
});