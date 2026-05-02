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

    const withdrawal = await db.withdrawal.findFirst({
      where: {
        OR: [
          { referenceId: payout.reference_id },
          { xenditPayoutId: payout.id },
        ],
      },
    });

    if (!withdrawal) {
      console.error("Withdrawal not found");
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
        failureCode: payout.failure_code ?? null,
      },
    });

    // Kirim email jika status baru SUCCEEDED dan sebelumnya belum SUCCEEDED
    if (status === "SUCCEEDED" && previousStatus !== "SUCCEEDED") {
      console.log("Sending withdrawal email to", withdrawal.email);
      try {
        const emailResult = await sendWithdrawalEmail({
          email: withdrawal.email,
          amount: Number(withdrawal.amount),
          bankName: withdrawal.bankName,
          accountNumber: withdrawal.accountNumber,
          accountHolderName: withdrawal.accountHolderName,
        });
        console.log("Email result:", emailResult);
      } catch (err) {
        console.error("Failed to send email inside webhook:", err);
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

  let emailSent = false;
  let emailError: unknown = null;

  if (purchase.product.link) {
    const emailResult = await sendProductEmail({
      buyerEmail: purchase.buyerEmail,
      productName: purchase.product.name,
      productLink: purchase.product.link,
    });

    emailSent = emailResult.success;
    emailError = emailResult.success ? null : emailResult.error;
  }

  return NextResponse.json({
    message: "OK",
    emailSent,
    emailError: emailError ? "Failed to send email" : null,
  });
}
