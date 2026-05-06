"use client";

import { Controller } from "react-hook-form";
import { useEffect, useRef } from "react";
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
    PencilSimpleIcon,
} from "@phosphor-icons/react";

import dynamic from "next/dynamic";

import { formatNumberInput } from "~/lib/utils";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import {
    FormGroup,
    SectionHeader,
    FormInput,
    FormSelect,
    FormTextarea,
    FormCombobox,
} from "~/components/ui/form-layout";
import { useProductDigital } from "~/hooks/use-product-digital";
import ButtonSave from "~/components/ui/button-save";
import ButtonCancel from "~/components/ui/button-cancel";

// Markdown Editor
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function EditProductPage() {
    const params = useParams();
    const router = useRouter();
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
    const description = watch("description");

    const priceType = watch("priceType");

    // Format initial price value or when priceType changes to paid
    useEffect(() => {
        if (priceType === "paid") {
            const input = document.getElementById("price-input-edit") as HTMLInputElement;
            if (input) {
                const currentVal = getValues("price")?.toString() ?? "0";
                input.value = formatNumberInput(currentVal);
            }
        }
    }, [priceType, getValues]);

    const handlePriceAdjust = (amount: number) => {
        const current = Number(getValues("price")?.toString() ?? "0");
        const newPrice = Math.max(0, current + amount);

        setValue("price", newPrice, { shouldValidate: true });

        const input = document.getElementById("price-input-edit") as HTMLInputElement;
        if (input) {
            input.value = formatNumberInput(newPrice.toString());
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
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sticky top-[74px] bg-slate-50 z-40 -mx-4 px-4 pt-2">
                    <div className="flex-1 flex flex-col gap-1">
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


            <div className="bg-cyan-50 rounded-xl border border-slate-800 overflow-hidden">
                <div className="bg-cyan-50 px-4 sm:px-10 py-6 border-b border-slate-800">
                    <h2 className="text-lg font-semibold text-cyan-900">{product.name}</h2>
                </div>
                <div className="px-4 sm:px-10 py-6 sm:py-8">

                    <SectionHeader title="Informasi Produk" />

                    <div>

                        {/* Nama */}
                        <FormGroup label="Nama" error={errors.name?.message}>
                            <FormInput {...register("name")} />
                        </FormGroup>

                        {/* Gambar */}
                        <FormGroup label="Gambar" align="start">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="flex h-48 w-48 cursor-pointer items-center justify-center border border-slate-400 rounded-xl bg-slate-50 hover:bg-slate-100 relative group overflow-hidden transition-all shadow-sm"
                            >
                                {previewUrl ? (
                                    <>
                                        <Image
                                            src={previewUrl}
                                            alt="Preview"
                                            fill
                                            unoptimized
                                            className="object-cover group-hover:opacity-75 transition-opacity"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                                            <div className="bg-white/90 p-2 rounded-full shadow-md text-slate-800">
                                                <PencilSimpleIcon size={24} weight="bold" />
                                            </div>
                                        </div>
                                        {uploading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                <CircleNotchIcon className="animate-spin text-white" size={32} />
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-cyan-600 transition-colors">
                                        <PlusIcon size={32} weight="bold" />
                                        <span className="text-xs font-medium">Unggah Gambar</span>
                                    </div>
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

                        <FormGroup
                            label="Ringkasan"
                            align="start"
                            error={errors.shortDescription?.message}
                            description={`${watch("shortDescription")?.length ?? 0}/200 karakter`}
                        >
                            <FormTextarea
                                placeholder="Masukkan ringkasan tentang produk digital ini"
                                {...register("shortDescription")}
                            />
                        </FormGroup>

                        <FormGroup label="Deskripsi" align="start" error={errors.description?.message}>
                            <div data-color-mode="light" className="border border-slate-400 rounded-lg overflow-hidden">
                                <MDEditor
                                    value={description ?? ""}
                                    onChange={(val) => setValue("description", val ?? "")}
                                    height={400}
                                    preview="live"
                                    visibleDragbar={false}
                                    style={{ border: 'none', boxShadow: 'none' }}
                                    previewOptions={{
                                        remarkPlugins: [remarkGfm, remarkBreaks],
                                    }}
                                />
                            </div>
                        </FormGroup>

                        <FormGroup label="Benefit" align="start" error={errors.benefit?.message}>
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
                                            className="flex h-[52px] w-[52px] items-center justify-center rounded-lg bg-white border border-slate-400 text-red-500 hover:text-red-600 hover:bg-red-100 transition-colors shrink-0 cursor-pointer"
                                            onClick={() => remove(index)}
                                        >
                                            <TrashIcon className="h-5 w-5 translate-y-[0.5px]" weight="bold" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => append("")}
                                    className="flex justify-center items-center gap-2 bg-white border border-slate-400 rounded-lg py-2 px-4 text-sm font-regular text-slate-800 hover:bg-slate-100 w-fit cursor-pointer"
                                >
                                    <PlusIcon className="h-4 w-4" weight="regular" />
                                    <span>Tambah Benefit</span>
                                </button>
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
                                <Controller
                                    control={control}
                                    name="price"
                                    render={({ field: { onChange, value, ref } }) => (
                                        <FormInput
                                            ref={ref}
                                            id="price-input-edit"
                                            prefix="Rp"
                                            value={formatNumberInput((value ?? 0).toString())}
                                            onChange={(e) => {
                                                const rawValue = e.target.value.replace(/\D/g, "");
                                                onChange(rawValue ? Number(rawValue) : 0);
                                            }}
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
                                        />
                                    )}
                                />
                            </FormGroup>
                        )}

                        {/* Format */}
                        <FormGroup label="Format" error={errors.format?.message}>
                            <Controller
                                control={control}
                                name="format"
                                render={({ field: { onChange, value, ref } }) => (
                                    <FormCombobox
                                        ref={ref}
                                        options={["PDF", "Video", "Template", "E-book", "ZIP"]}
                                        value={value ?? ""}
                                        onValueChange={onChange}
                                        placeholder="Contoh: PDF, Video, Template"
                                    />
                                )}
                            />
                        </FormGroup>

                        {/* Link */}
                        <FormGroup label="Link" error={errors.link?.message}>
                            <FormInput {...register("link")} placeholder="https://example.com" />
                        </FormGroup>

                        <FormGroup label="Status">
                            <FormSelect {...register("status")}>
                                <option value="published">Published</option>
                                <option value="unpublished">Unpublished</option>
                            </FormSelect>
                        </FormGroup>

                    </div>
                </div>

                <div className="px-4 sm:px-10 pb-8 flex justify-end gap-4">
                    <ButtonCancel
                        type="button"
                        onClick={() => router.push(`/produk-digital/${id}`)}
                    />
                    <ButtonSave
                        onClick={onSubmit}
                        isLoading={isPending}
                        label="Simpan Perubahan"
                        loadingLabel="Menyimpan..."
                        weight="bold"
                    />
                </div>
            </div>
        </div>
    );
}
