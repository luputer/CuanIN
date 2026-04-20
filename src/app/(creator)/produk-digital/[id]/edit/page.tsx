"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

import {
    PlusIcon,
    ArrowLeftIcon,
    CircleNotchIcon,
    CaretUpIcon,
    CaretDownIcon,
} from "@phosphor-icons/react";

import dynamic from "next/dynamic";
import MarkdownPreview from "~/components/MarkdownPreview";

import { api } from "~/trpc/react";
import { toast } from "sonner";
import { productDigitalSchema } from "~/lib/validation";
import { formatNumberWithDots, parseDotsToNumber } from "~/lib/utils";

import ButtonSave from "~/components/ui/button-save";
import {
    FormGroup,
    SectionHeader,
    FormInput,
    FormSelect,
} from "~/components/ui/form-layout";

// Markdown Editor
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

type ProductFormValues = z.infer<typeof productDigitalSchema>;

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const { data: product, isLoading } = api.products.getById.useQuery({ id });
    const utils = api.useUtils();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const getPresignedUrl = api.s3.getUploadPresignedUrl.useMutation();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        getValues,
        reset,
        formState: { errors },
    } = useForm<ProductFormValues>({
        resolver: zodResolver(productDigitalSchema),
        defaultValues: {
            priceType: "free",
            status: "published",
            price: 0,
        },
    });

    const priceType = watch("priceType");
    const descriptionValue = watch("description");

    // Prefill
    useEffect(() => {
        if (product) {
            const priceVal = Number(product.price);

            reset({
                name: product.name,
                description: product.description ?? "",
                priceType: priceVal === 0 ? "free" : "paid",
                price: priceVal,
                link: product.link ?? "",
                status: product.status ?? "published",
                image: product.image ?? undefined,
            });

            if (product.image) setPreviewUrl(product.image);
        }
    }, [product, reset]);

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

            if (!res.ok) throw new Error("Gagal upload");

            const publicUrl = `https://pub-3098f58e584244c8bf48888938b34bae.r2.dev/${key}`;
            setValue("image", publicUrl, { shouldValidate: true });

            toast.success("Gambar berhasil diunggah");
        } catch (err) {
            toast.error("Gagal upload gambar");
            setPreviewUrl(product?.image ?? null);
        } finally {
            setUploading(false);
        }
    };

    const handlePriceAdjust = (amount: number) => {
        const current = parseDotsToNumber(getValues("price")?.toString() ?? "0");
        const newPrice = Math.max(0, current + amount);

        setValue("price", newPrice, { shouldValidate: true });

        const input = document.getElementById("price-input-edit") as HTMLInputElement;
        if (input) {
            input.value = formatNumberWithDots(newPrice.toString());
        }
    };

    const updateProduct = api.products.update.useMutation({
        onSuccess: () => {
            void utils.products.getAll.invalidate();
            toast.success("Produk berhasil diperbarui");
            router.push(`/produk-digital/${id}`);
        },
        onError: (err) => {
            toast.error(err.message);
        },
    });

    const onSubmit = (data: ProductFormValues) => {
        updateProduct.mutate({
            id,
            name: data.name,
            description: data.description,
            price: data.priceType === "free" ? 0 : (data.price ?? 0),
            link: data.link,
            status: data.status,
            image: data.image,
        });
    };

    if (isLoading) {
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

                        {/* Deskripsi */}
                        <FormGroup label="Deskripsi" error={errors.description?.message}>
                            <div className="space-y-3">

                                <div className="border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-cyan-500">
                                    <MDEditor
                                        value={descriptionValue ?? ""}
                                        onChange={(val) =>
                                            setValue("description", val ?? "", { shouldValidate: true })
                                        }
                                        preview="edit"
                                        height={250}
                                        visibleDragbar={false}
                                    />
                                </div>

                                {descriptionValue && (
                                    <div className="p-4 border rounded-lg bg-slate-50">
                                        <MarkdownPreview content={descriptionValue} />
                                    </div>
                                )}
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
                                        <Image src={previewUrl} alt="Preview" fill className="object-cover" unoptimized />
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
                        isLoading={updateProduct.isPending}
                        label="Simpan Perubahan"
                    />
                </div>
            </div>
        </div>
    );
}