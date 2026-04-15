"use client";

import { ArrowLeft, Loader2, CheckCircle2, BadgePercent, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { useState } from "react";
import { toast } from "sonner"; // Assuming Sonner is used in this project based on standard shadcn setups

export default function CheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const productSlug = params.productSlug as string;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        promo: "",
    });

    const { data: product, isLoading } = api.catalog.getProductById.useQuery({
        slug,
        productSlug
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <p className="text-slate-500 mb-4">Produk tidak tersedia</p>
                    <Link href={`/${slug}`} className="text-blue-600 hover:underline">
                        Kembali
                    </Link>
                </div>
            </div>
        );
    }

    const price = Number(product.price);
    const isGratis = price === 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Mock process registration
        setTimeout(() => {
            setIsSubmitting(false);
            if (toast?.success) {
                toast.success("Pendaftaran berhasil!", {
                    description: `Kamu telah terdaftar untuk ${product.name}`,
                });
            } else {
                alert("Pendaftaran berhasil!");
            }
            // Navigate back to catalog or dashboard
            router.push(`/${slug}`);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center">
                    <Link
                        href={`/${slug}/${productSlug}`}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali
                    </Link>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">Daftar</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Form Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">

                                {/* Name Input */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label htmlFor="name" className="text-sm font-medium text-slate-700">Nama Lengkap<span className="text-red-500">*</span></label>
                                    </div>
                                    <input
                                        id="name"
                                        type="text"
                                        required
                                        placeholder="Nama Lengkap"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>

                                {/* Email Input */}
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-slate-700">Email<span className="text-red-500">*</span></label>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        placeholder="Email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>

                                {/* Phone Input */}
                                <div className="space-y-2">
                                    <label htmlFor="phone" className="text-sm font-medium text-slate-700">Nomor Telepon<span className="text-red-500">*</span></label>
                                    <input
                                        id="phone"
                                        type="tel"
                                        required
                                        placeholder="contoh: 6281234567801"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>

                                <div className="pt-6 border-t border-slate-200 mt-6 space-y-6">
                                    {/* Product Type View */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Paket yang dipilih</label>
                                        <div className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 flex flex-col justify-center">
                                            {product.name}
                                        </div>
                                    </div>

                                    {/* Promo Code Input */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Kode promo atau affiliate</label>
                                        <div className="flex gap-3">
                                            <div className="relative flex-1">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <BadgePercent className="h-5 w-5 text-green-500" />
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Masukkan kode promo atau affiliate"
                                                    value={formData.promo}
                                                    onChange={(e) => setFormData({ ...formData, promo: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold rounded-xl transition-colors"
                                            >
                                                Gunakan
                                            </button>
                                        </div>
                                    </div>
                                </div>

                            </form>
                        </div>

                        {/* Product Summary Info Box */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
                            <h3 className="font-bold text-slate-800 text-lg mb-4">{product.name}</h3>
                            <div className="flex flex-wrap gap-x-6 gap-y-3 mb-6">
                                <div className="flex items-center gap-2 text-slate-600 text-sm bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Akses materi cepat
                                </div>
                                <div className="flex items-center gap-2 text-slate-600 text-sm bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" /> QnA Langsung
                                </div>
                                <div className="flex items-center gap-2 text-slate-600 text-sm bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Benefit lainnya...
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-slate-900">
                                {isGratis ? "Gratis" : `Rp${price.toLocaleString("id-ID")}`}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Billing Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 sticky top-6 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-6 text-center border-b border-black pb-4">Tagihan</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-start text-sm">
                                    <div className="text-slate-600">Item Awal</div>
                                    <div className="font-medium text-slate-900">
                                        {isGratis ? "Rp0" : `Rp${price.toLocaleString("id-ID")}`}
                                    </div>
                                </div>

                                <div className="flex justify-between gap-4 text-sm mt-2 p-3 bg-slate-50 rounded-lg">
                                    <div className="text-slate-600 flex gap-2">
                                        <span className="text-slate-400">1x</span>
                                        <span className="line-clamp-2">{product.name}</span>
                                    </div>
                                    <div className="font-medium whitespace-nowrap">
                                        {isGratis ? "Rp0" : `Rp${price.toLocaleString("id-ID")}`}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-200 mb-6 flex justify-between items-center">
                                <div className="font-bold text-slate-900">Total</div>
                                <div className="font-bold text-slate-900 text-lg">
                                    {isGratis ? "Rp0" : `Rp${price.toLocaleString("id-ID")}`}
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full py-3.5 px-4 bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-200 text-slate-900 font-bold rounded-xl transition-all shadow-sm hover:shadow text-center flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Memproses...
                                    </>
                                ) : (
                                    "Daftar"
                                )}
                            </button>

                            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                                <ShieldCheck className="w-4 h-4" /> Transaksi aman & terenkripsi
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
