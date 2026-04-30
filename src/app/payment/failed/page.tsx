"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import {
    SpinnerIcon,
    XCircleIcon,
    ShieldCheckIcon,
    ArrowCounterClockwiseIcon,
    ArrowRightIcon,
} from "@phosphor-icons/react";
import { Suspense } from "react";

function PaymentFailedContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get("id") ?? "";

    const { data: purchase, isLoading } = api.purchases.getById.useQuery(
        { id },
        { enabled: !!id }
    );

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <SpinnerIcon className="w-8 h-8 animate-spin text-cyan-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md space-y-4">

                {/* BRAND */}
                <div className="text-center mb-2">
                    <span className="text-2xl font-bold text-cyan-600">CuanIN</span>
                </div>

                {/* FAILED ICON */}
                <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center text-center space-y-3">
                    <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-2">
                        <XCircleIcon className="w-12 h-12 text-red-500" weight="fill" />
                    </div>

                    <h1 className="text-2xl font-bold text-slate-800">Pembayaran Gagal</h1>
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
                    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2 text-sm">
                        <h3 className="font-semibold text-slate-700">Detail Transaksi</h3>
                        <div className="flex justify-between text-slate-600">
                            <span>Produk</span>
                            <span className="font-medium text-slate-800 text-right max-w-[200px] truncate">
                                {purchase.product.name}
                            </span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>Total</span>
                            <span className="font-bold text-slate-800">
                                Rp {Number(purchase.amount).toLocaleString("id-ID")}
                            </span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>Status</span>
                            <span className="text-red-500 font-medium">✗ Gagal</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>ID Transaksi</span>
                            <span className="font-mono text-xs text-slate-400">{purchase.id.slice(0, 12)}...</span>
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

                <button
                    onClick={() => router.push("/")}
                    className="w-full py-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-medium flex items-center justify-center gap-2 transition"
                >
                    Kembali ke Beranda
                    <ArrowRightIcon className="w-4 h-4" />
                </button>

                <div className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
                    <ShieldCheckIcon className="w-3.5 h-3.5" />
                    Transaksi aman & terenkripsi oleh Xendit
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
