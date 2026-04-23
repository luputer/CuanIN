"use client";

import { useForm, Controller } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

import {
    PlusIcon,
    ArrowLeftIcon,
    CircleNotchIcon,
    CaretUpIcon,
    CaretDownIcon,
    TrashIcon,
} from "@phosphor-icons/react";

import dynamic from "next/dynamic";
import MarkdownPreview from "~/components/MarkdownPreview";

import { api } from "~/trpc/react";
import { toast } from "sonner";
import { formatNumberWithDots, parseDotsToNumber } from "~/lib/utils";
import {
    FormGroup,
    SectionHeader,
    FormInput,
    FormSelect,
    FormTextarea,
} from "~/components/ui/form-layout";
import { useProductDigital } from "~/hooks/use-product-digital";

// Markdown Editor
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function EditProductPage() {
    const params = useParams();
    const id = params.id as string;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        form,
        fields,
        append,
        remove,
        uploading,
        previewUrl,
        onFileChange,
        onSubmit,
        isPending,
        isLoadingProduct,
        product
    } = useProductDigital({ id, isEdit: true });

    const { register, watch, setValue, getValues, control, formState: { errors } } = form;

    const priceType = watch("priceType");

    const handlePriceAdjust = (amount: number) => {
        const current = parseDotsToNumber(getValues("price")?.toString() ?? "0");
        const newPrice = Math.max(0, current + amount);

        setValue("price", newPrice, { shouldValidate: true });

        const input = document.getElementById("price-input-edit") as HTMLInputElement;
        if (input) {
            input.value = formatNumberWithDots(newPrice.toString());
        }
    };

    if (isLoadingProduct) {
        return (
            <div className="flex justify-center py-20">
                <CircleNotchIcon className="animate-spin text-cyan-500" size={32} />
            </div>
        );
    }

    if (!product) {
        return <p className="text-center py-20">Produk tidak ditemukan</p>;
    }

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="bg-slate-50">
                <div className="sticky top-[74px] bg-slate-50 z-40 -mx-4 px-4 mb-2">
                    <div className="max-w-7xl mx-auto flex flex-col gap-1">
                        <Link
                            href={`/produk-digital/${id}`}
                            className="group flex items-center gap-2 text-sm font-regular text-slate-600 hover:text-slate-800 transition-colors w-fit mb-2"
                        >
                            <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                            <span className="leading-none">Kembali ke Detail Produk</span>
                        </Link>

                        <h1 className="text-xl font-semibold text-slate-800">
                            Edit Produk Digital
                        </h1>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-800 overflow-hidden">
                <div className="px-10 py-8">

                    <SectionHeader title="Informasi Produk" />

                    <div>

                        {/* Nama */}
                        <FormGroup label="Nama" error={errors.name?.message}>
                            <FormInput {...register("name")} />
                        </FormGroup>

                        <FormGroup label="Deskripsi Singkat" error={errors.shortDescription?.message}>
                            <FormTextarea
                                placeholder="Masukkan deskripsi singkat"
                                {...register("shortDescription")}
                            />
                        </FormGroup>

                        <FormGroup label="Deskripsi" error={errors.description?.message}>
                            <div data-color-mode="light" className="w-full">
                                <Controller
                                    name="description"
                                    control={control}
                                    render={({ field }) => (
                                        <MDEditor
                                            value={field.value ?? ""}
                                            onChange={(val) => field.onChange(val ?? "")}
                                            height={400}
                                            visibleDragbar={false}
                                            className="w-full border-blue-200"
                                        />
                                    )}
                                />
                            </div>
                        </FormGroup>

                        {/* Gambar */}
                        <FormGroup label="Gambar">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="flex h-48 w-48 cursor-pointer items-center justify-center border rounded-lg bg-cyan-50 hover:bg-cyan-100 relative"
                            >
                                {previewUrl ? (
                                    <>
                                        <Image
                                            src={previewUrl}
                                            alt="Preview"
                                            fill
                                            unoptimized
                                            className="object-cover"
                                        />
                                        {uploading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                <CircleNotchIcon className="animate-spin text-white" size={24} />
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <PlusIcon size={32} />
                                )}

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={onFileChange}
                                />
                            </div>
                        </FormGroup>

                        {/* Tipe */}
                        <FormGroup label="Tipe">
                            <FormSelect {...register("priceType")}>
                                <option value="free">Gratis</option>
                                <option value="paid">Berbayar</option>
                            </FormSelect>
                        </FormGroup>

                        {/* Harga */}
                        {priceType === "paid" && (
                            <FormGroup label="Harga" error={errors.price?.message}>
                                <FormInput
                                    id="price-input-edit"
                                    prefix="Rp"
                                    suffix={
                                        <div className="flex flex-col">
                                            <button onClick={() => handlePriceAdjust(1000)} type="button">
                                                <CaretUpIcon weight="fill" />
                                            </button>
                                            <button onClick={() => handlePriceAdjust(-1000)} type="button">
                                                <CaretDownIcon weight="fill" />
                                            </button>
                                        </div>
                                    }
                                    {...register("price", {
                                        setValueAs: (v) => parseDotsToNumber(v),
                                    })}
                                />
                            </FormGroup>
                        )}

                        {/* Link */}
                        <FormGroup label="Link">
                            <FormInput {...register("link")} />
                        </FormGroup>

                        <FormGroup label="Keuntungan / Benefit" error={errors.benefit?.message}>
                            <div className="space-y-3 flex flex-col">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2">
                                        <FormInput
                                            placeholder={`Benefit ${index + 1}`}
                                            className="flex-1"
                                            {...register(`benefit.${index}` as const)}
                                        />
                                        <button
                                            type="button"
                                            className="flex h-[52px] w-[52px] items-center justify-center bg-red-50 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors border border-transparent shrink-0"
                                            onClick={() => remove(index)}
                                        >
                                            <TrashIcon className="h-5 w-5" weight="bold" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="flex items-center justify-center gap-2 px-4 h-[52px] text-sm font-medium text-cyan-600 bg-cyan-50 border border-cyan-200 rounded-lg hover:bg-cyan-100 transition-colors w-fit"
                                    onClick={() => append("")}
                                >
                                    <PlusIcon className="h-5 w-5" weight="bold" />
                                    Tambah Benefit
                                </button>
                            </div>
                        </FormGroup>

                        <FormGroup label="Status">
                            <FormSelect {...register("status")}>
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                                <option value="archived">Archived</option>
                            </FormSelect>
                        </FormGroup>

                    </div>
                </div>

                <div className="px-10 pb-8 flex justify-end">
                    <button
                        onClick={onSubmit}
                        disabled={isPending}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 transition-colors font-semibold"
                    >
                        {isPending ? (
                            <>
                                <CircleNotchIcon className="animate-spin" size={20} />
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <PlusIcon size={20} weight="bold" />
                                Simpan Perubahan
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
