"use client";

export const dynamic = "force-dynamic";

import { ArrowLeft, Loader2, CheckCircle2, BadgePercent, ShieldCheck } from "lucide-react";
import Link from "next/link";
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

export default function CheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const productSlug = params.productSlug as string;

    const { data: product, isLoading } = api.catalog.getProductById.useQuery({
        slug,
        productSlug
    });

    const formFields = React.useMemo(() => {
        return (product as { formFields?: FormFieldData[] })?.formFields ?? [];
    }, [product]);

    // Define the shape of our form explicitly so we don't have to use 'any'
    interface CheckoutFormValues {
        name: string;
        email: string;
        phone: string;
        promo?: string;
        custom?: Record<string, string | string[]>;
    }

    const dynamicCheckoutSchema = React.useMemo(() => {
        const base = {
            name: z.string().min(1, "Nama Lengkap wajib diisi"),
            email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
            phone: z.string().min(1, "Nomor Telepon wajib diisi"),
            promo: z.string().optional(),
        };

        const customShapes: Record<string, z.ZodTypeAny> = {};
        formFields.forEach((f) => {
            const fieldLabel = `"${f.label}" wajib diisi`;
            if (f.required) {
                customShapes[f.id] = z.string({
                    required_error: fieldLabel,
                    invalid_type_error: fieldLabel
                }).min(1, fieldLabel);
            } else {
                customShapes[f.id] = z.any().optional();
            }
        });

        return z.object({
            ...base,
            custom: z.object(customShapes).optional(),
        });
    }, [formFields]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm<CheckoutFormValues>({
        resolver: zodResolver(dynamicCheckoutSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            promo: "",
            custom: {}
        }
    });

    const customAnswers = watch("custom") ?? {};

    const purchaseMutation = api.purchases.create.useMutation({
        onSuccess: () => {
            toast.success("Pendaftaran berhasil!", {
                description: `Kamu telah terdaftar untuk ${product?.name}`,
            });
            router.push(`/${slug}`);
        },
        onError: (error) => {
            toast.error(`Gagal mendaftar: ${error.message}`);
        },
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
    const handleCustomAnswer = (fieldId: string, value: string) => {
        setValue(`custom.${fieldId}`, value, { shouldValidate: true, shouldDirty: true });
    };

    const onSubmit = async (data: CheckoutFormValues) => {
        const answers = Object.entries(data.custom ?? {})
            .filter(([, value]) => typeof value === 'string' && value.trim() !== '')
            .map(([formFieldId, answer]) => ({
                formFieldId,
                answer: answer as string,
            }));

        purchaseMutation.mutate({
            productId: product.id,
            buyerName: data.name,
            buyerEmail: data.email,
            buyerPhone: data.phone,
            answers,
        });
    };

    const renderFormField = (field: FormFieldData) => {
        const options = Array.isArray(field.options) ? (field.options as string[]) : [];

        const fieldErrors = errors?.custom?.[field.id];

        switch (field.type) {
            case "SHORT":
                return (
                    <div className="space-y-1">
                        <input
                            type="text"
                            placeholder={`Masukkan ${field.label.toLowerCase()}`}
                            className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-1 transition-all ${fieldErrors
                                ? "border-red-400 focus:border-red-400 focus:ring-red-100 bg-red-50"
                                : "border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                }`}
                            {...register(`custom.${field.id}`)}
                        />
                        {fieldErrors && (
                            <p className="text-xs text-red-500">{fieldErrors.message}</p>
                        )}
                    </div>
                );
            case "LONG":
                return (
                    <div className="space-y-1">
                        <textarea
                            placeholder={`Masukkan ${field.label.toLowerCase()}`}
                            rows={3}
                            className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-1 transition-all resize-none ${fieldErrors
                                ? "border-red-400 focus:border-red-400 focus:ring-red-100 bg-red-50"
                                : "border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                }`}
                            {...register(`custom.${field.id}`)}
                        />
                        {fieldErrors && (
                            <p className="text-xs text-red-500">{fieldErrors.message}</p>
                        )}
                    </div>
                );
            case "MULTIPLE_CHOICE":
                return (
                    <div className="space-y-1">
                        <div className="space-y-2">
                            {options.map((option, idx) => (
                                <label key={idx} className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        value={option}
                                        className="w-4 h-4 text-blue-600"
                                        {...register(`custom.${field.id}`)}
                                    />
                                    <span className="text-sm text-slate-700">{option}</span>
                                </label>
                            ))}
                        </div>
                        {fieldErrors && (
                            <p className="text-xs text-red-500">{fieldErrors.message}</p>
                        )}
                    </div>
                );
            case "CHECKBOX":
                return (
                    <div className="space-y-1">
                        <div className="space-y-2">
                            {options.map((option, idx) => {
                                const currentAnswersStr = (customAnswers?.[field.id] as string) ?? "";
                                const currentValues = currentAnswersStr.split(",").filter(Boolean);
                                const isChecked = currentValues.includes(option);
                                return (
                                    <label key={idx} className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => {
                                                const newValues = isChecked
                                                    ? currentValues.filter((v: string) => v !== option)
                                                    : [...currentValues, option];
                                                handleCustomAnswer(field.id, newValues.join(","));
                                            }}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        <span className="text-sm text-slate-700">{option}</span>
                                    </label>
                                );
                            })}
                        </div>
                        {fieldErrors && (
                            <p className="text-xs text-red-500">{fieldErrors.message}</p>
                        )}
                    </div>
                );
            case "DROPDOWN":
                return (
                    <div className="space-y-1">
                        <select
                            className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-1 transition-all bg-white ${fieldErrors
                                ? "border-red-400 focus:border-red-400 focus:ring-red-100 bg-red-50"
                                : "border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                }`}
                            {...register(`custom.${field.id}`)}
                        >
                            <option value="">Pilih {field.label.toLowerCase()}</option>
                            {options.map((option, idx) => (
                                <option key={idx} value={option}>{option}</option>
                            ))}
                        </select>
                        {fieldErrors && (
                            <p className="text-xs text-red-500">{fieldErrors.message}</p>
                        )}
                    </div>
                );
            default:
                return null;
        }
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
                            <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                                {/* Name Input */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label htmlFor="name" className="text-sm font-medium text-slate-700">Nama Lengkap<span className="text-red-500">*</span></label>
                                    </div>
                                    <input
                                        id="name"
                                        type="text"
                                        placeholder="Nama Lengkap"
                                        className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-1 transition-all ${errors.name
                                            ? "border-red-400 focus:border-red-400 focus:ring-red-100 bg-red-50"
                                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                            }`}
                                        {...register("name")}
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-red-500">{errors.name.message}</p>
                                    )}
                                </div>

                                {/* Email Input */}
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-slate-700">Email<span className="text-red-500">*</span></label>
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="Email"
                                        className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-1 transition-all ${errors.email
                                            ? "border-red-400 focus:border-red-400 focus:ring-red-100 bg-red-50"
                                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                            }`}
                                        {...register("email")}
                                    />
                                    {errors.email && (
                                        <p className="text-xs text-red-500">{errors.email.message}</p>
                                    )}
                                </div>

                                {/* Phone Input */}
                                <div className="space-y-2">
                                    <label htmlFor="phone" className="text-sm font-medium text-slate-700">Nomor Telepon<span className="text-red-500">*</span></label>
                                    <input
                                        id="phone"
                                        type="tel"
                                        placeholder="contoh: 6281234567801"
                                        className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-1 transition-all ${errors.phone
                                            ? "border-red-400 focus:border-red-400 focus:ring-red-100 bg-red-50"
                                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                            }`}
                                        {...register("phone")}
                                    />
                                    {errors.phone && (
                                        <p className="text-xs text-red-500">{errors.phone.message}</p>
                                    )}
                                </div>

                                {/* Dynamic Custom Form Fields */}
                                {formFields.length > 0 && (
                                    <div className="pt-4 border-t border-slate-200 space-y-6">
                                        <h3 className="text-sm font-semibold text-slate-800">Informasi Tambahan</h3>
                                        {formFields.map((field) => (
                                            <div key={field.id} className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">
                                                    {field.label}
                                                    {field.required && <span className="text-red-500">*</span>}
                                                </label>
                                                {renderFormField(field)}
                                            </div>
                                        ))}
                                    </div>
                                )}

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
                                                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-1 transition-all ${errors.promo
                                                        ? "border-red-400 focus:border-red-400 focus:ring-red-100 bg-red-50"
                                                        : "border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                                        }`}
                                                    {...register("promo")}
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
                                type="submit"
                                form="checkout-form"
                                disabled={purchaseMutation.isPending}
                                className="w-full py-3.5 px-4 bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-200 text-slate-900 font-bold rounded-xl transition-all shadow-sm hover:shadow text-center flex items-center justify-center gap-2"
                            >
                                {purchaseMutation.isPending ? (
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
