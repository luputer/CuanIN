"use client";

import { useEffect, useRef, useState } from "react";

import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Loader2, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import type { z } from "zod";
import { Plus } from "lucide-react";


type ProductFormValues = z.infer<typeof productDigitalSchema>;

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
        setValue,
        watch,
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

    // Pre-fill form when data loads
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
                notes: "",
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
                headers: {
                    "Content-Type": file.type,
                },
            });

            if (!res.ok) throw new Error("Gagal upload ke storage");

            const publicUrl = `https://pub-3098f58e584244c8bf48888938b34bae.r2.dev/${key}`;
            setValue("image", publicUrl, { shouldValidate: true });
            toast.success("Gambar berhasil diunggah");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Gagal unggah gambar";
            toast.error(`Gagal unggah gambar: ${errorMessage}`);
            setPreviewUrl(product?.image ?? null);
        } finally {
            setUploading(false);
        }
    };


    const updateProduct = api.products.update.useMutation({
        onSuccess: () => {
            void utils.products.getById.invalidate({ id });
            void utils.products.getAll.invalidate();
            toast.success("Produk Digital berhasil diperbarui");
            router.push(`/produk-digital/${id}`);
        },
        onError: (error) => {
            toast.error(`Gagal memperbarui produk: ${error.message}`);
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
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <p className="text-slate-500 text-lg">Produk tidak ditemukan.</p>
                <Link href="/produk-digital" className="text-blue-500 hover:underline">
                    ← Kembali ke Daftar Produk Digital
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-2 mb-8">
                <Link
                    href={`/produk-digital/${id}`}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 w-fit"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Kembali ke Detail Produk</span>
                </Link>
                <h1 className="text-2xl font-bold text-blue-600">
                    Edit Produk Digital
                </h1>
                <p className="text-slate-500 text-sm">{product.name}</p>
            </div>

            <div className="bg-blue-50 p-6 rounded-xl space-y-8">
                {/* Informasi Produk */}
                <section>
                    <SectionHeader title="Informasi Produk" />
                    <div className="space-y-5">
                        <FormGroup label="Nama" error={errors.name?.message}>
                            <Input
                                placeholder="Masukkan nama produk"
                                className="bg-white h-[52px] border-blue-200 focus-visible:ring-blue-500"
                                {...register("name")}
                            />
                        </FormGroup>

                        <FormGroup label="Deskripsi" error={errors.description?.message}>
                            <Textarea
                                placeholder="Masukkan deskripsi produk"
                                className="min-h-[120px] bg-white border-blue-200 focus-visible:ring-blue-500"
                                {...register("description")}
                            />
                        </FormGroup>

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
                                            unoptimized
                                            className="object-cover" 
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
                                    onChange={handleFileUpload}
                                />
                            </div>
                        </FormGroup>


                        <FormGroup label="Tipe" error={errors.priceType?.message}>
                            <Select
                                value={priceType}
                                onValueChange={(val) => setValue("priceType", val as "free" | "paid", { shouldValidate: true })}
                            >
                                <SelectTrigger className="bg-white w-full h-[52px] border-blue-200 focus:ring-blue-500">
                                    <SelectValue placeholder="Pilih Salah Satu" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="free">Gratis</SelectItem>
                                    <SelectItem value="paid">Berbayar</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormGroup>

                        {priceType === "paid" && (
                            <FormGroup label="Harga" error={errors.price?.message}>
                                <div className="relative">
                                    <span className="absolute left-3 top-3.5 text-slate-500">Rp</span>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        className="pl-10 bg-white h-[52px] border-blue-200 focus-visible:ring-blue-500"
                                        {...register("price", { valueAsNumber: true })}
                                    />
                                </div>
                            </FormGroup>
                        )}

                        <FormGroup label="Link" error={errors.link?.message}>
                            <Input
                                placeholder="https://..."
                                className="bg-white h-[52px] border-blue-200 focus-visible:ring-blue-500"
                                {...register("link")}
                            />
                        </FormGroup>

                        <FormGroup label="Status" error={errors.status?.message}>
                            <Select
                                value={watch("status")}
                                onValueChange={(val) => setValue("status", val, { shouldValidate: true })}
                            >
                                <SelectTrigger className="bg-white w-full h-[52px] border-blue-200 focus:ring-blue-500">
                                    <SelectValue placeholder="Pilih Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="published" className="text-amber-600 font-medium">Published</SelectItem>
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
                disabled={updateProduct.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-lg shadow-md shadow-blue-200"
            >
                {updateProduct.isPending ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Menyimpan...
                    </>
                ) : (
                    <>
                        <Save className="mr-2 h-5 w-5" />
                        Simpan Perubahan
                    </>
                )}
            </Button>
        </div>
    );
}
