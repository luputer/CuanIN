import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "../trpc";

export const adminRouter = createTRPCRouter({
  getWithdrawals: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        status: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, search, status } = input;
      const skip = (page - 1) * limit;

      const where: any = {};
      
      if (status && status !== "ALL") {
        where.status = status;
      }
      
      if (search) {
        where.OR = [
          { user: { name: { contains: search, mode: "insensitive" } } },
          { user: { email: { contains: search, mode: "insensitive" } } },
          { id: { contains: search, mode: "insensitive" } },
        ];
      }

      const [items, total] = await Promise.all([
        ctx.db.withdrawal.findMany({
          where,
          include: {
            user: { select: { name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        ctx.db.withdrawal.count({ where }),
      ]);

      const totalIncomeResult = await ctx.db.withdrawal.aggregate({
        where: { status: "SUCCEEDED" },
        _sum: { feeAmount: true },
      });

      const adminWithdrawnResult = await ctx.db.withdrawal.aggregate({
        where: { 
            userId: ctx.session.user.id,
            status: { in: ["PENDING", "ACCEPTED", "REQUESTED", "SUCCEEDED"] }
        },
        _sum: { amount: true },
      });

      const totalIncome = Number(totalIncomeResult._sum.feeAmount ?? 0);
      const adminWithdrawn = Number(adminWithdrawnResult._sum.amount ?? 0);
      const balance = Math.max(0, totalIncome - adminWithdrawn);

      const totalTransactions = await ctx.db.withdrawal.count();

      return {
        items,
        total,
        totalPages: Math.ceil(total / limit),
        stats: {
          totalIncome,
          totalTransactions,
          balance,
          incomeChange: 0,
          transactionsChange: 0,
        },
      };
    }),
});
