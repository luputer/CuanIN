"use client";

import { useForm } from "react-hook-form";
import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PlusIcon, ArrowLeftIcon, CircleNotchIcon, CaretUpIcon, CaretDownIcon } from "@phosphor-icons/react";
import ButtonSave from "~/components/ui/button-save";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { productDigitalSchema } from "~/lib/validation";
import { formatNumberWithDots, parseDotsToNumber } from "~/lib/utils";
import { FormGroup, SectionHeader, FormInput, FormSelect } from "~/components/ui/form-layout";

import dynamic from "next/dynamic";
import MarkdownPreview from "~/components/MarkdownPreview";

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
        formState: { errors },
    } = useForm<DigitalProductFormValues>({
        resolver: zodResolver(productDigitalSchema),
        defaultValues: {
            priceType: "free",
            status: "published",
            price: 0,
        },
    });

    const priceType = watch("priceType");
    const descriptionValue = watch("description");

    const utils = api.useUtils();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const getPresignedUrl = api.s3.getUploadPresignedUrl.useMutation();

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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const localUrl = URL.createObjectURL(file);
        setPreviewUrl(localUrl);
        setUploading(true);

        try {
            const key = `products/${Date.now()}-${file.name}`;
            const url = await getPresignedUrl.mutateAsync({
                key,
                fileType: file.type,
            });

            const res = await fetch(url, {
                method: "PUT",
                body: file,
                headers: { "Content-Type": file.type },
            });

            if (!res.ok) throw new Error("Gagal upload ke storage");

            const publicUrl = `https://pub-3098f58e584244c8bf48888938b34bae.r2.dev/${key}`;
            setValue("image", publicUrl, { shouldValidate: true });
            toast.success("Gambar berhasil diunggah");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Terjadi kesalahan";
            toast.error(`Gagal unggah gambar: ${message}`);
            setPreviewUrl(null);
        } finally {
            setUploading(false);
        }
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
                        <FormGroup label="Nama" error={errors.name?.message}>
                            <FormInput
                                placeholder="Masukkan Nama Produk"
                                {...register("name")}
                            />
                        </FormGroup>

                        {/* Deskripsi */}
                        <FormGroup label="Deskripsi" error={errors.description?.message}>
                            <div className="space-y-3">

                                {/* Editor */}
                                <div className="border border-slate-400 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-cyan-500">
                                    <MDEditor
                                        value={descriptionValue ?? ""}
                                        onChange={(val) =>
                                            setValue("description", val ?? "", { shouldValidate: true })
                                        }
                                        preview="edit"
                                        height={250}
                                        visibleDragbar={false}
                                        textareaProps={{
                                            placeholder: "Masukkan deskripsi produk...",
                                        }}
                                    />
                                </div>

                                {/* Preview */}
                                {descriptionValue && (
                                    <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                                        <p className="text-xs text-slate-500 mb-2">Preview</p>
                                        <MarkdownPreview content={descriptionValue} />
                                    </div>
                                )}

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
                                    onChange={handleFileUpload}
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
                                        setValueAs: (v) => parseDotsToNumber(v),
                                    })}
                                />
                            </FormGroup>
                        )}

                        {/* Link */}
                        <FormGroup label="Link" error={errors.link?.message}>
                            <FormInput {...register("link")} placeholder="https://..." />
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
                </div>

                <div className="px-10 pb-8 flex justify-end">
                    <ButtonSave
                        onClick={handleSubmit(onSubmit)}
                        isLoading={createProduct.isPending}
                        label="Tambah Produk Digital"
                        icon={PlusIcon}
                    />
                </div>
            </div>
        </div>
    );
}