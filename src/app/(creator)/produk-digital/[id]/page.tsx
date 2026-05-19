"use client";

// React
import React, { useRef, useState, useEffect } from "react";

// Next.js
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";

// Third-party
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Controller } from "react-hook-form";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

// Icons
import {
    ArrowLeftIcon,
    CaretDownIcon,
    CaretUpIcon,
    CircleNotchIcon,
    CopyIcon,
    ImageIcon,
    PlusIcon,
    TrashIcon,
    PencilSimpleIcon,
    X,
} from "@phosphor-icons/react";

// Internal & Utils
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { cn, formatNumberInput } from "~/lib/utils";
import { useProductDigital } from "~/hooks/use-product-digital";

// Components
import { ProductDetailTabs, ProductDetailTabContent } from "~/components/layout/product-detail-tabs";
import { SectionHeader, FormInput, FormTextarea, FormSelect, FormCombobox } from "~/components/ui/form-layout";
import ButtonSave from "~/components/ui/button-save";
import ConfirmDialog from "~/components/ui/confirm-dialog";
import Pembeli from "~/components/pembeli";
import { FormCustomizer } from "~/components/form-customizer";
import { Skeleton } from "~/components/ui/skeleton";

// Dynamic import — MDEditor tidak support SSR
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const Label = ({ children }: { children: React.ReactNode }) => (
    <div className="w-full text-slate-500 text-sm font-medium leading-6 mb-1">{children}</div>
);

const Row = ({ label, error, children, extra }: { label: string; error?: string; children: React.ReactNode, extra?: React.ReactNode }) => (
    <div className="flex flex-col items-start pb-5 gap-0.5 w-full">
        <div className="flex items-center justify-between w-full mb-1">
            <Label>{label}</Label>
            {extra}
        </div>
        <div className="flex-1 w-full text-slate-800 text-sm font-medium leading-6">
            {children}
            {error && <span className="text-red-500 text-xs mt-1 block">{error}</span>}
        </div>
    </div>
);

