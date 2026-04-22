"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, Loader2, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { productDigitalSchema } from "~/lib/validation";
import MarkdownPreview from "~/components/MarkdownPreview";
import { useImageUpload } from "~/hooks/use-upload";

// Import MDEditor secara dynamic karena tidak support SSR
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

type DigitalProductFormValues = z.infer<typeof productDigitalSchema>;

const FormGroup = ({
    label,
    children,
    error,
}: {
    label: string;
    children: React.ReactNode;
    error?: string;
}) => (
    <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 items-start">
        <Label className="mt-2 text-slate-700 font-medium text-base">{label}</Label>
        <div className="w-full">
            {children}
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    </div>
);

const SectionHeader = ({ title }: { title: string }) => (
    <div className="border-b-2 border-blue-500 pb-2 mb-6">
        <h2 className="text-lg font-bold text-slate-700">{title}</h2>
    </div>
);

export default function CreateDigitalProductPage() {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
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
    const descriptionValue = watch("description");

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
            <div className="flex flex-col gap-2 mb-8">
                <Link
                    href="/produk-digital"
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 w-fit"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Kembali ke Daftar Produk Digital</span>
                </Link>
                <h1 className="text-2xl font-bold text-blue-600">Tambah Produk Digital Baru</h1>
            </div>

            <div className="bg-cyan-50 p-6 rounded-xl space-y-8 border">
                <section>
                    <SectionHeader title="Informasi Produk" />
                    <div className="space-y-5">

                        {/* Nama */}
                        <FormGroup label="Nama" error={errors.name?.message}>
                            <Input
                                placeholder="Masukkan Nama Produk"
                                className="bg-white h-[52px] border-blue-200 focus-visible:ring-blue-500"
                                {...register("name")}
                            />
                        </FormGroup>

                        <FormGroup label="Deskripsi Singkat" error={errors.notes?.message}>
                            <Textarea
                                placeholder="Masukkan Deskripsi Singkat"
                                className="min-h-[100px] bg-white border-blue-200 focus-visible:ring-blue-500"
                                {...register("notes")}
                            />
                        </FormGroup>


                        {/* Deskripsi — MDEditor */}
                        <FormGroup label="Deskripsi" error={errors.description?.message}>
                            <div data-color-mode="light" className="w-full">
                                <MDEditor
                                    value={descriptionValue ?? ""}
                                    onChange={(val) =>
                                        setValue("description", val ?? "", { shouldValidate: true })
                                    }
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
                            </div>
                        </FormGroup>

                        {/* Gambar */}
                        <FormGroup label="Gambar">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center border border-blue-300 bg-white hover:bg-blue-50 text-blue-500 transition-colors rounded-lg overflow-hidden relative"
                            >
                                {previewUrl ? (
                                    <>
                                        <Image
                                            src={previewUrl}
                                            alt="Preview"
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                        {uploading && (
                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                <Loader2 className="h-6 w-6 animate-spin text-white" />
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-8 w-8" />
                                        <span className="text-xs mt-1">Upload</span>
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
                        <FormGroup label="Tipe" error={errors.priceType?.message}>
                            <Select
                                value={priceType}
                                onValueChange={(val) =>
                                    setValue("priceType", val as "free" | "paid", {
                                        shouldValidate: true,
                                    })
                                }
                            >
                                <SelectTrigger className="bg-white w-full border-blue-200 focus:ring-blue-500">
                                    <SelectValue placeholder="Pilih Salah Satu" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="free">Gratis</SelectItem>
                                    <SelectItem value="paid">Berbayar</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormGroup>

                        {/* Harga */}
                        {priceType === "paid" && (
                            <FormGroup label="Harga" error={errors.price?.message}>
                                <div className="relative flex items-center">
                                    <span className="absolute left-3 text-slate-500 pointer-events-none">
                                        Rp
                                    </span>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        className="pl-10 bg-white border-blue-200 focus-visible:ring-blue-500"
                                        {...register("price", { valueAsNumber: true })}
                                    />
                                </div>
                            </FormGroup>
                        )}

                        {/* Link */}
                        <FormGroup label="Link Produk (Google Drive, Dropbox, dll)" error={errors.link?.message}>
                            <Input
                                placeholder="https://drive.google.com/..."
                                className="bg-white border-blue-200 focus-visible:ring-blue-500"
                                {...register("link")}
                            />
                        </FormGroup>

                        {/* Benefit */}
                        <FormGroup label="Keuntungan / Benefit" error={errors.benefit?.message}>
                            <div className="space-y-3">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2">
                                        <Input
                                            placeholder={`Benefit ${index + 1}`}
                                            className="bg-white border-blue-200 focus-visible:ring-blue-500"
                                            {...register(`benefit.${index}` as const)}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => remove(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="border-blue-300 text-blue-600 hover:bg-blue-50 mt-2"
                                    onClick={() => append("")}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Tambah Benefit
                                </Button>
                            </div>
                        </FormGroup>



                        {/* Catatan */}
                        <FormGroup label="Catatan" error={errors.notes?.message}>
                            <Textarea
                                placeholder="Masukkan catatan (opsional)"
                                className="min-h-[100px] bg-white border-blue-200 focus-visible:ring-blue-500"
                                {...register("notes")}
                            />
                        </FormGroup>

                        {/* Status */}
                        <FormGroup label="Status" error={errors.status?.message}>
                            <Select
                                defaultValue="published"
                                onValueChange={(val) =>
                                    setValue("status", val, { shouldValidate: true })
                                }
                            >
                                <SelectTrigger className="bg-white w-full h-[52px] border-blue-200 focus:ring-blue-500">
                                    <SelectValue placeholder="Pilih Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="published" className="text-amber-600 font-medium">
                                        Published
                                    </SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormGroup>

                    </div>
                </section>
            </div>

            <Button
                onClick={handleSubmit(onSubmit)}
                disabled={createProduct.isPending}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-6 text-lg shadow-md shadow-cyan-200 rounded-2xl"
            >
                {createProduct.isPending ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Menyimpan...
                    </>
                ) : (
                    <>
                        Tambah <Plus className="ml-2 h-5 w-5" />
                    </>
                )}
            </Button>

        </div>
    );
}