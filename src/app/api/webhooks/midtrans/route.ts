import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { sendProductEmail } from "~/lib/email";
import { env } from "~/env";
import crypto from "crypto";

export async function GET() {
  return NextResponse.json({ message: "Midtrans Webhook endpoint is active" });
}

export async function POST(req: NextRequest) {
  try {
    let body: Record<string, unknown>;
    try {
      body = await req.json() as Record<string, unknown>;
    } catch {
      console.log("[Midtrans Webhook] Received empty or invalid JSON body");
      return NextResponse.json({ message: "Empty body" }, { status: 200 });
    }

    console.log("[Midtrans Webhook] Received:", JSON.stringify(body, null, 2));

    const transaction_status = body.transaction_status as string;
    const order_id = body.order_id as string;
    const gross_amount = body.gross_amount as string;
    const signature_key = body.signature_key as string;
    const status_code = body.status_code as string;
    const payment_type = body.payment_type as string;

    const vaNumbers = body.va_numbers as Array<{ bank: string; va_number: string }> | undefined;
    const bank = (body.bank as string | undefined)
      ?? vaNumbers?.[0]?.bank
      ?? (body.payment_type === "echannel" ? "mandiri" : undefined);
    const vaNumber = (body.va_number as string | undefined)
      ?? vaNumbers?.[0]?.va_number
      ?? (body.bill_key as string | undefined)
      ?? undefined;

    console.log("[Midtrans Webhook] Extracted — bank:", bank, "vaNumber:", vaNumber, "va_numbers:", JSON.stringify(vaNumbers));

    const bankLabelMap: Record<string, string> = {
      bca: "BCA",
      bni: "BNI",
      bri: "BRI",
      mandiri: "Mandiri",
      permata: "Permata",
      bsi: "BSI",
      cimb: "CIMB",
      danamon: "Danamon",
      mega: "Mega",
      bukopin: "Bukopin",
      hanabank: "Hana",
      akulaku: "Akulaku",
      mybank: "MyBank",
      uob: "UOB",
    };

    function buildPaymentLabel() {
      if (payment_type === "bank_transfer" && bank) {
        return bankLabelMap[bank] ?? bank.toUpperCase();
      }
      if (payment_type === "echannel") {
        return "Mandiri";
      }
      if (payment_type === "credit_card") {
        return "Kartu Kredit";
      }
      if (payment_type === "gopay") return "GoPay";
      if (payment_type === "shopeepay") return "ShopeePay";
      if (payment_type === "qris") return "QRIS";
      return payment_type;
    }

    if (!signature_key || !order_id) {
      console.log("[Midtrans Webhook] Ping detected (no signature or order_id)");
      return NextResponse.json({ message: "Ping received" }, { status: 200 });
    }

    // ─── VERIFY SIGNATURE ─────────────────────────────────────────────────────
    const verifyString = order_id + status_code + gross_amount + (env.MIDTRANS_SERVER_KEY ?? "");
    const expectedSignature = crypto
      .createHash("sha512")
      .update(verifyString)
      .digest("hex");

    if (signature_key !== expectedSignature) {
      console.warn("[Midtrans Webhook] Invalid signature mismatch");
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    }

    // ─── PROCESS STATUS ───────────────────────────────────────────────────────
    const isCompleted =
      transaction_status === "settlement" ||
      (transaction_status === "capture" && status_code === "200");

    if (!isCompleted) {
      console.log("[Midtrans Webhook] Ignored status:", transaction_status);
      return NextResponse.json({ message: "Ignored status" });
    }

    const purchaseId = order_id.split("_")[0];
    if (!purchaseId || order_id.startsWith("payment_notif_test")) {
      console.log("[Midtrans Webhook] Test/Dummy notification detected:", order_id);
      return NextResponse.json({ message: "Test notification received" }, { status: 200 });
    }

    const purchase = await db.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        product: {
          select: {
            name: true,
            link: true,
            links: true,
            notes: true,
            userId: true,
            portalEnabled: true,
            user: {
              select: {
                name: true,
                catalog: {
                  select: { slug: true },
                },
              },
            },
          },
        },
      },
    });

    if (!purchase) {
      console.error("[Midtrans Webhook] Purchase not found:", purchaseId);
      return NextResponse.json({ message: "Purchase not found" }, { status: 404 });
    }

    // ─── UPDATE DATABASE (ATOMIC) ─────────────────────────────────────────────
    let portalUrl: string | null = null;
    try {
      await db.$transaction(async (tx) => {
        await tx.purchase.update({
          where: { id: purchase.id, status: "pending" },
          data: {
            status: "completed",
            paidAt: new Date(),
            paymentMethod: buildPaymentLabel(),
            paymentDetails: {
              paymentType: payment_type,
              bank: bank ?? null,
              vaNumber: vaNumber ?? null,
            },
          },
        });

        await tx.balanceEntry.create({
          data: {
            userId: purchase.product.userId,
            amount: purchase.amount,
            type: "PURCHASE_COMPLETED",
            refId: purchase.id,
            note: `Pembelian (Midtrans) dari ${purchase.buyerName} (${purchase.buyerEmail})`,
          },
        });

        // Point to new unified portal login page
        if (purchase.product.portalEnabled) {
          portalUrl = `${env.NEXT_PUBLIC_APP_URL}/portal/login`;
        }
      });
      console.log("[Midtrans Webhook] Success update purchase:", purchase.id);
    } catch {
      console.log("[Midtrans Webhook] Purchase already processed or failed to update:", purchase.id);
      return NextResponse.json({ message: "Already processed" });
    }

    // ─── SEND EMAIL ──────────────────────────────────────────────────────────
    if (purchase.product.link) {
      try {
        await sendProductEmail({
          buyerEmail: purchase.buyerEmail,
          productName: purchase.product.name,
          productLink: purchase.product.link,
          links: purchase.product.links as string[] | null,
          notes: purchase.product.notes,
          creatorName: purchase.product.user?.name ?? "Tim CuanIN",
          portalUrl,
        });
      } catch (error) {
        console.error("📧 Failed to send product email (Midtrans):", error);
      }
    }

    return NextResponse.json({ message: "OK" });
  } catch (error) {
    console.error("[Midtrans Webhook] Critical Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}