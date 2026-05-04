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
        banner: true,
        role: true,
        status: true,
        catalog: {
          select: {
            bio: true,
          },
        },
      },
    });
    if (!user) throw new Error("User not found");
    return {
      ...user,
      bio: user.catalog?.bio ?? "",
      banner: user.banner ?? "",
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
      const { name, phoneNumber, image, banner, password, bio } = input;

      type UserUpdateData = {
        name: string;
        phoneNumber?: string | null;
        image?: string | null;
        banner?: string | null;
        password?: string;
      };

      const updateData: UserUpdateData = {
        name,
        phoneNumber,
        image,
        banner,
      };

      if (password && password.trim() !== "") {
        if (password.length < 8) {
          throw new Error("Password minimal 8 karakter");
        }
        updateData.password = await bcrypt.hash(password, 12);
      }

      const updatedUser = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          ...updateData,
          ...(bio !== undefined
            ? {
                catalog: {
                  upsert: {
                    create: {
                      bio,
                      slug: `user-${Date.now()}`,
                    },
                    update: {
                      bio,
                    },
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
          banner: true,
          catalog: {
            select: {
              bio: true,
            },
          },
        },
      });

      return updatedUser;
    }),
});
