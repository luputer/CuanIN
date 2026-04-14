"use client";

import { useForm } from "react-hook-form";
import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, Loader2 } from "lucide-react";
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

    const utils = api.useUtils();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const getPresignedUrl = api.s3.getUploadPresignedUrl.useMutation();

    const createProduct = api.products.create.useMutation({
        onSuccess: () => {
            // Invalidate di background — tidak blocking navigasi
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

        // Preview local
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

            // Gunakan BUCKET_PUBLIC_URL dari env jika perlu, 
            const publicUrl = `https://pub-3098f58e584244c8bf48888938b34bae.r2.dev/${key}`;

            setValue("image", publicUrl, { shouldValidate: true });
            toast.success("Gambar berhasil diunggah");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan";
            toast.error(`Gagal unggah gambar: ${errorMessage}`);
            setPreviewUrl(null);
        } finally {
            setUploading(false);
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

            <div className="bg-cyan-50 p-6 rounded-xl space-y-8">
                {/* ─── Informasi Produk ─── */}
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

                        {/* Deskripsi */}
                        <FormGroup label="Deskripsi" error={errors.description?.message}>
                            <Textarea
                                placeholder="Masukkan Deskripsi Produk"
                                className="min-h-[120px] bg-white border-blue-200 focus-visible:ring-blue-500"
                                {...register("description")}
                            />
                        </FormGroup>

                        {/* Gambar */}
                        <FormGroup label="Gambar">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center border border-blue-300 bg-white hover:bg-blue-50 text-blue-500 transition-colors rounded-lg overflow-hidden relative"
                            >
                                {previewUrl ? (
                                    <>
                                        <Image src={previewUrl} alt="Preview" fill className="object-cover" unoptimized />
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

                        {/* Tipe (free / paid) */}
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

                        {/* Harga — hanya muncul kalau paid */}
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

                        {/* Catatan */}
                        <FormGroup label="Catatan" error={errors.notes?.message}>
                            <Textarea
                                placeholder="Masukkan catatan (opsional)"
                                className="min-h-[120px] bg-white border-blue-200 focus-visible:ring-blue-500"
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