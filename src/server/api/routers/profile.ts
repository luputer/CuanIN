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
        name: z.string().min(2, "Nama minimal 2 karakter").nonempty("Nama wajib diisi"),
        phoneNumber: z.string().min(8, "Nomor HP minimal 8 karakter").nonempty("Nomor HP wajib diisi"),
        image: z.string().optional().nullable(),
        banner: z.string().optional().nullable(),
        password: z.string().optional().nullable(),
        bio: z.string().optional().nullable(),
        slug: z.string()
          .min(3, "Link minimal 3 karakter")
          .max(50, "Link maksimal 50 karakter")
          .regex(/^[a-z0-9_-]+$/, "Link hanya boleh berisi huruf, angka, - dan _")
          .transform((val) => val.toLowerCase())
          .refine((val) => !['admin', 'api', 'dashboard', 'settings', 'support', 'user'].includes(val), "Link tidak tersedia")
          .optional()
          .nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, phoneNumber, image, password, bio, banner, slug } = input;

      type UserUpdateData = {
        name: string;
        phoneNumber?: string | null;
        image?: string | null;
        password?: string;
      };

      const updateData: UserUpdateData = {
        name,
        phoneNumber,
        image,
      };

      if (password && password.trim() !== "") {
        if (password.length < 8) throw new Error("Password minimal 8 karakter");
        updateData.password = await bcrypt.hash(password, 12);
      }

      let catalogUpdateData: any = {};
      let currentUserCatalog = null;
      if (ctx.session.user.role === "CREATOR") {
        currentUserCatalog = await ctx.db.catalog.findUnique({ where: { userId: ctx.session.user.id } });
      }

      if (slug) {
        if (!currentUserCatalog) {
          currentUserCatalog = await ctx.db.catalog.findUnique({ where: { userId: ctx.session.user.id } });
        }
        
        if (currentUserCatalog) {
          if (currentUserCatalog.slug !== slug) {
            // Check for uniqueness
            const existingCatalog = await ctx.db.catalog.findUnique({ where: { slug } });
            if (existingCatalog) {
              throw new Error("Link sudah dipakai orang lain, pilih link lain.");
            }

            // Check cooldown (7 days)
            if (currentUserCatalog.lastSlugUpdatedAt) {
              const lastUpdate = new Date(currentUserCatalog.lastSlugUpdatedAt);
              const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
              if (Date.now() - lastUpdate.getTime() < oneWeekInMs) {
                throw new Error("Anda hanya bisa mengubah link setiap 7 hari sekali.");
              }
            }
            
            catalogUpdateData = {
              slug,
              lastSlugUpdatedAt: new Date(),
            };
          }
        } else {
          // New catalog creation
          catalogUpdateData = {
            create: {
              slug,
              lastSlugUpdatedAt: new Date(),
            },
          };
        }
      }

      const updatedUser = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          ...updateData,
          profile: {
            upsert: {
              create: {
                bio: bio ?? "",
                banner: banner ?? "",
              },
              update: {
                ...(bio !== undefined && { bio }),
                ...(banner !== undefined && { banner }),
              },
            },
          },
          ...(ctx.session.user.role === "CREATOR"
            ? {
                catalog: currentUserCatalog 
                    ? { update: catalogUpdateData } 
                    : { create: { 
                        slug: slug ?? `user-${Date.now()}`, 
                        lastSlugUpdatedAt: new Date()
                      } },
              }
            : {}),
        },
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          image: true,
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

      return {
        ...updatedUser,
        bio: updatedUser.profile?.bio ?? "",
        banner: updatedUser.profile?.banner ?? "",
        slug: updatedUser.catalog?.slug ?? "",
      };
    }),
});