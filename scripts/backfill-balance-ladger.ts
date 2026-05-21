import { PrismaClient } from "../prisma/generated/prisma";

const db = new PrismaClient();

async function main() {
  console.log("🔄 Backfill ledger dari purchase lama...");

  const completedPurchases = await db.purchase.findMany({
    where: { status: "completed" },
    include: { product: { select: { userId: true } } },
  });

  let skipped = 0;
  let created = 0;

  for (const purchase of completedPurchases) {
    const existing = await db.balanceEntry.findFirst({
      where: { refId: purchase.id, type: "PURCHASE_COMPLETED" },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await db.balanceEntry.create({
      data: {
        userId: purchase.product.userId,
        amount: purchase.amount,
        type: "PURCHASE_COMPLETED",
        refId: purchase.id,
        note: `[Backfill] Pembelian dari ${purchase.buyerName}`,
        createdAt: purchase.paidAt ?? purchase.createdAt,
      },
    });

    created++;
  }

  console.log(`✅ Selesai. Created: ${created}, Skipped: ${skipped}`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());