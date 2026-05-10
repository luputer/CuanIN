import type { PrismaClient } from "../../prisma/generated/prisma";

export type TxClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

/**
 * Hitung balance creator dari ledger (aggregate SUM di DB).
 * Aman dipanggil di dalam atau luar transaksi Prisma.
 */
export async function getCreatorBalance(
  db: PrismaClient | TxClient,
  userId: string,
): Promise<{ totalIncome: number; totalWithdrawn: number; balance: number }> {
  const [credits, debits] = await Promise.all([
    db.balanceEntry.aggregate({
      where: { userId, amount: { gt: 0 } },
      _sum: { amount: true },
    }),
    db.balanceEntry.aggregate({
      where: { userId, amount: { lt: 0 } },
      _sum: { amount: true },
    }),
  ]);

  const totalIncome = Math.max(Number(credits._sum.amount ?? 0), 0);
  const totalWithdrawn = Math.abs(Number(debits._sum.amount ?? 0));
  const balance = Math.max(totalIncome - totalWithdrawn, 0);

  return { totalIncome, totalWithdrawn, balance };
}
