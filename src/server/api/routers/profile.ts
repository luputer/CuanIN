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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, phoneNumber, image, password, bio, banner } = input;

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
                catalog: {
                  upsert: {
                    create: {
                      slug: `user-${Date.now()}`,
                    },
                    update: {},
                  },
                },
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
      };
    }),
});