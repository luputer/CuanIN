// src/app/api/webhook/xendit/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { sendProductEmail, sendWithdrawalEmail } from "~/lib/nodemailer";
import { env } from "~/env";
import { WithdrawalStatus } from "../../../../../prisma/generated/prisma";

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
      failure_message?: string;
    };
    external_id?: string;
    status?: string;
    payment_method?: string;
    id: string;
  };

  // ─── PAYOUT WEBHOOK (Withdrawal) ─────────────────────────────────────────
  if (body.event?.startsWith("payout.") && body.data) {
    const payout = body.data;

    const withdrawal = await db.withdrawal.findFirst({
      where: {
        OR: [
          { id: payout.reference_id },
          { referenceId: payout.reference_id },
          { xenditPayoutId: payout.id },
        ],
      },
    });

    if (!withdrawal) {
      console.error(
        "[Webhook] Withdrawal not found for reference_id:",
        payout.reference_id,
      );
      return NextResponse.json(
        { message: "Withdrawal not found" },
        { status: 404 },
      );
    }

    const previousStatus = withdrawal.status;

    // ── SUCCEEDED ──────────────────────────────────────────────────────────
    if (
      payout.status === "SUCCEEDED" &&
      previousStatus !== WithdrawalStatus.SUCCEEDED
    ) {
      await db.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          status: WithdrawalStatus.SUCCEEDED,
          xenditPayoutId: payout.id,
          failureCode: null,
        },
      });

      try {
        await sendWithdrawalEmail({
          email: withdrawal.email,
          amount: Number(withdrawal.amount),
          bankName: withdrawal.bankName,
          accountNumber: withdrawal.accountNumber,
          accountHolderName: withdrawal.accountHolderName,
        });
      } catch (err) {
        console.error("📧 Failed to send withdrawal email:", err);
      }

      return NextResponse.json({ message: "OK" });
    }

    // ── FAILED ─────────────────────────────────────────────────────────────
    if (
      payout.status === "FAILED" &&
      previousStatus !== WithdrawalStatus.FAILED
    ) {
      await db.$transaction([
        db.withdrawal.update({
          where: { id: withdrawal.id },
          data: {
            status: WithdrawalStatus.FAILED,
            xenditPayoutId: payout.id,
            failureCode: payout.failure_code ?? null,
            failureMessage: payout.failure_message ?? null,
          },
        }),
        db.balanceEntry.create({
          data: {
            userId: withdrawal.userId,
            amount: withdrawal.amount,
            type: "WITHDRAWAL_FAILED",
            refId: withdrawal.id,
            note: `Payout gagal: ${payout.failure_code ?? "UNKNOWN"} — saldo dikembalikan`,
          },
        }),
      ]);

      return NextResponse.json({ message: "OK" });
    }

    // ── REVERSED ───────────────────────────────────────────────────────────
    if (
      payout.status === "REVERSED" &&
      previousStatus !== WithdrawalStatus.REVERSED
    ) {
      await db.$transaction([
        db.withdrawal.update({
          where: { id: withdrawal.id },
          data: {
            status: WithdrawalStatus.REVERSED,
            xenditPayoutId: payout.id,
            failureCode: payout.failure_code ?? null,
          },
        }),
        db.balanceEntry.create({
          data: {
            userId: withdrawal.userId,
            amount: withdrawal.amount,
            type: "WITHDRAWAL_REVERSED",
            refId: withdrawal.id,
            note: `Payout di-reverse oleh Xendit: ${payout.failure_code ?? "-"}`,
          },
        }),
      ]);

      return NextResponse.json({ message: "OK" });
    }

    // ── REQUESTED / ACCEPTED — update status saja, tanpa ledger ───────────
    if (payout.status === "REQUESTED" || payout.status === "ACCEPTED") {
      const normalizedStatus =
        payout.status === "REQUESTED"
          ? WithdrawalStatus.REQUESTED
          : WithdrawalStatus.ACCEPTED;

      await db.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          status: normalizedStatus,
          xenditPayoutId: payout.id,
        },
      });
    }

    return NextResponse.json({ message: "OK" });
  }

  // ─── INVOICE WEBHOOK (Purchase) ───────────────────────────────────────────
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
    console.log("[Webhook] Purchase already completed:", purchase.id);
    return NextResponse.json({ message: "Already processed" });
  }

  await db.$transaction([
    db.purchase.update({
      where: { id: purchase.id },
      data: {
        status: "completed",
        xenditPaymentMethod: body.payment_method ?? null,
        paidAt: new Date(),
      },
    }),
    db.balanceEntry.create({
      data: {
        userId: purchase.product.userId,
        amount: purchase.amount,
        type: "PURCHASE_COMPLETED",
        refId: purchase.id,
        note: `Pembelian dari ${purchase.buyerName} (${purchase.buyerEmail})`,
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
      console.error("📧 Failed to send product email:", err);
    }
  }

  return NextResponse.json({ message: "OK" });
}