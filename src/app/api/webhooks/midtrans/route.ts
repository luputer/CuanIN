import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { sendProductEmail } from "~/lib/email";
import { env } from "~/env";
import crypto from "crypto";
import { nanoid } from "nanoid";

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
    const bank = body.bank as string | undefined;
    const va_number = body.va_number as string | undefined;

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
        const bankName = bankLabelMap[bank] ?? bank.toUpperCase();
        return va_number ? `Midtrans: ${bankName} VA (${va_number})` : `Midtrans: ${bankName} Virtual Account`;
      }
      if (payment_type === "echannel" && va_number) {
        return `Midtrans: Mandiri Bill (${va_number})`;
      }
      if (payment_type === "credit_card") {
        return "Midtrans: Kartu Kredit";
      }
      if (payment_type === "gopay") return "Midtrans: GoPay";
      if (payment_type === "shopeepay") return "Midtrans: ShopeePay";
      if (payment_type === "qris") return "Midtrans: QRIS";
      return `Midtrans: ${payment_type}`;
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
            xenditPaymentMethod: buildPaymentLabel(),
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

        // Create portal access if product has portal enabled
        if (purchase.product.portalEnabled && purchase.product.user?.catalog?.slug) {
          const token = nanoid(16);
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
          await tx.portalAccess.upsert({
            where: {
              buyerEmail_creatorId: {
                buyerEmail: purchase.buyerEmail.toLowerCase(),
                creatorId: purchase.product.userId,
              },
            },
            update: { token, expiresAt },
            create: {
              token,
              buyerEmail: purchase.buyerEmail.toLowerCase(),
              creatorId: purchase.product.userId,
              expiresAt,
            },
          });
          portalUrl = `${env.NEXT_PUBLIC_APP_URL}/portal/${purchase.product.user.catalog.slug}?token=${token}`;
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