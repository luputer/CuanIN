import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createPayout as createXenditPayout, simulatePayoutSuccess } from "~/lib/xendit";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  WithdrawalStatus,
  type PrismaClient,
} from "../../../../prisma/generated/prisma";

const BANK_OPTIONS = {
  bca: { name: "BCA", channelCode: "ID_BCA" },
  bni: { name: "BNI", channelCode: "ID_BNI" },
  bri: { name: "BRI", channelCode: "ID_BRI" },
  mandiri: { name: "Mandiri", channelCode: "ID_MANDIRI" },
  cimb: { name: "CIMB Niaga", channelCode: "ID_CIMB" },
  bsi: { name: "BSI", channelCode: "ID_BSI" },
} as const;

const WITHDRAWAL_DEDUCTING_STATUSES = [
  WithdrawalStatus.PENDING,
  WithdrawalStatus.ACCEPTED,
  WithdrawalStatus.REQUESTED,
  WithdrawalStatus.SUCCEEDED,
];

async function getCreatorBalance(
  db: PrismaClient | Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
  userId: string,
) {
  const products = await db.product.findMany({
    where: { userId },
    select: { id: true },
  });
  const productIds = products.map((product) => product.id);

  if (productIds.length === 0) {
    return { totalIncome: 0, totalWithdrawn: 0, balance: 0 };
  }

  const [completedPurchases, activeWithdrawals] = await Promise.all([
    db.purchase.findMany({
      where: { productId: { in: productIds }, status: "completed" },
      select: { amount: true },
    }),
    db.withdrawal.findMany({
      where: {
        userId,
        status: { in: WITHDRAWAL_DEDUCTING_STATUSES },
      },
      select: { amount: true },
    }),
  ]);

  const totalIncome = completedPurchases.reduce(
    (acc, purchase) => acc + Number(purchase.amount),
    0,
  );
  const totalWithdrawn = activeWithdrawals.reduce(
    (acc, withdrawal) => acc + Number(withdrawal.amount),
    0,
  );

  return {
    totalIncome,
    totalWithdrawn,
    balance: Math.max(totalIncome - totalWithdrawn, 0),
  };
}

export const withdrawalsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        amount: z.coerce.number().int().positive(),
        bank: z.enum(["bca", "bni", "bri", "mandiri", "cimb", "bsi"]),
        accountNumber: z.string().min(5, "Nomor rekening wajib diisi"),
        accountHolderName: z
          .string()
          .min(2, "Nama pemilik rekening wajib diisi"),
        email: z.string().email("Email tidak valid"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const withdrawal = await ctx.db.$transaction(async (tx) => {
        const balance = await getCreatorBalance(tx, ctx.session.user.id);

        if (input.amount > balance.balance) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Jumlah penarikan melebihi saldo tersedia.",
          });
        }

        const bank = BANK_OPTIONS[input.bank];

        return await tx.withdrawal.create({
          data: {
            userId: ctx.session.user.id,
            amount: input.amount,
            bankCode: bank.channelCode,
            bankName: bank.name,
            accountNumber: input.accountNumber,
            accountHolderName: input.accountHolderName,
            email: input.email,
            referenceId: "TEMP-" + ctx.session.user.id.slice(0, 5) + "-" + Date.now().toString(),
          },
        });
      });

      try {
        const bank = BANK_OPTIONS[input.bank];
        const payout = await createXenditPayout({
          referenceId: withdrawal.id,
          amount: input.amount,
          channelCode: bank.channelCode,
          accountNumber: input.accountNumber,
          accountHolderName: input.accountHolderName,
          description: "Penarikan saldo CuanIN " + bank.name + " - " + withdrawal.id,
        });

        const updated = await ctx.db.withdrawal.update({
          where: { id: withdrawal.id },
          data: {
            xenditPayoutId: payout.id,
            referenceId: withdrawal.id,
            status: payout.status === "REQUESTED" ? "REQUESTED" : "ACCEPTED",
            failureCode: payout.failure_code,
          },
        });

        // withdrawalsRouter.ts — hapus bagian ini
        if (process.env.ENABLE_PAYOUT_SIMULATE === "true") {
          setTimeout(() => {
            void simulatePayoutSuccess(payout.id, withdrawal.id).catch((err) =>
              console.error("❌ Simulate payout error:", err),
            );
          }, 3000);
        }
        return updated;
      } catch (error) {
        await ctx.db.withdrawal.update({
          where: { id: withdrawal.id },
          data: {
            status: "FAILED",
            failureMessage:
              error instanceof Error ? error.message : "Gagal membuat payout",
          },
        });

        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            error instanceof Error ? error.message : "Gagal membuat payout",
        });
      }
    }),
}); 