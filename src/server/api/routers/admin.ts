import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "../trpc";
import { getAdminBalance } from "~/lib/balance";
import { withdrawalSchema } from "~/lib/validation";
import { createPayout as createXenditPayout, simulatePayoutSuccess } from "~/lib/xendit";
import { WithdrawalStatus } from "../../../../prisma/generated/prisma";

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

      // ← Pakai getAdminBalance, bukan aggregate manual
      const { balance, totalFeeEarned } = await getAdminBalance(ctx.db);

      const totalTransactions = await ctx.db.withdrawal.count();

      return {
        items,
        total,
        totalPages: Math.ceil(total / limit),
        stats: {
          totalIncome: totalFeeEarned, // total fee yang pernah masuk
          balance,                     // saldo admin yang bisa ditarik
          totalTransactions,
          incomeChange: 0,
          transactionsChange: 0,
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
            email: input.email,
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
});