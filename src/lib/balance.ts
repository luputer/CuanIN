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
  const [incomeEntry, withdrawalEntry] = await Promise.all([
    // Pendapatan riil dari pembelian produk yang sukses
    db.balanceEntry.aggregate({
      where: {
        userId,
        type: "PURCHASE_COMPLETED",
      },
      _sum: { amount: true },
    }),
    // Mutasi penarikan saldo kreator (WITHDRAWAL_REQUESTED = negatif, WITHDRAWAL_FAILED = positif/refund)
    db.balanceEntry.aggregate({
      where: {
        userId,
        type: { in: ["WITHDRAWAL_REQUESTED", "WITHDRAWAL_FAILED"] },
      },
      _sum: { amount: true },
    }),
  ]);

  const totalIncome = Math.max(Number(incomeEntry._sum.amount ?? 0), 0);
  const totalWithdrawn = Math.abs(Math.min(Number(withdrawalEntry._sum.amount ?? 0), 0));
  const balance = Math.max(totalIncome - totalWithdrawn, 0);

  return { totalIncome, totalWithdrawn, balance };
}

// Hitung Admin Balence (Global untuk semua Admin)
export async function getAdminBalance(
  db: PrismaClient | TxClient,
): Promise<{ totalFeeEarned: number; totalWithdrawn: number; balance: number }> {
  const [earned, withdrawn] = await Promise.all([
    // Fee yang masuk dari setiap withdrawal creator (masuk ke siapapun adminnya), dikurangi reversal
    db.balanceEntry.aggregate({
      where: {
        user: { role: "ADMIN" },
        type: { in: ["PLATFORM_FEE_EARNED", "WITHDRAWAL_REVERSED"] },
      },
      _sum: { amount: true },
    }),
    // Total yang benar-benar ditarik oleh admin (penarikan dana admin asli)
    db.balanceEntry.aggregate({
      where: {
        user: { role: "ADMIN" },
        type: "ADMIN_WITHDRAWAL_REQUESTED",
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