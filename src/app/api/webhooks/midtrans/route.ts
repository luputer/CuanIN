import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { sendProductEmail } from "~/lib/nodemailer";
import { env } from "~/env";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    transaction_status: string;
    order_id: string;
    gross_amount: string;
    signature_key: string;
    status_code: string;
    payment_type: string;
  };

  const {
    transaction_status,
    order_id,
    gross_amount,
    signature_key,
    status_code,
    payment_type,
  } = body;

  // ─── VERIFY SIGNATURE ─────────────────────────────────────────────────────
  // Midtrans signature key format: order_id + status_code + gross_amount + server_key
  const verifyString = order_id + status_code + gross_amount + env.MIDTRANS_SERVER_KEY;
  const expectedSignature = crypto
    .createHash("sha512")
    .update(verifyString)
    .digest("hex");

  if (signature_key !== expectedSignature) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  }

  // ─── PROCESS STATUS ───────────────────────────────────────────────────────
  // Midtrans status: capture, settlement, pending, deny, expire, cancel
  // For Snap/Core API, settlement or capture (for CC) means payment is completed.
  const isCompleted =
    transaction_status === "settlement" ||
    (transaction_status === "capture" && status_code === "200");

  if (!isCompleted) {
    return NextResponse.json({ message: "Ignored status" });
  }

  // order_id was created as `${purchase.id}_${Date.now().toString(36)}` in createMidtransTransaction
  const purchaseId = order_id.split("_")[0];

  if (!purchaseId) {
    return NextResponse.json(
      { message: "Missing purchaseId in order_id" },
      { status: 400 },
    );
  }

  const purchase = await db.purchase.findUnique({
    where: { id: purchaseId },
    include: {
      product: {
        select: {
          name: true,
          link: true,
          userId: true,
        },
      },
    },
  });

  if (!purchase) {
    return NextResponse.json(
      { message: "Purchase not found" },
      { status: 404 },
    );
  }

  if (purchase.status === "completed") {
    console.log("[Midtrans Webhook] Purchase already completed:", purchase.id);
    return NextResponse.json({ message: "Already processed" });
  }

  // ─── UPDATE DATABASE ──────────────────────────────────────────────────────
  await db.$transaction([
    db.purchase.update({
      where: { id: purchase.id },
      data: {
        status: "completed",
        paidAt: new Date(),
        // We reuse the xenditPaymentMethod field for now to store payment type info
        // as we don't want to change the schema yet.
        xenditPaymentMethod: `Midtrans: ${payment_type}`,
      },
    }),
    db.balanceEntry.create({
      data: {
        userId: purchase.product.userId,
        amount: purchase.amount,
        type: "PURCHASE_COMPLETED",
        refId: purchase.id,
        note: `Pembelian (Midtrans) dari ${purchase.buyerName} (${purchase.buyerEmail})`,
      },
    }),
  ]);

  if (purchase.product.link) {
    try {
      await sendProductEmail({
        buyerEmail: purchase.buyerEmail,
        productName: purchase.product.name,
        productLink: purchase.product.link,
      });
    } catch (err) {
      console.error("📧 Failed to send product email (Midtrans):", err);
    }
  }

  return NextResponse.json({ message: "OK" });
}
