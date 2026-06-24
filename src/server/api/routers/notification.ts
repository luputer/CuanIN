import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const notificationRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(200).default(50) }).optional())
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 50;
      const userId = ctx.session.user.id;

      const [items, unreadCount] = await Promise.all([
        ctx.db.notification.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: limit,
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
