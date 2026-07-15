import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "../trpc";
import { getAdminBalance } from "~/lib/balance";
import { withdrawalSchema } from "~/lib/validation";
import { createPayout as createXenditPayout, simulatePayoutSuccess } from "~/lib/xendit";
import { WithdrawalStatus } from "../../../../prisma/generated/prisma";
import { TRPCError } from "@trpc/server";
import { sendWithdrawalEmail } from "~/lib/email";
import { createNotification } from "~/lib/notification";

const BANK_OPTIONS = {
  bca: { name: "BCA", channelCode: "ID_BCA" },
  bni: { name: "BNI", channelCode: "ID_BNI" },
  bri: { name: "BRI", channelCode: "ID_BRI" },
  mandiri: { name: "Mandiri", channelCode: "ID_MANDIRI" },
  cimb: { name: "CIMB Niaga", channelCode: "ID_CIMB" },
  bsi: { name: "BSI", channelCode: "ID_BSI" },
} as const;

export const adminRouter = createTRPCRouter({
  // ─── GET WITHDRAWALS (semua kreator) ───────────────────────────────────────
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

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const [
        items,
        total,
        { balance, totalFeeEarned },
        totalTransactions,
        currentIncomeStats,
        previousIncomeStats,
        currentTransactions,
        previousTransactions,
      ] = await Promise.all([
        ctx.db.withdrawal.findMany({
          where,
          include: {
            user: { select: { id: true, name: true, email: true, role: true } },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        ctx.db.withdrawal.count({ where }),
        getAdminBalance(ctx.db),
        ctx.db.withdrawal.count(),
        ctx.db.balanceEntry.aggregate({
          where: { 
            user: { role: "ADMIN" }, 
            type: { in: ["PLATFORM_FEE_EARNED", "WITHDRAWAL_REVERSED"] }, 
            createdAt: { gte: thirtyDaysAgo } 
          },
          _sum: { amount: true },
        }),
        ctx.db.balanceEntry.aggregate({
          where: { 
            user: { role: "ADMIN" }, 
            type: { in: ["PLATFORM_FEE_EARNED", "WITHDRAWAL_REVERSED"] }, 
            createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } 
          },
          _sum: { amount: true },
        }),
        ctx.db.withdrawal.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
        ctx.db.withdrawal.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
      ]);

      const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      return {
        items,
        total,
        totalPages: Math.ceil(total / limit),
        stats: {
          totalIncome: totalFeeEarned,
          balance,
          totalTransactions,
          incomeChange: calculateChange(
            Number(currentIncomeStats._sum.amount ?? 0),
            Number(previousIncomeStats._sum.amount ?? 0)
          ),
          transactionsChange: calculateChange(currentTransactions, previousTransactions),
        },
      };
    }),

  // ─── ADMIN WITHDRAW ────────────────────────────────────────────────────────
  adminWithdraw: adminProcedure
    .input(withdrawalSchema)
    .mutation(async ({ ctx, input }) => {
      const adminId = ctx.session.user.id;
      const bank = BANK_OPTIONS[input.bank];
      const TRANSFER_FEE = 4000;

      const adminReceives = input.amount - TRANSFER_FEE;

      if (adminReceives < 10000) {
        throw new Error(
          `Jumlah yang diterima terlalu kecil. Minimal diterima Rp10.000 setelah dipotong biaya transfer.`,
        );
      }

      // Step 1: cek saldo + buat withdrawal + debit ledger — atomic
      const withdrawal = await ctx.db.$transaction(async (tx) => {
        const { balance } = await getAdminBalance(tx);

        if (input.amount > balance) {
          throw new Error(
            `Saldo fee tidak cukup. Tersedia: Rp${balance.toLocaleString("id-ID")}`,
          );
        }

        const newWithdrawal = await tx.withdrawal.create({
          data: {
            userId: adminId,
            amount: input.amount,
            feeAmount: 0, // admin tidak kena fee platform
            bankCode: bank.channelCode,
            bankName: bank.name,
            accountNumber: input.accountNumber,
            accountHolderName: input.accountHolderName,
            email: ctx.session.user.email ?? "",
            referenceId: `ADMIN-${adminId.slice(0, 5)}-${Date.now()}`,
          },
        });

        // Debit saldo admin
        await tx.balanceEntry.create({
          data: {
            userId: adminId,
            amount: -Math.abs(input.amount),
            type: "ADMIN_WITHDRAWAL_REQUESTED",
            refId: newWithdrawal.id,
            note: `Admin withdrawal ke ${bank.name} - ${input.accountNumber}`,
          },
        });

        return newWithdrawal;
      });

      // Step 2: panggil Xendit
      try {
        const payout = await createXenditPayout({
          referenceId: withdrawal.id,
          amount: adminReceives,
          channelCode: bank.channelCode,
          accountNumber: input.accountNumber,
          accountHolderName: input.accountHolderName,
          description: `Admin withdrawal CuanIN ${bank.name} - ${withdrawal.id}`,
        });

        const updated = await ctx.db.withdrawal.update({
          where: { id: withdrawal.id },
          data: {
            xenditPayoutId: payout.id,
            referenceId: withdrawal.id,
            status:
              payout.status === "REQUESTED"
                ? WithdrawalStatus.REQUESTED
                : WithdrawalStatus.ACCEPTED,
            failureCode: payout.failure_code ?? null,
          },
        });

        if (process.env.ENABLE_PAYOUT_SIMULATE === "true") {
          setTimeout(() => {
            void simulatePayoutSuccess(payout.id, withdrawal.id).catch((err) =>
              console.error("❌ Simulate admin payout error:", err),
            );
          }, 3000);
        }

        return updated;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Gagal membuat payout";

        // Rollback: kredit balik saldo admin
        await ctx.db.$transaction([
          ctx.db.withdrawal.update({
            where: { id: withdrawal.id },
            data: {
              status: WithdrawalStatus.FAILED,
              failureMessage: errorMessage,
            },
          }),
          ctx.db.balanceEntry.create({
            data: {
              userId: adminId,
              amount: Math.abs(input.amount),
              type: "ADMIN_WITHDRAWAL_REQUESTED", // positif = kredit balik
              refId: withdrawal.id,
              note: `Rollback admin withdrawal: ${errorMessage}`,
            },
          }),
        ]);

        throw new Error(errorMessage);
      }
    }),

  // mark as paid
  markWithdrawalPaid: adminProcedure
    .input(z.object({ withdrawalId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const withdrawal = await ctx.db.withdrawal.findUnique({
        where: { id: input.withdrawalId },
      });

      if (!withdrawal) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Withdrawal tidak ditemukan" });
      }

      if (withdrawal.status === WithdrawalStatus.SUCCEEDED) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Withdrawal sudah ditandai berhasil" });
      }

      const updated = await ctx.db.$transaction(async (tx) => {
        const updatedWd = await tx.withdrawal.update({
          where: { id: input.withdrawalId },
          data: {
            status: WithdrawalStatus.SUCCEEDED,
            paidAt: new Date(),
          },
        });

        const platformFee = Number(withdrawal.feeAmount ?? 0);
        if (platformFee > 0) {
          const admin = await tx.user.findFirst({ where: { role: "ADMIN" } });
          if (admin) {
            await tx.balanceEntry.create({
              data: {
                userId: admin.id,
                amount: platformFee,
                type: "PLATFORM_FEE_EARNED",
                refId: withdrawal.id,
                note: `Platform fee untuk penarikan ${withdrawal.id}`,
              },
            });
          }
        }

        return updatedWd;
      });

      // Kirim notifikasi ke creator
      try {
        await createNotification(ctx.db, {
          userId: withdrawal.userId,
          type: "WITHDRAWAL",
          title: "Penarikan Saldo Berhasil",
          message: `Penarikan saldo sebesar Rp${Number(withdrawal.amount).toLocaleString("id-ID")} ke ${withdrawal.bankName} ${withdrawal.accountNumber} telah berhasil.`,
          refId: withdrawal.id,
        });
      } catch (notifError) {
        console.error("❌ Gagal kirim notifikasi:", notifError);
      }

      try {
        await sendWithdrawalEmail({
          email: withdrawal.email,
          amount: Number(withdrawal.amount),
          feeAmount: Number(withdrawal.feeAmount ?? 0),
          bankName: withdrawal.bankName,
          accountNumber: withdrawal.accountNumber,
          accountHolderName: withdrawal.accountHolderName,
        });
      } catch (emailError) {
        console.error("Email gagal dikirim:", emailError);
      }

      return updated;
    }),

  // mark as failed / rejected
  markWithdrawalFailed: adminProcedure
    .input(z.object({ withdrawalId: z.string(), failureMessage: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const withdrawal = await ctx.db.withdrawal.findUnique({
        where: { id: input.withdrawalId },
      });

      if (!withdrawal) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Withdrawal tidak ditemukan" });
      }

      if (withdrawal.status !== WithdrawalStatus.PENDING && withdrawal.status !== WithdrawalStatus.REQUESTED && withdrawal.status !== WithdrawalStatus.ACCEPTED) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Status withdrawal tidak dapat ditolak" });
      }

      const updated = await ctx.db.$transaction(async (tx) => {
        // Update status withdrawal
        const updatedWd = await tx.withdrawal.update({
          where: { id: input.withdrawalId },
          data: {
            status: WithdrawalStatus.FAILED,
            failureMessage: input.failureMessage ?? "Ditolak oleh Admin",
          },
        });

        // Refund saldo kreator (amount sudah termasuk feeAmount saat debet di withdrawalsRouter)
        // Kita kreditkan kembali ke kreator menggunakan amount
        await tx.balanceEntry.create({
          data: {
            userId: withdrawal.userId,
            amount: Number(withdrawal.amount), // Refund penuh
            type: "WITHDRAWAL_FAILED",
            refId: withdrawal.id,
            note: `Pengembalian dana penarikan gagal: ${input.failureMessage ?? "Ditolak oleh Admin"}`,
          },
        });

        // Kirim notifikasi ke creator (via Pusher agar real-time + sound)
        await createNotification(tx, {
          userId: withdrawal.userId,
          type: "WITHDRAWAL",
          title: "Penarikan Saldo Gagal",
          message: `Penarilan saldo sebesar Rp${Number(withdrawal.amount).toLocaleString("id-ID")} ditolak. Saldo telah dikembalikan.`,
          refId: withdrawal.id,
        });

        return updatedWd;
      });

      return updated;
    }),

});