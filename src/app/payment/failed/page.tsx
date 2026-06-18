"use client";
import { useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";
import {
    SpinnerIcon,
} from "@phosphor-icons/react";
import { Suspense } from "react";
import { PaymentBrandHeader } from "~/components/payment/payment-brand-header";
import { PaymentStatusSection } from "~/components/payment/payment-status-section";
import { XCircleIcon } from "@phosphor-icons/react"; // Import XCircleIcon here for direct use in the icon prop
import { TransactionDetailsCard } from "~/components/payment/transaction-details-card";
import { PaymentActionAndSecurity } from "~/components/payment/payment-action-and-security";
function PaymentFailedContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id") ?? "";

    const { data: purchase, isLoading } = api.purchases.getById.useQuery(
        { id },
        { enabled: !!id }
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10 animate-pulse">
                <div className="w-full max-w-md space-y-4">
                    {/* BRAND SKELETON */}
                    <div className="flex items-center justify-start gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-slate-200" />
                        <div className="h-7 w-24 rounded-xl bg-slate-200" />
                    </div>

                    {/* FAILED ICON SKELETON */}
                    <div className="rounded-xl border border-slate-300 bg-white p-6 sm:p-8 flex flex-col items-center text-center space-y-3">
                        <div className="w-16 h-16 rounded-full bg-slate-200 mb-4" />
                        <div className="h-8 w-48 rounded-xl bg-slate-200 mb-2" />
                        <div className="h-4 w-64 rounded-xl bg-slate-200" />
                        <div className="h-28 w-full rounded-xl bg-slate-200 mt-2" />
                    </div>

                    {/* ORDER INFO SKELETON */}
                    <div className="rounded-xl border border-slate-300 bg-white p-6">
                        <div className="h-6 w-32 rounded-xl bg-slate-200 mb-4" />

                        <div className="flex gap-3 items-center mb-4">
                            <div className="w-12 h-12 rounded-lg bg-slate-200 shrink-0" />
                            <div className="space-y-2">
                                <div className="h-4 w-32 rounded-xl bg-slate-200" />
                                <div className="h-3 w-20 rounded-xl bg-slate-200" />
                            </div>
                        </div>

                        <div className="space-y-3 border-t border-slate-200 pt-4">
                            {[1, 2].map((i) => (
                                <div key={i} className="flex justify-between items-center">
                                    <div className="h-4 w-20 rounded-xl bg-slate-200" />
                                    <div className="h-4 w-28 rounded-xl bg-slate-200" />
                                </div>
                            ))}
                            <div className="flex justify-between items-center border-t border-slate-200 pt-3 mt-3">
                                <div className="h-5 w-24 rounded-xl bg-slate-200" />
                                <div className="h-5 w-32 rounded-xl bg-slate-200" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md space-y-4">

                {/* BRAND */}
                <PaymentBrandHeader
                  userImage={purchase?.product?.user?.image}
                  userName={purchase?.product?.user?.name}
                />

                {/* FAILED ICON */}
                <PaymentStatusSection
                  icon={
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                      <XCircleIcon className="w-10 h-10 text-red-500" weight="fill" />
                    </div>
                  }
                  title="Pembayaran Gagal"
                  message="Transaksi tidak dapat diproses. Silakan coba lagi atau hubungi kami."
                >
                  {/* REASON BOX */}
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 w-full text-left mt-2">
                      <p className="text-sm font-semibold text-red-700">Kemungkinan penyebab:</p>
                      <ul className="text-xs text-red-600 mt-2 space-y-1 list-disc list-inside">
                          <li>Saldo tidak mencukupi</li>
                          <li>Koneksi terputus saat pembayaran</li>
                          <li>Waktu pembayaran habis</li>
                          <li>Kartu/rekening ditolak</li>
                      </ul>
                  </div>
                </PaymentStatusSection>

                {/* ORDER INFO */}
                {purchase && (
                    <TransactionDetailsCard
                      purchase={purchase}
                      TYPE_MAP={{
                        WEBINAR: "Webinar",
                        KELAS_ONLINE: "Kelas",
                        DIGITAL_PRODUCT: "Produk Digital",
                      }}
                      statusMessage={<span className="text-red-500 font-medium">✗ Gagal</span>}
                    />
                )}

                <PaymentActionAndSecurity
                  xenditInvoiceUrl={purchase?.xenditInvoiceUrl}
                  hasFailed={true}
                />

            </div>
        </div>
    );
}

export default function PaymentFailedPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <SpinnerIcon className="w-8 h-8 animate-spin text-cyan-600" />
            </div>
        }>
            <PaymentFailedContent />
        </Suspense>
    );
}
