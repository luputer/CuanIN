"use client";
import { useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";
import { SpinnerIcon, ClockIcon, ArrowCounterClockwiseIcon } from "@phosphor-icons/react";
import { Suspense } from "react";
import { PaymentBrandHeader } from "~/components/payment/payment-brand-header";
import { PaymentStatusSection } from "~/components/payment/payment-status-section";
import { TransactionDetailsCard } from "~/components/payment/transaction-details-card";
import { PaymentActionAndSecurity } from "~/components/payment/payment-action-and-security";

const TYPE_MAP: Record<string, string> = {
  WEBINAR: "Webinar",
  KELAS_ONLINE: "Kelas",
  DIGITAL_PRODUCT: "Produk Digital",
};

function PaymentPendingContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";

  const { data: purchase, isLoading } = api.purchases.getById.useQuery(
    { id },
    { enabled: !!id },
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10 animate-pulse">
        <div className="w-full max-w-md space-y-4">
          <div className="flex items-center justify-start gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-slate-200" />
            <div className="h-7 w-24 rounded-xl bg-slate-200" />
          </div>
          <div className="rounded-xl border border-slate-300 bg-white p-6 sm:p-8 flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-200 mb-4" />
            <div className="h-8 w-48 rounded-xl bg-slate-200 mb-2" />
            <div className="h-4 w-64 rounded-xl bg-slate-200" />
          </div>
          <div className="rounded-xl border border-slate-300 bg-white p-6">
            <div className="h-6 w-32 rounded-xl bg-slate-200 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="h-4 w-20 rounded-xl bg-slate-200" />
                  <div className="h-4 w-28 rounded-xl bg-slate-200" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-4">
        <PaymentBrandHeader
          userImage={purchase?.product?.user?.image}
          userName={purchase?.product?.user?.name}
        />

        <PaymentStatusSection
          icon={
            <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
              <ClockIcon className="w-10 h-10 text-yellow-500" weight="fill" />
            </div>
          }
          title="Menunggu Pembayaran"
          message="Pembayaranmu sedang diproses. Silakan selesaikan pembayaran sesuai metode yang dipilih."
        >
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 w-full text-left mt-2">
            <p className="text-sm font-semibold text-yellow-700">Cara menyelesaikan:</p>
            <ul className="text-xs text-yellow-600 mt-2 space-y-1 list-disc list-inside">
              <li>Transfer ke nomor VA yang tertera</li>
              <li>Scan QRIS dari aplikasi e-wallet</li>
              <li>Atau selesaikan di e-wallet kamu</li>
            </ul>
            <p className="text-xs text-yellow-600 mt-2 italic">
              Status akan otomatis berubah setelah pembayaran diterima.
            </p>
          </div>
        </PaymentStatusSection>

        {purchase && (
          <TransactionDetailsCard
            purchase={purchase}
            TYPE_MAP={TYPE_MAP}
            statusMessage={<span className="text-yellow-600 font-medium">⏳ Menunggu</span>}
          />
        )}

        <a
          href={`/payment/${id}`}
          className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition"
        >
          <ArrowCounterClockwiseIcon className="w-4 h-4" />
          Coba Bayar Lagi
        </a>

        <PaymentActionAndSecurity />
      </div>
    </div>
  );
}

export default function PaymentPendingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <SpinnerIcon className="w-8 h-8 animate-spin text-cyan-600" />
        </div>
      }
    >
      <PaymentPendingContent />
    </Suspense>
  );
}
