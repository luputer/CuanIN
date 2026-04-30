"use client";

import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import Image from "next/image";
import { SpinnerIcon, ShieldCheckIcon, ArrowRightIcon } from "@phosphor-icons/react";
import React from "react";

const PAYMENT_METHODS = [
    {
        group: "QRIS & E-Wallet",
        methods: [
            { id: "qris", label: "QRIS", icon: "/icons/qris.png" },
            { id: "shopeepay", label: "ShopeePay", icon: "/icons/shopeepay.png" },
            { id: "dana", label: "DANA", icon: "/icons/dana.png" },
            { id: "ovo", label: "OVO", icon: "/icons/ovo.png" },
        ],
    },
    {
        group: "Virtual Account & Bank Transfer",
        methods: [
            { id: "bca", label: "BCA", icon: "/icons/bca.png" },
            { id: "bni", label: "BNI", icon: "/icons/bni.png" },
            { id: "bri", label: "BRI", icon: "/icons/bri.png" },
            { id: "mandiri", label: "Mandiri", icon: "/icons/mandiri.png" },
            { id: "bsi", label: "BSI", icon: "/icons/bsi.png" },
            { id: "permata", label: "Permata Bank", icon: "/icons/permata.png" },
        ],
    },
    {
        group: "Retail",
        methods: [
            { id: "alfamart", label: "Alfamart", icon: "/icons/alfamart.png" },
        ],
    },
    {
        group: "Kartu Kredit",
        methods: [
            { id: "cc", label: "Credit Card", icon: "/icons/cc.png" },
        ],
    },
];

export default function PaymentPage() {
    const params = useParams();
    const id = params.id as string;
    const [selected, setSelected] = React.useState<string | null>(null);

    const { data: purchase, isLoading } = api.purchases.getById.useQuery({ id });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <SpinnerIcon className="w-8 h-8 animate-spin text-cyan-600" />
            </div>
        );
    }

    if (!purchase) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <p className="text-slate-500">Transaksi tidak ditemukan</p>
            </div>
        );
    }

    const price = Number(purchase.amount);

    const handlePay = () => {
        if (!selected) return;
        // Redirect ke Xendit invoice URL
        window.location.href = purchase.xenditInvoiceUrl!;
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* HEADER */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 h-14 flex items-center">
                    <span className="text-xl font-bold text-cyan-600">CuanIN</span>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-slate-800 mb-6">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

                    {/* LEFT - PAYMENT METHODS */}
                    <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6">
                        <h2 className="font-semibold text-slate-700 mb-5">Pilih metode pembayaran</h2>

                        <div className="space-y-6">
                            {PAYMENT_METHODS.map((group) => (
                                <div key={group.group}>
                                    <p className="text-xs text-slate-400 font-medium mb-3">{group.group}</p>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                        {group.methods.map((method) => (
                                            <button
                                                key={method.id}
                                                onClick={() => setSelected(method.id)}
                                                className={`
                                                    relative p-3 rounded-xl border-2 flex items-center justify-center h-16 transition
                                                    ${selected === method.id
                                                        ? "border-cyan-500 bg-cyan-50 shadow-sm"
                                                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                                    }
                                                `}
                                            >
                                                {/* Checkmark */}
                                                {selected === method.id && (
                                                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center">
                                                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </span>
                                                )}

                                                {/* Icon or label fallback */}
                                                <span className="text-sm font-semibold text-slate-600">
                                                    {method.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT - ORDER SUMMARY */}
                    <div className="space-y-4 lg:sticky lg:top-20">
                        {/* Tagihan */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                            <h3 className="font-semibold text-slate-700">Tagihan</h3>

                            {/* Buyer info */}
                            <div className="space-y-1">
                                <p className="font-semibold text-slate-800">{purchase.buyerName}</p>
                                <p className="text-sm text-slate-500">{purchase.buyerEmail}</p>
                                <p className="text-sm text-slate-500">{purchase.buyerPhone}</p>
                            </div>

                            {/* Product */}
                            <div className="flex gap-3 pt-2 border-t border-slate-100">
                                <div className="w-12 h-12 relative bg-slate-100 rounded-lg overflow-hidden shrink-0">
                                    {purchase.product.image ? (
                                        <Image
                                            src={purchase.product.image}
                                            alt={purchase.product.name}
                                            fill unoptimized
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">
                                            No Image
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-800">{purchase.product.name}</p>
                                    <p className="text-xs text-slate-400">{purchase.product.type}</p>
                                </div>
                            </div>

                            {/* Note */}
                            <p className="text-xs text-slate-400 italic">
                                *Informasi lebih lanjut terkait layanan yang telah dibayarkan akan dikirimkan melalui email.
                            </p>

                            {/* Total */}
                            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                <span className="font-semibold text-slate-700">Total</span>
                                <span className="font-bold text-slate-800 text-lg">
                                    Rp{price.toLocaleString("id-ID")}
                                </span>
                            </div>

                            {/* CTA Button */}
                            <button
                                onClick={handlePay}
                                disabled={!selected}
                                className="w-full py-3 bg-slate-700 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-medium flex items-center justify-center gap-2 transition"
                            >
                                Pilih Metode Pembayaran
                                <ArrowRightIcon className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
                            <ShieldCheckIcon className="w-3.5 h-3.5" />
                            Transaksi aman & terenkripsi
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}