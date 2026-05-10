import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const catalogRouter = createTRPCRouter({
    // Ambil data creator + semua produknya berdasarkan slug catalog
    getBySlug: publicProcedure
        .input(z.object({ slug: z.string() }))
        .query(async ({ ctx, input }) => {
            const catalog = await ctx.db.catalog.findUnique({
                where: { slug: input.slug },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            profile: {
                                select: {
                                    bio: true,
                                    banner: true,
                                },
                            },
                            products: {
                                where: { status: "published" },
                                orderBy: { createdAt: "desc" },
                            },
                        },
                    },
                },
            });

            if (!catalog) return null;

            return {
                id: catalog.id,
                slug: catalog.slug,
                bio: catalog.user.profile?.bio ?? "",
                creator: {
                    id: catalog.user.id,
                    name: catalog.user.name,
                    image: catalog.user.image,
                    banner: catalog.user.profile?.banner ?? "",
                },
                products: catalog.user.products,
            };
        }),

    // Ambil detail satu produk berdasarkan slug creator dan slug produk
    getProductById: publicProcedure
        .input(z.object({ slug: z.string(), productSlug: z.string() }))
        .query(async ({ ctx, input }) => {
            const catalog = await ctx.db.catalog.findUnique({
                where: { slug: input.slug },
                select: { userId: true },
            });

            if (!catalog) return null;

            const product = await ctx.db.product.findFirst({
                where: {
                    OR: [{ slug: input.productSlug }, { id: input.productSlug }],
                    status: "published",
                    userId: catalog.userId,
                },
                include: {
                    user: {
                        include: {
                            profile: {
                                select: {
                                    bio: true,
                                    banner: true,
                                },
                            },
                            products: {
                                where: { status: "published" },
                                orderBy: { price: "asc" },
                            },
                        },
                    },
                    formFields: {
                        orderBy: { order: "asc" },
                    },
                    _count: {
                        select: {
                            purchases: {
                                where: { status: "completed" },
                            },
                        },
                    },
                },
            });

            console.log("Fetched product user products count:", product?.user?.products?.length);

            return product;
        }),

    // Cek apakah slug tersedia
    checkSlug: publicProcedure
        .input(z.object({ slug: z.string() }))
        .query(async ({ ctx, input }) => {
            const existing = await ctx.db.catalog.findUnique({
                where: { slug: input.slug },
                select: { userId: true },
            });
            return { available: !existing };
        }),

    // Ambil catalog milik user yang login
    getMine: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db.catalog.findUnique({
            where: { userId: ctx.session.user.id },
            select: {
                slug: true,
                user: {
                    select: {
                        profile: {
                            select: {
                                bio: true,
                            },
                        },
                    },
                },
            },
        }).then((result) => {
            if (!result) return null;
            return {
                slug: result.slug,
                bio: result.user.profile?.bio ?? "",
            };
        });
    }),

    // Buat atau update catalog user (slug only, bio & banner via profileRouter)
    upsert: protectedProcedure
        .input(
            z.object({
                slug: z
                    .string()
                    .min(3, "Slug minimal 3 karakter")
                    .max(50, "Slug maksimal 50 karakter")
                    .regex(/^[a-z0-9-]+$/, "Hanya huruf kecil, angka, dan tanda hubung (-)"),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            try {
                return await ctx.db.catalog.upsert({
                    where: { userId: ctx.session.user.id },
                    update: { slug: input.slug },
                    create: {
                        slug: input.slug,
                        userId: ctx.session.user.id,
                    },
                });
            } catch (e: unknown) {
                if (
                    typeof e === "object" &&
                    e !== null &&
                    "code" in e &&
                    (e as { code: string }).code === "P2002"
                ) {
                    throw new Error("Slug sudah dipakai orang lain, pilih nama lain.");
                }
                throw e;
            }
        }),
});