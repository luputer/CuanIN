import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { sendProductEmail, sendWithdrawalEmail } from "~/lib/nodemailer";
import { env } from "~/env";

export async function POST(req: NextRequest) {
  const token = req.headers.get("x-callback-token");
  if (token !== env.XENDIT_WEBHOOK_TOKEN) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    event?: string;
    data?: {
      id: string;
      reference_id: string;
      status: string;
      failure_code?: string;
    };
    external_id?: string;
    status?: string;
    payment_method?: string;
    id: string;
  };

  // Payouts v2 webhook
  if (body.event?.startsWith("payout.") && body.data) {
    const payout = body.data;

    const status =
      payout.status === "SUCCEEDED"
        ? "SUCCEEDED"
        : payout.status === "FAILED"
          ? "FAILED"
          : payout.status === "REVERSED"
            ? "REVERSED"
            : payout.status === "REQUESTED"
              ? "REQUESTED"
              : "ACCEPTED";

    // CARI DATA DENGAN LEBIH TELITI:
    // Kita cek ke id (PK), referenceId, atau xenditPayoutId
    const withdrawal = await db.withdrawal.findFirst({
      where: {
        OR: [
          { id: payout.reference_id }, // Cek jika reference_id adalah Primary Key (UUID)
          { referenceId: payout.reference_id }, // Cek jika reference_id adalah string custom
          { xenditPayoutId: payout.id }, // Cek berdasarkan ID dari Xendit
        ],
      },
    });

    if (!withdrawal) {
      console.error("[Webhook Xendit] Withdrawal not found for reference_id:", payout.reference_id);
      return NextResponse.json(
        { message: "Withdrawal not found" },
        { status: 404 },
      );
    }

    const previousStatus = withdrawal.status;

    await db.withdrawal.update({
      where: { id: withdrawal.id },
      data: {
        status,
        xenditPayoutId: payout.id,
        // Jika kita berhasil menemukan berdasarkan ID, sinkronkan referenceId-nya juga
        referenceId: withdrawal.id === payout.reference_id ? withdrawal.id : withdrawal.referenceId,
        failureCode: payout.failure_code ?? null,
      },
    });

    // Kirim email jika status baru SUCCEEDED dan sebelumnya belum SUCCEEDED
    if (status === "SUCCEEDED" && previousStatus !== "SUCCEEDED") {
      try {
        await sendWithdrawalEmail({
          email: withdrawal.email,
          amount: Number(withdrawal.amount),
          bankName: withdrawal.bankName,
          accountNumber: withdrawal.accountNumber,
          accountHolderName: withdrawal.accountHolderName,
        });
      } catch (err) {
        console.error("Failed to send withdrawal email:", err);
      }
    }

    return NextResponse.json({ message: "OK" });
  }

  // Payment / Invoice webhook
  if (body.status !== "PAID") {
    return NextResponse.json({ message: "Ignored" });
  }

  if (!body.external_id) {
    return NextResponse.json(
      { message: "Missing external_id" },
      { status: 400 },
    );
  }

  const purchaseId = body.external_id.split("__")[0] ?? body.external_id;

  const purchase = await db.purchase.findUnique({
    where: { id: purchaseId },
    include: {
      product: { select: { name: true, link: true } },
    },
  });

  if (!purchase) {
    return NextResponse.json(
      { message: "Purchase not found" },
      { status: 404 },
    );
  }

  await db.purchase.update({
    where: { id: purchase.id },
    data: {
      status: "completed",
      xenditPaymentMethod: body.payment_method,
      paidAt: new Date(),
    },
  });

  if (purchase.product.link) {
    await sendProductEmail({
      buyerEmail: purchase.buyerEmail,
      productName: purchase.product.name,
      productLink: purchase.product.link,
    });
  }

  return NextResponse.json({ message: "OK" });
}
