"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PlusIcon, ArrowLeftIcon, CircleNotchIcon, CaretUpIcon, CaretDownIcon, TrashIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import ButtonSave from "~/components/ui/button-save";
import ButtonCancel from "~/components/ui/button-cancel";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { productDigitalSchema } from "~/lib/validation";
import { formatNumberWithDots, parseDotsToNumber } from "~/lib/utils";
import { FormGroup, SectionHeader, FormInput, FormSelect, FormTextarea } from "~/components/ui/form-layout";

import dynamic from "next/dynamic";
import { useImageUpload } from "~/hooks/use-upload";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { useEffect } from "react";
import ButtonAdd from "~/components/ui/button-add";

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
    const priceValue = watch("price");

    // Format initial price value or when priceType changes to paid
    useEffect(() => {
        if (priceType === "paid") {
            const input = document.getElementById("price-input-create") as HTMLInputElement;
            if (input) {
                const currentVal = getValues("price")?.toString() ?? "0";
                input.value = formatNumberWithDots(currentVal);
            }
        }
    }, [priceType, getValues]);

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
                <div className="px-4 sm:px-10 py-6 sm:py-8">

                    <SectionHeader title="Informasi Produk" />

                    <div>

                        {/* Nama */}
                        <FormGroup label="Nama" error={(errors.name as unknown as { message?: string })?.message}>
                            <FormInput {...register("name")} placeholder="Masukkan nama produk" />
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

                        <FormGroup label="Deskripsi Singkat" align="start" error={(errors.shortDescription as unknown as { message?: string })?.message}>
                            <FormTextarea
                                placeholder="Masukkan deskripsi singkat"
                                {...register("shortDescription")}
                            />
                        </FormGroup>

                        <FormGroup label="Deskripsi" align="start" error={(errors.description as any)?.message}>
                            <div data-color-mode="light" className="border border-slate-400 rounded-lg overflow-hidden">
                                <MDEditor
                                    value={watch("description") ?? ""}
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

                        <FormGroup label="Benefit" align="start" error={(errors.benefit as unknown as { message?: string })?.message}>
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
                                            className="flex h-[52px] w-[52px] items-center justify-center rounded-lg bg-red-50 text-red-500 hover:text-red-700 hover:bg-red-100 transition-colors border border-transparent shrink-0 cursor-pointer"
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
                            <FormGroup label="Harga" error={(errors.price as unknown as { message?: string })?.message}>
                                <Controller
                                    control={control}
                                    name="price"
                                    render={({ field: { onChange, value, ref } }) => (
                                        <FormInput
                                            ref={ref}
                                            id="price-input-create"
                                            prefix="Rp"
                                            value={formatNumberWithDots(value)}
                                            onChange={(e) => {
                                                const val = parseDotsToNumber(e.target.value);
                                                onChange(val);
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

                        {/* Link */}
                        <FormGroup label="Link" error={(errors.link as unknown as { message?: string })?.message}>
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
                        onClick={() => router.push("/produk-digital")}
                    />
                    <ButtonAdd
                        href="#"
                        label="Tambah Produk"
                        weight="bold"
                        onClick={handleSubmit(onSubmit)}
                        isLoading={createProduct.isPending}
                    />
                </div>
            </div>
        </div >
    );
}