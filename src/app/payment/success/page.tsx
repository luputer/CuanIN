"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import Image from "next/image";
import {
    SpinnerIcon,
    CheckCircleIcon,
    ShieldCheckIcon,
    EnvelopeIcon,
    ArrowRightIcon,
} from "@phosphor-icons/react";
import { Suspense } from "react";

function PaymentSuccessContent() {
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

                {/* SUCCESS ICON */}
                <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center text-center space-y-3">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-2">
                        <CheckCircleIcon className="w-12 h-12 text-green-500" weight="fill" />
                    </div>

                    <h1 className="text-2xl font-bold text-slate-800">Pembayaran Berhasil!</h1>
                    <p className="text-slate-500 text-sm">
                        Terima kasih! Pesananmu telah dikonfirmasi.
                    </p>

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
                </div>

                {/* ORDER SUMMARY */}
                {purchase && (
                    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                        <h3 className="font-semibold text-slate-700 text-sm">Detail Pesanan</h3>

                        {/* Product */}
                        <div className="flex gap-3 items-center">
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
                                <p className="text-xs text-slate-500">{purchase.product.type}</p>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-3 space-y-2 text-sm">
                            <div className="flex justify-between text-slate-600">
                                <span>Nama</span>
                                <span className="font-medium text-slate-800">{purchase.buyerName}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Email</span>
                                <span className="font-medium text-slate-800">{purchase.buyerEmail}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Total Bayar</span>
                                <span className="font-bold text-cyan-600">
                                    Rp {Number(purchase.amount).toLocaleString("id-ID")}
                                </span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Status</span>
                                <span className="text-green-600 font-medium">✓ Lunas</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>ID Transaksi</span>
                                <span className="font-mono text-xs text-slate-400">{purchase.id.slice(0, 12)}...</span>
                            </div>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => router.push("/")}
                    className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition"
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