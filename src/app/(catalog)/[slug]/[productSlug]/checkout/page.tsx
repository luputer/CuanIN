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
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import React from "react";

type FormFieldData = {
    id: string;
    label: string;
    type: string;
    options: unknown;
    required: boolean;
    order: number;
};

type CheckoutFormValues = {
    name: string;
    email: string;
    phone: string;
    promo?: string;
    custom?: Record<string, string>;
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

    const formFields = React.useMemo(() => {
        return (product as { formFields?: FormFieldData[] })?.formFields ?? [];
    }, [product]);

    const price = Number(product?.price ?? 0);
    const isGratis = price === 0;

    const CATEGORY_STYLE: Record<string, string> = {
        WEBINAR: "bg-cyan-100 text-cyan-700 border-cyan-200",
        KELAS_ONLINE: "bg-amber-100 text-amber-700 border-amber-200",
        DIGITAL_PRODUCT: "bg-emerald-100 text-emerald-700 border-emerald-200",
    };

    // dynamic schema
    const schema = React.useMemo(() => {
        const base = {
            name: z.string().min(1, "Nama wajib diisi"),
            email: z.string().email("Email wajib diisi"),
            phone: z.string().min(1, "Nomor HP wajib diisi"),
            promo: z.string().optional(),
        };

        const customShape: Record<string, z.ZodTypeAny> = {};

        formFields.forEach((f) => {
            if (f.required) {
                customShape[f.id] = z.string().min(1, `${f.label} wajib diisi`);
            } else {
                customShape[f.id] = z.string().optional();
            }
        });

        return z.object({
            ...base,
            custom: z.object(customShape).optional(),
        });
    }, [formFields]);

    const form = useForm<CheckoutFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            promo: "",
            custom: {},
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
        const answers = Object.entries(data.custom ?? {}).map(([id, value]) => ({
            formFieldId: id,
            answer: value,
        }));

        purchaseMutation.mutate({
            productId: product!.id,
            buyerName: data.name,
            buyerEmail: data.email,
            buyerPhone: data.phone,
            answers,
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

    const renderFormField = (field: FormFieldData) => {
        const options = Array.isArray(field.options) ? (field.options as string[]) : [];
        const fieldError = errors?.custom?.[field.id];

        switch (field.type) {
            case "SHORT":
                return (
                    <input
                        {...register(`custom.${field.id}`)}
                        placeholder={`Masukkan ${field.label.toLowerCase()}`}
                        className={inputClass(!!fieldError)}
                    />
                );

            case "LONG":
                return (
                    <textarea
                        {...register(`custom.${field.id}`)}
                        placeholder={`Masukkan ${field.label.toLowerCase()}`}
                        rows={3}
                        className={inputClass(!!fieldError)}
                    />
                );

            case "MULTIPLE_CHOICE":
                return (
                    <div className="space-y-2">
                        {options.map((opt, i) => (
                            <label key={i} className="flex gap-2 items-center text-sm text-slate-700">
                                <input
                                    type="radio"
                                    value={opt}
                                    {...register(`custom.${field.id}`)}
                                />
                                {opt}
                            </label>
                        ))}
                    </div>
                );

            case "CHECKBOX":
                return (
                    <div className="space-y-2">
                        {options.map((opt, i) => {
                            const current = form.watch(`custom.${field.id}`)! ?? "";
                            const values = current.split(",").filter(Boolean);
                            const checked = values.includes(opt);

                            return (
                                <label key={i} className="flex gap-2 items-center text-sm text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => {
                                            const newValues = checked
                                                ? values.filter((v) => v !== opt)
                                                : [...values, opt];

                                            form.setValue(
                                                `custom.${field.id}`,
                                                newValues.join(","),
                                                { shouldValidate: true }
                                            );
                                        }}
                                    />
                                    {opt}
                                </label>
                            );
                        })}
                    </div>
                );

            case "DROPDOWN":
                return (
                    <select
                        {...register(`custom.${field.id}`)}
                        className={inputClass(!!fieldError)}
                    >
                        <option value="">Pilih {field.label.toLowerCase()}</option>
                        {options.map((opt, i) => (
                            <option key={i} value={opt}>{opt}</option>
                        ))}
                    </select>
                );

            default:
                return (
                    <input
                        {...register(`custom.${field.id}`)}
                        className={inputClass(!!fieldError)}
                    />
                );
        }
    };

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

            <div className="max-w-6xl mx-auto px-4 py-10">

                <h1 className="text-3xl font-bold text-slate-800 mb-8">
                    Checkout
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">

                    {/* LEFT */}
                    <div className="lg:col-span-3 space-y-6 pb-50">

                        {/* PRODUCT CARD */}
                        <div className="bg-white border border-slate-300 rounded-xl p-5 flex gap-5">
                            <div className="w-50 h-50 relative bg-slate-100 rounded-xl overflow-hidden shrink-0">
                                {product.image ? (
                                    <Image src={product.image} alt={product.name}
                                        unoptimized
                                        fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        No Image
                                    </div>
                                )}
                            </div>

                            <div className="mt-1 flex flex-col h-full space-y-2">
                                <span className={`text-xs px-3 py-1 rounded-full border w-fit ${CATEGORY_STYLE[product.type]}`}>
                                    {product.type}
                                </span>

                                <h2 className="text-lg font-bold text-slate-800 mb-4">
                                    {product.name}
                                </h2>

                                <div className="space-y-1 mb-2">
                                    {(product.benefit as string[])?.map((item, idx) => (
                                        <div key={idx} className="flex gap-3 text-sm text-slate-800">
                                            <CheckCircleIcon className="w-5 h-5 text-green-600" weight="fill" />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="text-lg font-bold text-cyan-600 mt-2">
                                    {isGratis ? "Gratis" : `Rp ${price.toLocaleString("id-ID")}`}
                                </div>
                            </div>
                        </div>

                        {/* FORM */}
                        <form
                            id="checkout-form"
                            onSubmit={handleSubmit(onSubmit)}
                            className="bg-white border border-slate-300 rounded-xl p-6 space-y-5 shadow-[0_-4px_0px_0px_rgba(0,146,184,100)]"
                        >
                            <div className="space-y-2 pb-2">
                                <div className="text-slate-700 font-semibold text-lg">Isi Data Diri</div>
                                <p className="text-sm text-slate-700">
                                    Silakan isi data berikut untuk melanjutkan proses checkout
                                </p>
                            </div>

                            {/* DEFAULT FORM */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm text-slate-700">
                                    Nama <span className="text-red-500">*</span>
                                </label>
                                <input {...register("name")} className={inputClass(!!errors.name)} placeholder="Masukkan nama lengkap" />
                                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm text-slate-700">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input {...register("email")} className={inputClass(!!errors.email)} placeholder="contoh: nama@gmail.com" />
                                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm text-slate-700">
                                    No HP <span className="text-red-500">*</span>
                                </label>
                                <input {...register("phone")} className={inputClass(!!errors.phone)} placeholder="contoh: 081234567890" />
                                {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                            </div>

                            {/* CONDITIONAL CUSTOM FORM */}
                            {formFields.length > 0 && (
                                <div className="pt-4 border-t border-slate-200 space-y-4">
                                    {formFields.map((field) => (
                                        <div key={field.id} className="flex flex-col gap-2">
                                            <label className="text-sm text-slate-700">
                                                {field.label}
                                                {field.required && <span className="text-red-500"> *</span>}
                                            </label>

                                            {renderFormField(field)}

                                            {errors?.custom?.[field.id] && (
                                                <p className="text-xs text-red-500">
                                                    {errors.custom[field.id]?.message?.toString()}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </form>
                    </div >

                    {/* RIGHT */}
                    < div className="space-y-6 lg:sticky lg:top-24 lg:self-start lg:h-fit lg:col-span-2" >

                        {/* VOUCHER */}
                        < div className="bg-white border border-slate-300 rounded-xl p-5" >
                            <label className="text-sm text-slate-700">Voucher</label>

                            <div className="flex gap-3 mt-2">
                                <div className="relative flex-1">
                                    <SealPercentIcon className="w-4 h-4 text-yellow-400 absolute left-3 top-1/2 -translate-y-1/2" weight="fill" />
                                    <input
                                        {...register("promo")}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-100"
                                        placeholder="Masukkan kode voucher"
                                    />
                                </div>

                                <button className="px-5 py-2.5 rounded-xl bg-yellow-300 hover:bg-yellow-400 text-slate-800 text-sm font-medium">
                                    Pakai
                                </button>
                            </div>
                        </div >

                        {/* SUMMARY */}
                        < div className="bg-white border border-slate-300 rounded-xl p-6" >
                            <h3 className="font-semibold text-slate-800 border-b border-slate-300 pb-3 mb-4">
                                Detail Pembayaran
                            </h3>

                            <div className="flex justify-between text-sm">
                                <span>Total</span>
                                <span className="font-bold text-cyan-600">
                                    {isGratis ? "Rp0" : `Rp ${price.toLocaleString("id-ID")}`}
                                </span>
                            </div>

                            <button
                                type="submit"
                                form="checkout-form"
                                className="mt-6 w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-medium"
                            >
                                {purchaseMutation.isPending ? "Memproses..." : "Bayar Sekarang"}
                            </button>

                            <div className="mt-3 text-xs text-slate-500 flex items-center gap-2 justify-center">
                                <ShieldCheckIcon className="w-4 h-4" />
                                Aman & terenkripsi
                            </div>
                        </div >

                    </div >
                </div >
            </div >
        </div >
    );
}