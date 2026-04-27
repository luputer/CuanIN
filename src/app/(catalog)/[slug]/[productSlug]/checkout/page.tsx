"use client";

export const dynamic = "force-dynamic";

import {
    ArrowLeftIcon,
    SpinnerIcon,
    ShieldCheckIcon,
    CheckCircleIcon,
    SealPercentIcon,
} from "@phosphor-icons/react";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import React from "react";

type CheckoutFormValues = {
    name: string;
    email: string;
    phone: string;
    promo?: string;
};

export default function CheckoutPage() {
    const params = useParams();
    const router = useRouter();

    const slug = params.slug as string;
    const productSlug = params.productSlug as string;

    const { data: product, isLoading } = api.catalog.getProductById.useQuery({
        slug,
        productSlug,
    });

    const price = Number(product?.price ?? 0);
    const isGratis = price === 0;

    const CATEGORY_STYLE: Record<string, string> = {
        WEBINAR: "bg-cyan-100 text-cyan-700 border-cyan-200",
        KELAS_ONLINE: "bg-amber-100 text-amber-700 border-amber-200",
        DIGITAL_PRODUCT: "bg-emerald-100 text-emerald-700 border-emerald-200",
    };

    const schema = z.object({
        name: z.string().min(1, "Nama wajib diisi"),
        email: z.string().email("Email tidak valid"),
        phone: z.string().min(1, "Nomor HP wajib diisi"),
        promo: z.string().optional(),
    });

    const form = useForm<CheckoutFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            promo: "",
        },
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = form;

    const purchaseMutation = api.purchases.create.useMutation({
        onSuccess: () => {
            toast.success("Berhasil daftar!");
            router.push(`/${slug}`);
        },
        onError: (e) => toast.error(e.message),
    });

    const onSubmit = (data: CheckoutFormValues) => {
        purchaseMutation.mutate({
            productId: product!.id,
            buyerName: data.name,
            buyerEmail: data.email,
            buyerPhone: data.phone,
            answers: [],
        });
    };

    const inputClass = (err?: boolean) =>
        `w-full px-4 py-2.5 rounded-xl border transition bg-white
        ${err
            ? "border-red-400 focus:border-red-500 bg-red-50"
            : "border-slate-300 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-100"
        }`;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <SpinnerIcon className="w-8 h-8 animate-spin text-cyan-600" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <p className="text-slate-500">Produk tidak ditemukan</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">

            {/* HEADER */}
            <div className="bg-white border-b border-slate-300 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center">
                    <Link
                        href={`/${slug}/${productSlug}`}
                        className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full"
                    >
                        <ArrowLeftIcon className="w-5 h-5 text-slate-600" />
                    </Link>
                </div>
            </div>

            {/* CONTENT */}
            <div className="max-w-6xl mx-auto px-4 py-10">

                <h1 className="text-3xl font-bold text-slate-800 mb-8">
                    Checkout
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">

                    {/* LEFT SIDE */}
                    <div className="lg:col-span-3 space-y-6 pb-50">

                        {/* ───── PRODUCT DETAIL CARD ───── */}
                        <div className="bg-white border border-slate-300 rounded-xl p-5 flex gap-5">

                            {/* THUMBNAIL */}
                            <div className="w-50 h-50 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                                {product.image ? (
                                    <img
                                        src={product.image}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        No Image
                                    </div>
                                )}
                            </div>

                            {/* INFO */}
                            <div className="mt-1 flex flex-col h-full space-y-2">

                                <span className={`text-xs px-3 py-1 rounded-full border w-fit ${CATEGORY_STYLE[product.type] ?? "bg-slate-100 text-slate-700 border-slate-200"}`}>
                                    {product.type}
                                </span>

                                <h2 className="text-lg font-bold text-slate-800 mb-4">
                                    {product.name}
                                </h2>

                                <div className="space-y-1 mb-2">
                                    {(product.benefit as string[])?.length > 0 ? (
                                        (product.benefit as string[]).map((item, idx) => (
                                            <div key={idx} className="flex gap-3 text-sm text-slate-800">
                                                <CheckCircleIcon className="w-5 h-5 text-green-600 shrink-0" weight="fill" />
                                                <span>{item}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <span className="text-slate-400">Belum ada benefit</span>
                                    )}
                                </div>

                                <div className="text-lg font-bold text-cyan-600 mt-2">
                                    {isGratis
                                        ? "Gratis"
                                        : `Rp ${price.toLocaleString("id-ID")}`}
                                </div>

                            </div>
                        </div>

                        {/* ───── FORM CARD ───── */}
                        <form
                            id="checkout-form"
                            onSubmit={handleSubmit(onSubmit)}
                            className="bg-white border border-slate-300 rounded-xl p-6 space-y-5 shadow-[0_-4px_0px_0px_rgba(0,146,184,100)]"
                        >
                            <div className="space-y-2 pb-2">
                                <div className="text-slate-700 font-semibold text-lg">Isi Data Diri</div>
                                <p className="text-sm text-slate-700">Silakan isi data berikut untuk melanjutkan proses checkout</p>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm text-slate-700">
                                    Nama <span className="text-red-500">*</span>
                                </label>
                                <input
                                    {...register("name")}
                                    placeholder="Masukkan nama lengkap"
                                    className={inputClass(!!errors.name)}
                                />
                                {errors.name && (
                                    <p className="text-xs text-red-500">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm text-slate-700">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    {...register("email")}
                                    placeholder="contoh: nama@email.com"
                                    className={inputClass(!!errors.email)}
                                />
                                {errors.email && (
                                    <p className="text-xs text-red-500">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm text-slate-700">
                                    No HP <span className="text-red-500">*</span>
                                </label>
                                <input
                                    {...register("phone")}
                                    placeholder="contoh: 081234567890"
                                    className={inputClass(!!errors.phone)}
                                />
                                {errors.phone && (
                                    <p className="text-xs text-red-500">
                                        {errors.phone.message}
                                    </p>
                                )}
                            </div>
                        </form>

                    </div>

                    {/* RIGHT SIDE */}
                    <div className="space-y-6 lg:sticky lg:top-24 lg:self-start lg:h-fit lg:col-span-2">

                        <div className="bg-white border border-slate-300 rounded-xl p-5">

                            <label className="text-sm text-slate-700">
                                Voucher
                            </label>

                            <div className="flex gap-3 mt-2">

                                {/* INPUT */}
                                <div className="relative flex-1">

                                    <SealPercentIcon className="w-4 h-4 text-yellow-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" weight="fill" />

                                    <input
                                        {...register("promo")}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-100"
                                        placeholder="Masukkan kode voucher"
                                    />
                                </div>

                                {/* BUTTON */}
                                <button
                                    type="button"
                                    className="px-5 py-2.5 rounded-xl bg-yellow-300 hover:bg-yellow-400 text-slate-800 text-sm font-medium transition cursor-pointer"
                                >
                                    Pakai
                                </button>

                            </div>

                        </div>

                        {/* SUMMARY CARD */}
                        <div className="bg-white border border-slate-300 rounded-xl p-6">

                            <h3 className="font-semibold text-slate-800 border-b border-slate-300 pb-3 mb-4">
                                Detail Pembayaran
                            </h3>

                            <div className="flex justify-between text-sm">
                                <span>Total</span>
                                <span className="font-bold text-cyan-600">
                                    {isGratis
                                        ? "Rp0"
                                        : `Rp ${price.toLocaleString("id-ID")}`}
                                </span>
                            </div>

                            <button
                                type="submit"
                                form="checkout-form"
                                disabled={purchaseMutation.isPending}
                                className="mt-6 w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-medium cursor-pointer"
                            >
                                {purchaseMutation.isPending
                                    ? "Memproses..."
                                    : "Bayar Sekarang"}
                            </button>

                            <div className="mt-3 text-xs text-slate-500 flex items-center gap-2 justify-center">
                                <ShieldCheckIcon className="w-4 h-4" />
                                Aman & terenkripsi
                            </div>

                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}