const VoucherSelector = ({ selectedIds, onChange }: { selectedIds: string[], onChange: (ids: string[]) => void }) => {
    const { data: voucherData, isLoading } = api.vouchers.getAll.useQuery({ limit: 100 });
    const vouchers = voucherData?.items || [];

    const handleToggle = (id: string) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter((i) => i !== id));
        } else {
            onChange([...selectedIds, id]);
        }
    };

    const handleSelectAll = () => {
        if (selectedIds.length === vouchers.length && vouchers.length > 0) {
            onChange([]);
        } else {
            onChange(vouchers.map(v => v.id));
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
                <Label>Pilih Voucher</Label>
                <button
                    type="button"
                    onClick={handleSelectAll}
                    className="w-full flex justify-end text-[12px] text-cyan-600 hover:underline font-medium cursor-pointer"
                >
                    {selectedIds.length === vouchers.length && vouchers.length > 0 ? "Hapus Semua" : "Pilih Semua"}
                </button>
            </div>

            <div className="bg-white border border-slate-300 rounded-lg overflow-hidden">
                <div className="max-h-[200px] overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
                    {isLoading ? (
                        <div className="py-4 flex justify-center">
                            <CircleNotchIcon className="w-5 h-5 animate-spin text-slate-400" />
                        </div>
                    ) : vouchers.length === 0 ? (
                        <div className="py-4 text-center text-xs text-slate-400">
                            Belum ada voucher aktif
                        </div>
                    ) : (
                        vouchers.map((voucher) => {
                            const isGlobal = voucher.usageType === "ALL_PRODUCTS" || voucher.usageType === "SINGLE_CHECKOUT";
                            const isChecked = selectedIds.includes(voucher.id) || isGlobal;
                            return (
                                <label
                                    key={voucher.id}
                                    className={cn(
                                        "flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors",
                                        isChecked ? "bg-cyan-50/50" : "hover:bg-slate-50"
                                    )}
                                >
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-600 disabled:opacity-60 disabled:cursor-not-allowed"
                                        checked={isChecked}
                                        disabled={isGlobal}
                                        onChange={() => handleToggle(voucher.id)}
                                    />
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-slate-700">{voucher.code}</span>
                                            {voucher.usageType === "ALL_PRODUCTS" && (
                                                <span className="text-[9px] bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded font-medium">Semua Produk</span>
                                            )}
                                            {voucher.usageType === "SINGLE_CHECKOUT" && (
                                                <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-medium">1x Checkout</span>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-slate-500">{voucher.name}</span>
                                    </div>
                                </label>
                            );
                        })
                    )}
                </div>
            </div>
            <p className="text-[10px] text-slate-400 italic">
                {selectedIds.length} voucher terpilih
            </p>
        </div>
    );
};

export default function ProdukDigitalDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const searchParams = useSearchParams();
    const utils = api.useUtils();
    const defaultTab = searchParams.get("tab") ?? "detail";
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        form,
        fields,
        append,
        remove,
        uploading,
        onFilesChange,
        removeImage,
        onSubmit,
        isPending,
        isLoadingProduct,
        product,
    } = useProductDigital({ id, isEdit: true });

    const { register, watch, setValue, getValues, control, formState: { errors, isDirty } } = form;
    const description = watch("description");
    const images = watch("images") || [];

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Editor Height drag-resize state
    const [editorHeight, setEditorHeight] = useState(150);
    const isDragging = useRef(false);
    const startY = useRef(0);
    const startHeight = useRef(0);

    const handleMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        startY.current = e.clientY;
        startHeight.current = editorHeight;
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "row-resize";
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging.current) return;
        const delta = e.clientY - startY.current;
        const newHeight = Math.max(150, startHeight.current + delta);
        setEditorHeight(newHeight);
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "default";
    };

    const { data: buyerCount } = api.purchases.countByProductId.useQuery(
        { productId: id },
        { enabled: !!id }
    );

    const deleteProduct = api.products.delete.useMutation({
        onSuccess: () => {
            void utils.products.getAll.invalidate();
            toast.success("Produk Digital berhasil dihapus");
            router.push("/produk-digital");
        },
        onError: (error) => {
            toast.error(`Gagal menghapus produk: ${error.message}`);
            setShowDeleteConfirm(false);
        },
    });

    const { data: catalog } = api.catalog.getMine.useQuery();

    const handleCopyLink = () => {
        if (!product || !catalog?.slug) {
            toast.error("Gagal menyalin link: Data belum siap");
            return;
        }

        const host = window.location.origin;
        const productSlug = product.slug ?? product.id;
        const publicUrl = `${host}/${catalog.slug}/${productSlug}`;

        void navigator.clipboard.writeText(publicUrl);
        toast.success("Link produk disalin!");
    };

    // Format initial price value
    useEffect(() => {
        const input = document.getElementById("price-input-edit") as HTMLInputElement;
        if (input) {
            const currentVal = getValues("price")?.toString() ?? "0";
            input.value = formatNumberInput(currentVal);
        }
    }, [getValues]);

    useEffect(() => {
        const input = document.getElementById("discount-price-input-edit") as HTMLInputElement;
        if (input) {
            const currentVal = getValues("discountPrice")?.toString() ?? "0";
            input.value = formatNumberInput(currentVal);
        }
    }, [getValues, watch("enableDiscount")]);

    const handlePriceAdjust = (amount: number) => {
        const current = Number(getValues("price")?.toString() ?? "0");
        const newPrice = Math.max(0, current + amount);

        setValue("price", newPrice, { shouldValidate: true });

        const input = document.getElementById("price-input-edit") as HTMLInputElement;
        if (input) {
            input.value = formatNumberInput(newPrice.toString());
        }
    };

    const handleDiscountPriceAdjust = (amount: number) => {
        const current = Number(getValues("discountPrice")?.toString() ?? "0");
        const newPrice = Math.max(0, current + amount);

        setValue("discountPrice", newPrice, { shouldValidate: true });

        const input = document.getElementById("discount-price-input-edit") as HTMLInputElement;
        if (input) {
            input.value = formatNumberInput(newPrice.toString());
        }
    };

    const handleQuotaAdjust = (amount: number) => {
        const currentQuota = Number(getValues("capacity") ?? 0);
        const newQuota = Math.max(0, currentQuota + amount);
        setValue("capacity", newQuota, { shouldValidate: true });
    };

    if (isLoadingProduct) {
        return (
            <div className="w-full max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <Skeleton className="h-8 w-64" />

                <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
                    <div className="flex border-b border-slate-200">
                        <Skeleton className="h-14 flex-1" />
                        <Skeleton className="h-14 flex-1" />
                        <Skeleton className="h-14 flex-1" />
                    </div>
                    <div className="p-6 space-y-6">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-40 w-full" />
                    </div>
                </div>
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
        <div className="w-full max-w-7xl mx-auto">
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-slate-50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:sticky sm:top-[74px] bg-slate-50 z-40 -mx-6 px-6 pt-2 pb-0">
                        <div className="flex-1 flex flex-col gap-1">
                            <Link
                                href="/produk-digital"
                                className="group flex items-center gap-2 text-sm font-regular text-slate-600 hover:text-slate-800 transition-colors w-fit mb-2"
                            >
                                <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                                <span className="leading-none">Kembali ke Daftar</span>
                            </Link>

                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                <h1 className="text-xl font-medium text-slate-800 break-words max-w-full">{product.name}</h1>
                                <div className={cn(
                                    "px-2 py-0.5 rounded-full text-sm font-semibold tracking-wider",
                                    (watch("price") ?? 0) > 0
                                        ? "bg-amber-100 text-amber-700 border border-amber-200"
                                        : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                )}>
                                    {(watch("price") ?? 0) > 0 ? "Berbayar" : "Gratis"}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border-cyan-600 hover:bg-cyan-50 hover:shadow-sm h-10 px-4 rounded-lg transition-all cursor-pointer"
                                onClick={handleCopyLink}
                            >
                                <CopyIcon className="w-4 h-4 text-cyan-600" />
                                <span className="text-sm font-regular text-cyan-600 whitespace-nowrap">
                                    Salin Link Produk
                                </span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center justify-center h-10 w-10 p-0 bg-white border-red-500 hover:bg-red-100 hover:shadow-sm rounded-lg transition-all cursor-pointer shrink-0"
                                onClick={() => setShowDeleteConfirm(true)}
                            >
                                <TrashIcon className="w-4 h-4 text-red-500" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="rounded-xl border border-slate-800 overflow-hidden">
                    <ProductDetailTabs defaultTab={defaultTab} buyerCount={buyerCount ?? 0}>
                        <ProductDetailTabContent value="detail" className="bg-transparent overflow-visible">
                            {/* Main Content Area */}
                            <div className="flex-1 min-w-0 bg-white rounded-xl px-4 py-2 sm:px-8 sm:py-8">
                                <SectionHeader title="Informasi Produk Digital" />

                                <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start pt-6">
                                    {/* Kiri: Informasi Produk */}
                                    <div className="flex-1 min-w-0 w-full space-y-0">
                                        <Row label="Nama Produk Digital" error={errors.name?.message}>
                                            <FormInput placeholder="Masukkan nama produk digital" {...register("name")} />
                                        </Row>

                                        <Row label="Ringkasan" error={errors.shortDescription?.message}>
                                            <FormTextarea
                                                placeholder="Masukkan ringkasan tentang produk produk digital ini"
                                                maxLength={200}
                                                {...register("shortDescription")}
                                            />
                                            <p className="text-xs text-slate-400 mt-1">{watch("shortDescription")?.length ?? 0}/200 karakter</p>
                                        </Row>

                                        <Row label="Deskripsi Lengkap" error={errors.description?.message}>
                                            <div data-color-mode="light" className="relative border border-slate-400 rounded-lg overflow-hidden group">
                                                <MDEditor
                                                    textareaProps={{ placeholder: "Masukkan deskripsi lengkap tentang produk digital ini" }}
                                                    value={description ?? ""}
                                                    onChange={(val) => setValue("description", val ?? "")}
                                                    height={editorHeight}
                                                    preview="live"
                                                    visibleDragbar={false}
                                                    style={{ border: "none", boxShadow: "none" }}
                                                    previewOptions={{ remarkPlugins: [remarkGfm, remarkBreaks] }}
                                                />
                                                {/* Custom Drag Handler */}
                                                <div
                                                    onMouseDown={handleMouseDown}
                                                    className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-100 hover:bg-cyan-100 cursor-row-resize flex items-center justify-center transition-colors border-t border-slate-200"
                                                >
                                                    <div className="w-12 h-1 bg-slate-300 rounded-full group-hover:bg-cyan-300" />
                                                </div>
                                            </div>
                                        </Row>

                                        <Row label="Keuntungan" error={errors.benefit?.message}>
                                            <div className="space-y-3 flex flex-col w-full">
                                                {fields.map((field, index) => (
                                                    <div key={field.id} className="flex gap-2">
                                                        <FormInput
                                                            placeholder={`Keuntungan ${index + 1}`}
                                                            className="flex-1"
                                                            {...register(`benefit.${index}` as const)}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="flex h-[52px] w-[52px] items-center justify-center rounded-lg bg-white border border-slate-300 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
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
                                                    <span>Tambah Keuntungan</span>
                                                </button>
                                            </div>
                                        </Row>

                                        <Row
                                            label="Harga"
                                            error={errors.price?.message}
                                            extra={
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[12px] font-medium text-slate-500 tracking-wider">Diskon</span>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only peer"
                                                            {...register("enableDiscount")}
                                                        />
                                                        <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-4 rtl:peer-checked:after:-translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-cyan-600"></div>
                                                    </label>
                                                </div>
                                            }
                                        >
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
                                                                <button type="button" onClick={() => handlePriceAdjust(1000)} className="cursor-pointer">
                                                                    <CaretUpIcon weight="fill" className="w-3 h-3 text-slate-400 hover:text-cyan-600 transition-colors" />
                                                                </button>
                                                                <button type="button" onClick={() => handlePriceAdjust(-1000)} className="cursor-pointer">
                                                                    <CaretDownIcon weight="fill" className="w-3 h-3 text-slate-400 hover:text-cyan-600 transition-colors" />
                                                                </button>
                                                            </div>
                                                        }
                                                    />
                                                )}
                                            />
                                        </Row>

                                        {watch("enableDiscount") && (
                                            <Row label="Harga Diskon" error={errors.discountPrice?.message}>
                                                <Controller
                                                    control={control}
                                                    name="discountPrice"
                                                    render={({ field: { onChange, value, ref } }) => (
                                                        <FormInput
                                                            ref={ref}
                                                            id="discount-price-input-edit"
                                                            prefix="Rp"
                                                            value={formatNumberInput((value ?? 0).toString())}
                                                            onChange={(e) => {
                                                                const rawValue = e.target.value.replace(/\D/g, "");
                                                                onChange(rawValue ? Number(rawValue) : 0);
                                                            }}
                                                            suffix={
                                                                <div className="flex flex-col">
                                                                    <button type="button" onClick={() => handleDiscountPriceAdjust(1000)} className="cursor-pointer">
                                                                        <CaretUpIcon weight="fill" className="w-3 h-3 text-slate-400 hover:text-cyan-600 transition-colors" />
                                                                    </button>
                                                                    <button type="button" onClick={() => handleDiscountPriceAdjust(-1000)} className="cursor-pointer">
                                                                        <CaretDownIcon weight="fill" className="w-3 h-3 text-slate-400 hover:text-cyan-600 transition-colors" />
                                                                    </button>
                                                                </div>
                                                            }
                                                        />
                                                    )}
                                                />
                                            </Row>
                                        )}

                                        {/* Detail Produk Digital */}
                                        <div className="pt-8">
                                            <SectionHeader title="Detail Produk Digital" />
                                            <div className="space-y-0 pt-6">
                                                <Row label="Tipe Konten" error={errors.contentType?.message ?? errors.platformCustom?.message}>
                                                    <div className="space-y-2 w-full">
                                                        <FormSelect
                                                            {...register("contentType", {
                                                                onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
                                                                    if (e.target.value !== "other") {
                                                                        setValue("platformCustom", "");
                                                                    }
                                                                }
                                                            })}
                                                        >
                                                            <option value="PDF">PDF</option>
                                                            <option value="Video">Video</option>
                                                            <option value="Template">Template</option>
                                                            <option value="E-book">E-book</option>
                                                            <option value="ZIP">ZIP</option>
                                                            <option value="other">Lainnya</option>
                                                        </FormSelect>
                                                        {watch("contentType") === "other" && (
                                                            <FormInput
                                                                placeholder="Format file (contoh: EPUB, MP4, dll.)"
                                                                className="animate-in fade-in slide-in-from-top-1 duration-200"
                                                                {...register("platformCustom")}
                                                            />
                                                        )}
                                                    </div>
                                                </Row>

                                                <Row label="Link Akses" error={errors.link?.message}>
                                                    <FormInput placeholder="https://..." {...register("link")} />
                                                </Row>

                                                <Row
                                                    label="Batasi Stok"
                                                    error={errors.capacity?.message}
                                                    extra={
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                className="sr-only peer"
                                                                {...register("enableQuota")}
                                                            />
                                                            <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-4 rtl:peer-checked:after:-translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-cyan-600"></div>
                                                        </label>
                                                    }
                                                >
                                                    {watch("enableQuota") && (
                                                        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                                            <Controller
                                                                control={control}
                                                                name="capacity"
                                                                render={({ field: { onChange, value, ref } }) => (
                                                                    <FormInput
                                                                        ref={ref}
                                                                        value={value ?? ""}
                                                                        onChange={(e) => {
                                                                            const val = e.target.value.replace(/[^0-9]/g, "");
                                                                            onChange(val === "" ? undefined : Number(val));
                                                                        }}
                                                                        suffix={
                                                                            <div className="flex flex-col">
                                                                                <button type="button" onClick={() => handleQuotaAdjust(1)} className="cursor-pointer">
                                                                                    <CaretUpIcon weight="fill" className="w-3 h-3 text-slate-400 hover:text-cyan-600 transition-colors" />
                                                                                </button>
                                                                                <button type="button" onClick={() => handleQuotaAdjust(-1)} className="cursor-pointer">
                                                                                    <CaretDownIcon weight="fill" className="w-3 h-3 text-slate-400 hover:text-cyan-600 transition-colors" />
                                                                                </button>
                                                                            </div>
                                                                        }
                                                                    />
                                                                )}
                                                            />
                                                        </div>
                                                    )}
                                                </Row>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Kanan: Sidebar Metadata */}
                                    <div className="shrink-0 w-full lg:w-[400px] space-y-6">
                                        {/* Gambar Thumbnail */}
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                            <p className="text-slate-700 text-sm font-semibold mb-3">Thumbnail</p>
                                            <div className="flex flex-wrap gap-3 items-start">
                                                {/* List of images */}
                                                {images.map((img: string, index: number) => (
                                                    <div key={index} className="relative group shrink-0 w-24 aspect-square">
                                                        <Image
                                                            src={img}
                                                            alt={`Thumbnail ${index + 1}`}
                                                            fill
                                                            unoptimized
                                                            className="object-cover rounded-xl border border-slate-200"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(index)}
                                                            className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md border border-slate-200 text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                        >
                                                            <X size={12} weight="bold" />
                                                        </button>
                                                    </div>
                                                ))}

                                                {/* Add Button (only if < 4) */}
                                                {images.length < 4 && (
                                                    <div
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="relative group shrink-0 w-24 aspect-square cursor-pointer"
                                                    >
                                                        <div className="w-full h-full bg-white border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center overflow-hidden transition-colors group-hover:border-cyan-500 group-hover:bg-cyan-50">
                                                            {uploading ? (
                                                                <CircleNotchIcon className="animate-spin text-cyan-600" size={24} />
                                                            ) : (
                                                                <div className="flex flex-col items-center gap-1 text-slate-400">
                                                                    <PlusIcon size={24} weight="bold" />
                                                                    <span className="text-[10px] font-medium">Tambah</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <input
                                                            ref={fileInputRef}
                                                            type="file"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={onFilesChange}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-[12px] text-slate-400 mt-3 leading-tight italic">Maksimal 4 gambar. JPG/PNG, 1:1 direkomendasikan</p>
                                        </div>

                                        {/* Status */}
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                            <p className="text-slate-700 text-sm font-semibold mb-3">Status</p>
                                            <FormSelect {...register("status")}>
                                                <option value="published">Published</option>
                                                <option value="unpublished">Unpublished</option>
                                            </FormSelect>
                                            {errors.status?.message && (
                                                <span className="text-red-500 text-xs mt-1 block">{errors.status.message}</span>
                                            )}
                                        </div>

                                        {/* Pengaturan Tambahan */}
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                            <p className="text-slate-700 text-sm font-semibold mb-3">Pengaturan Tambahan</p>
                                            <div className="space-y-4 pt-2">
                                                {/* Voucher Toggle */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-sm font-medium text-slate-700">Aktifkan Voucher</label>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                className="sr-only peer"
                                                                {...register("enableVoucher")}
                                                            />
                                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                                                        </label>
                                                    </div>

                                                    {watch("enableVoucher") && (
                                                        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                                            <VoucherSelector
                                                                selectedIds={watch("vouchers") || []}
                                                                onChange={(ids) => setValue("vouchers", ids)}
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Notes Toggle */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-sm font-medium text-slate-700">Catatan Khusus di Email</label>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                className="sr-only peer"
                                                                {...register("enableNotes")}
                                                            />
                                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                                                        </label>
                                                    </div>

                                                    {watch("enableNotes") && (
                                                        <div className="animate-in fade-in slide-in-from-top-2 duration-200 space-y-1">
                                                            <FormTextarea
                                                                placeholder="Masukkan catatan khusus yang akan dikirim ke email pembeli (misal: link grup WA, dll)"
                                                                className="min-h-[60px]"
                                                                {...register("notes")}
                                                            />
                                                            {errors.notes?.message && (
                                                                <span className="text-red-500 text-xs mt-1 block">{errors.notes.message}</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row justify-between sm:items-center mt-4 pt-4 border-t border-slate-200 gap-4 w-full">
                                    <p className="text-slate-500 text-sm text-left w-full sm:w-auto">
                                        Ditambahkan pada {format(new Date(product.createdAt), "d MMMM yyyy, HH:mm", { locale: idLocale })}
                                    </p>
                                    <div className="w-full sm:w-auto flex justify-end">
                                        <ButtonSave
                                            onClick={onSubmit}
                                            isLoading={isPending}
                                            disabled={!isDirty}
                                            label="Simpan Perubahan"
                                            loadingLabel="Menyimpan..."
                                            weight="bold"
                                        />
                                    </div>
                                </div>

                            </div>
                        </ProductDetailTabContent>

                        <ProductDetailTabContent value="user">
                            <Pembeli productId={id} />
                        </ProductDetailTabContent>

                        <ProductDetailTabContent value="form">
                            <FormCustomizer productId={id} />
                        </ProductDetailTabContent>
                    </ProductDetailTabs>
                </div>

                <ConfirmDialog
                    open={showDeleteConfirm}
                    onOpenChange={setShowDeleteConfirm}
                    icon={<TrashIcon size={52} className="bg-red-100 rounded-full p-3 text-red-500" weight="regular" />}
                    title="Hapus Produk Digital?"
                    description={
                        <>
                            Kamu yakin ingin menghapus {" "}
                            <span className="font-semibold text-slate-800">&quot;{product.name}&quot;</span>?
                            <br />
                            Tindakan ini tidak bisa dibatalkan.
                        </>
                    }
                    confirmText="Ya, Hapus"
                    confirmClassName="bg-red-500 hover:bg-red-600 text-white"
                    loading={deleteProduct.isPending}
                    onConfirm={() => {
                        deleteProduct.mutate({ id });
                    }}
                />
            </div>
        </div>
    );
}