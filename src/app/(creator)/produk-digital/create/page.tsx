"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PlusIcon, ArrowLeftIcon, CircleNotchIcon, CaretUpIcon, CaretDownIcon, TrashIcon } from "@phosphor-icons/react";
import ButtonSave from "~/components/ui/button-save";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { productDigitalSchema } from "~/lib/validation";
import { formatNumberWithDots, parseDotsToNumber } from "~/lib/utils";
import { FormGroup, SectionHeader, FormInput, FormSelect, FormTextarea } from "~/components/ui/form-layout";

import dynamic from "next/dynamic";
import MarkdownPreview from "~/components/MarkdownPreview";
import { useImageUpload } from "~/hooks/use-upload";

// Markdown Editor (SSR off)
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

type DigitalProductFormValues = z.infer<typeof productDigitalSchema>;

export default function CreateDigitalProductPage() {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        getValues,
        control,
        formState: { errors },
    } = useForm<DigitalProductFormValues>({
        resolver: zodResolver(productDigitalSchema),
        defaultValues: {
            priceType: "free",
            status: "published",
            price: 0,
            benefit: ["", "", ""], // Default 3 empty benefits
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "benefit" as never,
    });

    const priceType = watch("priceType");

    const utils = api.useUtils();
    const fileInputRef = useRef<HTMLInputElement>(null);


    const createProduct = api.products.create.useMutation({
        onSuccess: () => {
            void utils.products.getAll.invalidate();
            toast.success("Produk Digital berhasil dibuat");
            router.push("/produk-digital");
        },
        onError: (error) => {
            toast.error(`Gagal membuat produk digital: ${error.message}`);
        },
    });

    const { uploading, previewUrl, handleFileUpload } = useImageUpload("products");


    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = await handleFileUpload(e);
        if (url) setValue("image", url, { shouldValidate: true });
    };

    const handlePriceAdjust = (amount: number) => {
        const currentPrice = parseDotsToNumber(getValues("price")?.toString() ?? "0");
        const newPrice = Math.max(0, currentPrice + amount);
        setValue("price", newPrice, { shouldValidate: true });

        const input = document.getElementById("price-input-create") as HTMLInputElement;
        if (input) {
            input.value = formatNumberWithDots(newPrice.toString());
        }
    };

    const onSubmit = (data: DigitalProductFormValues) => {
        createProduct.mutate({
            name: data.name,
            description: data.description,
            price: data.priceType === "free" ? 0 : (data.price ?? 0),
            type: "DIGITAL_PRODUCT",
            link: data.link ?? undefined,
            image: data.image,
            benefit: data.benefit?.filter(b => b.trim() !== ""),
        });
    };

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="bg-slate-50">
                <div className="sticky top-[74px] bg-slate-50 z-40 -mx-4 px-4 mb-2">
                    <div className="max-w-7xl mx-auto flex flex-col gap-1">
                        <Link
                            href="/produk-digital"
                            className="group flex items-center gap-2 text-sm font-regular text-slate-600 hover:text-slate-800 transition-colors w-fit mb-2"
                        >
                            <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                            <span className="leading-none">Kembali ke Daftar Produk Digital</span>
                        </Link>

                        <h1 className="text-xl font-semibold text-slate-800">
                            Tambah Produk Digital Baru
                        </h1>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-800 overflow-hidden">
                <div className="px-10 py-8">

                    <SectionHeader title="Informasi Produk" />

                    <div className="space-y-0">

                        {/* Nama */}
                        <FormGroup label="Nama" error={(errors.name as unknown as { message?: string })?.message}>
                            <FormInput
                                placeholder="Masukkan Nama Produk"
                                {...register("name")}
                            />
                        </FormGroup>

                        {/* Deskripsi */}
                        <FormGroup label="Deskripsi" error={(errors.description as unknown as { message?: string })?.message}>
                            <div data-color-mode="light" className="w-full">
                                <Controller
                                    name="description"
                                    control={control}
                                    render={({ field }) => (
                                        <MDEditor
                                            value={field.value ?? ""}
                                            onChange={(val) => field.onChange(val ?? "")}
                                            preview="live"
                                            height={400}
                                            visibleDragbar={false}
                                            className="w-full border-blue-200"
                                            previewOptions={{
                                                className: "p-4",
                                            }}
                                            components={{
                                                preview: (source: string) => (
                                                    <div className="p-4 bg-white min-h-full">
                                                        <MarkdownPreview content={source} />
                                                    </div>
                                                )
                                            }}
                                        />
                                    )}
                                />
                            </div>
                        </FormGroup>

                        {/* Gambar */}
                        <FormGroup label="Gambar">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="flex h-48 w-48 cursor-pointer flex-col items-center justify-center rounded-lg border border-slate-400 bg-cyan-50 hover:bg-cyan-100/50 text-slate-400 transition-colors overflow-hidden relative"
                            >
                                {previewUrl ? (
                                    <>
                                        <Image src={previewUrl} alt="Preview" fill className="object-cover" unoptimized />
                                        {uploading && (
                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                <CircleNotchIcon className="h-6 w-6 animate-spin text-white" />
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <PlusIcon className="h-8 w-8" />
                                        <span className="text-xs mt-1">Upload Gambar</span>
                                    </>
                                )}

                                <input
                                    type="file"
                                    ref={fileInputRef}
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
                        {
                            priceType === "paid" && (
                                <FormGroup label="Harga" error={(errors.price as unknown as { message?: string })?.message}>
                                    <FormInput
                                        id="price-input-create"
                                        type="text"
                                        prefix="Rp"
                                        placeholder="0"
                                        suffix={
                                            <div className="flex flex-col">
                                                <button type="button" onClick={() => handlePriceAdjust(1000)}>
                                                    <CaretUpIcon weight="fill" />
                                                </button>
                                                <button type="button" onClick={() => handlePriceAdjust(-1000)}>
                                                    <CaretDownIcon weight="fill" />
                                                </button>
                                            </div>
                                        }
                                        {...register("price", {
                                            setValueAs: (v) => parseDotsToNumber(v as string),
                                        })}
                                    />
                                </FormGroup>
                            )
                        }

                        {/* Link */}
                        <FormGroup label="Link Produk (Google Drive, Dropbox, dll)" error={(errors.link as unknown as { message?: string })?.message}>
                            <FormInput
                                placeholder="https://drive.google.com/..."
                                {...register("link")}
                            />
                        </FormGroup>

                        {/* Benefit */}
                        <FormGroup label="Keuntungan / Benefit" error={(errors.benefit as unknown as { message?: string })?.message}>
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

                        {/* Catatan */}
                        <FormGroup label="Catatan" error={(errors.notes as unknown as { message?: string })?.message}>
                            <FormTextarea
                                placeholder="Masukkan catatan (opsional)"
                                {...register("notes")}
                            />
                        </FormGroup>

                        {/* Status */}
                        <FormGroup label="Status">
                            <FormSelect {...register("status")}>
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                                <option value="archived">Archived</option>
                            </FormSelect>
                        </FormGroup>

                    </div>
                </div >

                <div className="px-10 pb-8 flex justify-end">
                    <ButtonSave
                        onClick={handleSubmit(onSubmit)}
                        isLoading={createProduct.isPending}
                        label="Tambah Produk Digital"
                        icon={PlusIcon}
                        weight="bold"
                    />
                </div>
            </div>
        </div >
    );
}