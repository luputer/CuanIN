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
                bio: catalog.bio,
                creator: {
                    id: catalog.user.id,
                    name: catalog.user.name,
                    image: catalog.user.image,
                },
                products: catalog.user.products,
            };
        }),

    // Cek apakah slug tersedia (publik, untuk real-time validation di form)
    checkSlug: publicProcedure
        .input(z.object({ slug: z.string() }))
        .query(async ({ ctx, input }) => {
            const existing = await ctx.db.catalog.findUnique({
                where: { slug: input.slug },
                select: { userId: true },
            });
            return { available: !existing };
        }),

    // Ambil catalog milik user yang login (untuk link di sidebar dashboard)
    getMine: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db.catalog.findUnique({
            where: { userId: ctx.session.user.id },
            select: { slug: true },
        });
    }),

    // Buat atau update catalog user
    upsert: protectedProcedure
        .input(
            z.object({
                slug: z
                    .string()
                    .min(3, "Slug minimal 3 karakter")
                    .max(50, "Slug maksimal 50 karakter")
                    .regex(/^[a-z0-9-]+$/, "Hanya huruf kecil, angka, dan tanda hubung (-)"),
                bio: z.string().max(200).optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            try {
                return await ctx.db.catalog.upsert({
                    where: { userId: ctx.session.user.id },
                    update: { slug: input.slug, bio: input.bio },
                    create: {
                        slug: input.slug,
                        bio: input.bio,
                        userId: ctx.session.user.id,
                    },
                });
            } catch (e: unknown) {
                // Prisma unique constraint violation (P2002) → slug sudah dipakai
                if (
                    typeof e === "object" && e !== null &&
                    "code" in e && (e as { code: string }).code === "P2002"
                ) {
                    throw new Error("Slug sudah dipakai orang lain, pilih nama lain.");
                }
                throw e;
            }
        }),
});
