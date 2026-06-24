import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const notificationRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;
      const userId = ctx.session.user.id;

      const [items, total, unreadCount] = await Promise.all([
        ctx.db.notification.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        ctx.db.notification.count({ where: { userId } }),
        ctx.db.notification.count({
          where: { userId, isRead: false },
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return { items, unreadCount, total, totalPages, page, limit };
    }),

  markRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const notification = await ctx.db.notification.findUnique({
        where: { id: input.id },
      });

      if (!notification || notification.userId !== ctx.session.user.id) {
        return { success: false };
      }

      await ctx.db.notification.update({
        where: { id: input.id },
        data: { isRead: true },
      });

      return { success: true };
    }),

  markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.notification.updateMany({
      where: { userId: ctx.session.user.id, isRead: false },
      data: { isRead: true },
    });

    return { success: true };
  }),
});
