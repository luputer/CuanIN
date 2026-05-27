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

// Hitung Admin Balence (Global untuk semua Admin)
export async function getAdminBalance(
  db: PrismaClient | TxClient,
): Promise<{ totalFeeEarned: number; totalWithdrawn: number; balance: number }> {
  const [earned, withdrawn] = await Promise.all([
    // Fee yang masuk dari setiap withdrawal creator (masuk ke siapapun adminnya)
    db.balanceEntry.aggregate({
      where: {
        user: { role: "ADMIN" },
        type: "PLATFORM_FEE_EARNED",
        amount: { gt: 0 },
      },
      _sum: { amount: true },
    }),
    // Total yang sudah ditarik oleh semua admin
    db.balanceEntry.aggregate({
      where: {
        user: { role: "ADMIN" },
        amount: { lt: 0 },
      },
      _sum: { amount: true },
    }),
  ]);

  const totalFeeEarned = Math.max(Number(earned._sum.amount ?? 0), 0);
  const totalWithdrawn = Math.abs(Number(withdrawn._sum.amount ?? 0));
  const balance = Math.max(totalFeeEarned - totalWithdrawn, 0);

  return { totalFeeEarned, totalWithdrawn, balance };
}