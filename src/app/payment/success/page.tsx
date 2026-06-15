"use client";
import { useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";
import {
    SpinnerIcon,
} from "@phosphor-icons/react";
import { Suspense } from "react";
import { PaymentBrandHeader } from "~/components/payment/payment-brand-header";
import { PaymentStatusSection } from "~/components/payment/payment-status-section";
import { CheckCircleIcon, EnvelopeIcon } from "@phosphor-icons/react"; // Import here for direct use in icon and children props
import { TransactionDetailsCard } from "~/components/payment/transaction-details-card";
import { PaymentActionAndSecurity } from "~/components/payment/payment-action-and-security";

const TYPE_MAP: Record<string, string> = {
    WEBINAR: "Webinar",
    KELAS_ONLINE: "Kelas",
    DIGITAL_PRODUCT: "Produk Digital",
};

function PaymentSuccessContent() {
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

                    {/* SUCCESS ICON SKELETON */}
                    <div className="rounded-xl border border-slate-300 bg-white p-6 sm:p-8 flex flex-col items-center text-center space-y-3">
                        <div className="w-16 h-16 rounded-full bg-slate-200 mb-4" />
                        <div className="h-8 w-48 rounded-xl bg-slate-200 mb-2" />
                        <div className="h-4 w-64 rounded-xl bg-slate-200" />
                        <div className="h-16 w-full rounded-xl bg-slate-200 mt-2" />
                    </div>

                    {/* ORDER SUMMARY SKELETON */}
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
                            {[1, 2, 3, 4].map((i) => (
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

    const isFree = purchase ? Number(purchase.amount) === 0 : false;

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md space-y-4">

                {/* BRAND */}
                <PaymentBrandHeader
                  userImage={purchase?.product?.user?.image}
                  userName={purchase?.product?.user?.name}
                />

                {/* SUCCESS ICON */}
                <PaymentStatusSection
                  icon={
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                      <CheckCircleIcon className="w-10 h-10 text-green-500" weight="fill" />
                    </div>
                  }
                  title={isFree ? "Pendaftaran Berhasil!" : "Pembayaran Berhasil!"}
                  message={isFree ? "Pendaftaranmu telah dikonfirmasi." : "Terima kasih! Pesananmu telah dikonfirmasi."}
                >
                  {/* EMAIL NOTICE */}
                  <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 w-full flex gap-3 items-start text-left mt-2">
                      <EnvelopeIcon className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" weight="fill" />
                      <div>
                          <p className="text-sm font-semibold text-cyan-700">Cek email kamu</p>
                          <p className="text-xs text-cyan-600 mt-0.5">
                              Link akses produk sudah dikirim ke{" "}
                              <span className="font-medium">{purchase?.buyerEmail ?? "emailmu"}</span>
                          </p>
                      </div>
                  </div>
                </PaymentStatusSection>

                {/* ORDER SUMMARY */}
                {purchase && (
                    <TransactionDetailsCard
                      purchase={purchase}
                      TYPE_MAP={TYPE_MAP}
                      isFree={isFree}
                      statusMessage={
                        <span className="text-green-600 font-medium">
                          {isFree ? "✓ Sukses" : "✓ Lunas"}
                        </span>
                      }
                    />
                )}

                <PaymentActionAndSecurity isFree={isFree} />

            </div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <SpinnerIcon className="w-8 h-8 animate-spin text-cyan-600" />
            </div>
        }>
            <PaymentSuccessContent />
        </Suspense>
    );
}
