import { z } from "zod";
import bcrypt from "bcryptjs";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const profileRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        image: true,
        role: true,
        status: true,
        profile: {
          select: {
            bio: true,
            banner: true,
          },
        },
        catalog: {
          select: {
            slug: true,
          },
        },
      },
    });

    if (!user) throw new Error("User not found");

    return {
      ...user,
      bio: user.profile?.bio ?? "",
      banner: user.profile?.banner ?? "",
    };
  }),

  update: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2, "Nama minimal 2 karakter"),
        phoneNumber: z.string().optional().nullable(),
        image: z.string().optional().nullable(),
        banner: z.string().optional().nullable(),
        password: z.string().optional().nullable(),
        bio: z.string().optional().nullable(),
        slug: z.string().optional().nullable(), // ← tambah ini
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, phoneNumber, image, password, bio, banner, slug } = input;

      // Ambil current catalog untuk cek perubahan slug
      const currentCatalog = await ctx.db.catalog.findUnique({
        where: { userId: ctx.session.user.id },
        select: { slug: true, lastSlugUpdatedAt: true, slugChangeCount: true },
      });

      // Validasi slug kalau diisi
      if (slug) {
        const slugRegex = /^[a-z0-9-]+$/;
        if (!slugRegex.test(slug)) {
          throw new Error("Link hanya boleh huruf kecil, angka, dan tanda hubung (-)");
        }

        // Cek slug sudah dipakai orang lain
        const existing = await ctx.db.catalog.findFirst({
          where: {
            slug,
            NOT: { userId: ctx.session.user.id },
          },
        });
        if (existing) {
          throw new Error("Link sudah dipakai orang lain, pilih link lain.");
        }

        // Cek 2x per minggu
        if (currentCatalog && currentCatalog.slug !== slug) {
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          const lastChange = currentCatalog.lastSlugUpdatedAt;
          const changeCount = currentCatalog.slugChangeCount ?? 0;

          if (lastChange && lastChange < weekAgo) {
            // reset count kalo udah lewat seminggu
          } else if (changeCount >= 2) {
            const nextReset = new Date((lastChange ?? new Date()).getTime() + 7 * 24 * 60 * 60 * 1000);
            const daysLeft = Math.ceil((nextReset.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
            throw new Error(
              `Link toko maksimal diganti 2 kali seminggu. Coba lagi ${daysLeft} hari lagi.`,
            );
          }
        }
      }

      type UserUpdateData = {
        name: string;
        phoneNumber?: string | null;
        image?: string | null;
        password?: string;
      };

      const updateData: UserUpdateData = { name, phoneNumber, image };

      if (password && password.trim() !== "") {
        if (password.length < 8) throw new Error("Password minimal 8 karakter");
        updateData.password = await bcrypt.hash(password, 12);
      }

      const updatedUser = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          ...updateData,
          profile: {
            upsert: {
              create: { bio: bio ?? "", banner: banner ?? "" },
              update: {
                ...(bio !== undefined && { bio }),
                ...(banner !== undefined && { banner }),
              },
            },
          },
          catalog: {
            upsert: {
              create: { slug: slug ?? `user-${Date.now()}` },
              update: {
                ...(slug
                  ? {
                      slug,
                      ...(currentCatalog?.slug !== slug
                        ? {
                            lastSlugUpdatedAt: new Date(),
                            slugChangeCount:
                              currentCatalog?.lastSlugUpdatedAt &&
                              currentCatalog.lastSlugUpdatedAt < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                                ? 1
                                : (currentCatalog?.slugChangeCount ?? 0) + 1,
                          }
                        : {}),
                    }
                  : {}),
              },
            },
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          image: true,
          profile: { select: { bio: true, banner: true } },
          catalog: { select: { slug: true } },
        },
      });

      return {
        ...updatedUser,
        bio: updatedUser.profile?.bio ?? "",
        banner: updatedUser.profile?.banner ?? "",
      };
    }),
});