"use client";

import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { api } from "~/trpc/react";
import {
    SpinnerIcon,
    XCircleIcon,
    ShieldCheckIcon,
    ArrowCounterClockwiseIcon,
} from "@phosphor-icons/react";
import { Suspense } from "react";

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
                <div className="flex items-center justify-start gap-3 mb-4">
                    {purchase?.product?.user?.image ? (
                        <Image
                            src={purchase.product.user.image}
                            alt={purchase.product.user.name ?? "Creator"}
                            width={40}
                            height={40}
                            className="rounded-full object-cover w-10 h-10 border border-slate-200"
                            unoptimized
                        />
                    ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-200 text-sm font-bold text-slate-700 border border-slate-200">
                            {purchase?.product?.user?.name?.charAt(0).toUpperCase() ?? "C"}
                        </div>
                    )}
                    <span className="text-xl font-bold text-slate-800">
                        {purchase?.product?.user?.name ?? "CuanIN"}
                    </span>
                </div>

                {/* FAILED ICON */}
                <div className="rounded-xl border border-slate-300 bg-white p-6 sm:p-8 flex flex-col items-center text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                        <XCircleIcon className="w-10 h-10 text-red-500" weight="fill" />
                    </div>

                    <h1 className="text-2xl font-semibold text-slate-800 mb-2">Pembayaran Gagal</h1>
                    <p className="text-slate-500 text-sm">
                        Transaksi tidak dapat diproses. Silakan coba lagi atau hubungi kami.
                    </p>

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
                </div>

                {/* ORDER INFO */}
                {purchase && (
                    <div className="rounded-xl border border-slate-300 bg-white p-6">
                        <h3 className="mb-4 border-b border-slate-300 pb-3 font-semibold text-slate-800">
                            Detail Transaksi
                        </h3>

                        {/* Product */}
                        <div className="flex gap-3 items-center mb-4">
                            <div className="w-12 h-12 relative bg-slate-100 rounded-lg overflow-hidden shrink-0">
                                {purchase.product.image ? (
                                    <Image
                                        src={purchase.product.image}
                                        alt={purchase.product.name}
                                        fill unoptimized
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                                        No Image
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800 text-sm">{purchase.product.name}</p>
                                <p className="text-xs text-slate-500">{purchase.product.type === "WEBINAR" ? "Webinar" : purchase.product.type === "KELAS_ONLINE" ? "Kelas" : purchase.product.type === "DIGITAL_PRODUCT" ? "Produk Digital" : purchase.product.type}</p>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm border-t border-slate-200 pt-4">
                            <div className="flex justify-between items-center text-slate-600">
                                <span>Status</span>
                                <span className="text-red-500 font-medium">✗ Gagal</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-600">
                                <span>ID Transaksi</span>
                                <span className="font-mono text-xs text-slate-400">{purchase.id.slice(0, 12)}...</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-slate-200 pt-2 mt-2">
                                <span className="font-semibold text-slate-800">Total Bayar</span>
                                <span className="font-bold text-slate-900">
                                    Rp {Number(purchase.amount).toLocaleString("id-ID")}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* RETRY BUTTON */}
                {purchase?.xenditInvoiceUrl && (
                    <a
                        href={purchase.xenditInvoiceUrl}
                        className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition"
                    >
                        <ArrowCounterClockwiseIcon className="w-4 h-4" />
                        Coba Bayar Lagi
                    </a>
                )}

                <div className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
                    <ShieldCheckIcon className="w-3.5 h-3.5" />
                    Transaksi aman & terenkripsi oleh Midtrans
                </div>

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
