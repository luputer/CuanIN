"use client";

import React from "react";
import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import { calculatePaymentFee } from "~/lib/utils";
import { env } from "~/env";
import Script from "next/script";
import { toast } from "sonner";
import { CatalogNavHeader, CatalogNavHeaderSkeleton } from "~/components/layout/catalog-nav-header";
import { PaymentDetailsCard } from "~/components/payment/payment-details-card";
import { PaymentMethodInfoCard } from "~/components/payment/payment-method-info-card";
import { OrderSummaryCard } from "~/components/payment/order-summary-card";

declare global {
  interface Window {
    snap: any;
  }
}

export default function PaymentPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: purchase, isLoading } = api.purchases.getById.useQuery({ id });

  const createMidtransTransaction = api.purchases.createMidtransTransaction.useMutation({
    onSuccess: (data) => {
      if (window.snap) {
        window.snap.pay(data.token, {
          onSuccess: function () {
            window.location.href = `/payment/success?id=${purchase!.id}`;
          },
          onPending: function () {
            window.location.href = `/payment/success?id=${purchase!.id}`;
          },
          onError: function (_result: any) {
            toast.error("Pembayaran gagal atau dibatalkan.");
          },
          onClose: function () {
            toast.info("Tunggu sebentar, pembayaran belum diselesaikan.");
          },
        });
      } else {
        toast.error("Gagal memuat sistem pembayaran Midtrans.");
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 animate-pulse">
        <CatalogNavHeaderSkeleton />
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="mb-8 h-9 w-36 rounded-xl bg-slate-200" />
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-5">
            <div className="space-y-6 lg:col-span-3">
              <div className="h-64 w-full rounded-xl bg-slate-200" />
              <div className="h-40 w-full rounded-xl bg-slate-200" />
            </div>
            <div className="space-y-6 lg:col-span-2">
              <div className="h-96 w-full rounded-xl bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">Transaksi tidak ditemukan</p>
      </div>
    );
  }

  const price = Number(purchase.amount);
  const fee = calculatePaymentFee("midtrans", price) ?? 0;

  const handlePay = () => {
    createMidtransTransaction.mutate({
      purchaseId: purchase.id,
    });
  };

  const catalogSlug = purchase.product.user?.catalog?.slug;
  const productSlug = purchase.product.slug;

  return (
    <div className="min-h-screen bg-slate-50">
      <Script
        src={
          env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "false"
            ? "https://app.sandbox.midtrans.com/snap/snap.js"
            : "https://app.midtrans.com/snap/snap.js"
        }
        data-client-key={env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />

      {/* HEADER */}
      <CatalogNavHeader backHref={`/${catalogSlug}/${productSlug}`} />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-8 text-3xl font-bold text-slate-800">Selesaikan Pembayaran</h1>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-5">
          {/* KIRI */}
          <div className="w-full min-w-0 space-y-6 lg:col-span-3 lg:pb-12">
            <PaymentDetailsCard
              buyerName={purchase.buyerName}
              buyerEmail={purchase.buyerEmail}
              buyerPhone={purchase.buyerPhone}
            />
            <PaymentMethodInfoCard />
          </div>

          {/* KANAN */}
          <div className="w-full min-w-0 space-y-6 lg:sticky lg:top-24 lg:col-span-2 lg:h-fit lg:self-start">
            <OrderSummaryCard
              price={price}
              fee={fee}
              handlePay={handlePay}
              isPending={createMidtransTransaction.isPending}
            />
          </div>
        </div>
      </div>
    </div>
  );
}