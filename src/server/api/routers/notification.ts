import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const notificationRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const [items, unreadCount] = await Promise.all([
      ctx.db.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      ctx.db.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return { items, unreadCount };
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
