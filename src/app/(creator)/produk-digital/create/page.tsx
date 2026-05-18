"use client";

// React
import React, { useRef, useState, useEffect } from "react";

// Next.js
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Third-party
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

// Icons
import {
    ArrowLeftIcon,
    CaretDownIcon,
    CaretUpIcon,
    CircleNotchIcon,
    PlusIcon,
    TrashIcon,
    X,
} from "@phosphor-icons/react";

// Internal & Utils
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { cn, formatNumberInput } from "~/lib/utils";
import { productDigitalSchema } from "~/lib/validation";
import { useImageUpload } from "~/hooks/use-upload";

// Components
import { ProductDetailTabs, ProductDetailTabContent } from "~/components/layout/product-detail-tabs";
import { SectionHeader, FormInput, FormTextarea, FormSelect, FormCombobox } from "~/components/ui/form-layout";
import ButtonSave from "~/components/ui/button-save";
import ButtonCancel from "~/components/ui/button-cancel";
import { FormCustomizer, type FormField } from "~/components/form-customizer";

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

type DigitalProductFormValues = {
    name: string;
    shortDescription?: string;
    description: string;
    priceType: "free" | "paid";
    price?: number;
    link: string;
    contentType?: string;
    platformCustom?: string;
    status: string;
    image?: string;
    images?: string[];
    benefit?: string[];
    capacity?: number;
    enableQuota?: boolean;
    enableVoucher?: boolean;
    vouchers?: string[];
    enableNotes?: boolean;
    notes?: string;
    enableDiscount?: boolean;
    discountPrice?: number;
};

export default function CreateProdukDigitalPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const utils = api.useUtils();

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

    // Form Customizer State
    const [customFields, setCustomFields] = useState<FormField[]>([]);

    const {
        uploading,
        handleFileUpload,
    } = useImageUpload("products");

    const form = useForm<DigitalProductFormValues>({
        resolver: zodResolver(productDigitalSchema) as any,
        defaultValues: {
            priceType: "free",
            status: "published",
            price: 0,
            benefit: [""],
            contentType: "PDF",
            platformCustom: "",
            capacity: 0,
            enableQuota: false,
            enableNotes: false,
            notes: "",
            enableVoucher: false,
            vouchers: [],
            enableDiscount: false,
            discountPrice: 0,
            image: "",
            images: [],
        },
    });

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        getValues,
        control,
        formState: { errors },
    } = form;

    const priceType = watch("priceType");
    const description = watch("description");
    const images = watch("images") || [];

    const [benefits, setBenefits] = useState<string[]>([""]);

    const handleAddBenefit = () => {
        setBenefits([...benefits, ""]);
    };

    const handleRemoveBenefit = (index: number) => {
        const updated = benefits.filter((_, i) => i !== index);
        setBenefits(updated);
        setValue("benefit", updated);
    };

    const handleBenefitChange = (index: number, val: string) => {
        const updated = [...benefits];
        updated[index] = val;
        setBenefits(updated);
        setValue("benefit", updated);
    };

    // Format price input helper
    useEffect(() => {
        const input = document.getElementById("price-input-create") as HTMLInputElement;
        if (input) {
            const currentVal = getValues("price")?.toString() ?? "0";
            input.value = formatNumberInput(currentVal);
        }
    }, [getValues]);

    useEffect(() => {
        const input = document.getElementById("discount-price-input-create") as HTMLInputElement;
        if (input) {
            const currentVal = getValues("discountPrice")?.toString() ?? "0";
            input.value = formatNumberInput(currentVal);
        }
    }, [getValues, watch("enableDiscount")]);

    const handlePriceAdjust = (amount: number) => {
        const currentPrice = Number(getValues("price")?.toString() ?? "0");
        const newPrice = Math.max(0, currentPrice + amount);
        setValue("price", newPrice, { shouldValidate: true });

        const input = document.getElementById("price-input-create") as HTMLInputElement;
        if (input) {
            input.value = formatNumberInput(newPrice.toString());
        }
    };

    const handleDiscountPriceAdjust = (amount: number) => {
        const currentPrice = Number(getValues("discountPrice")?.toString() ?? "0");
        const newPrice = Math.max(0, currentPrice + amount);
        setValue("discountPrice", newPrice, { shouldValidate: true });

        const input = document.getElementById("discount-price-input-create") as HTMLInputElement;
        if (input) {
            input.value = formatNumberInput(newPrice.toString());
        }
    };

    const handleQuotaAdjust = (amount: number) => {
        const currentQuota = Number(getValues("capacity") ?? 0);
        const newQuota = Math.max(0, currentQuota + amount);
        setValue("capacity", newQuota, { shouldValidate: true });
    };

    const onFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = await handleFileUpload(e);
        if (url) {
            const currentImages = getValues("images") || [];
            if (currentImages.length < 4) {
                const newImages = [...currentImages, url];
                setValue("images", newImages, { shouldValidate: true });
                // Main image is the first one if not set
                if (!getValues("image")) {
                    setValue("image", url, { shouldValidate: true });
                }
            } else {
                toast.error("Maksimal 4 gambar");
            }
        }
        e.target.value = "";
    };

    const removeImage = (index: number) => {
        const currentImages = getValues("images") || [];
        const newImages = currentImages.filter((_, i) => i !== index);
        setValue("images", newImages, { shouldValidate: true });
        // Update main image if we removed it
        if (getValues("image") === currentImages[index]) {
            setValue("image", newImages[0] || "", { shouldValidate: true });
        }
    };

    // ─── API Mutations ────────────────────────────────────────────────────────

    const saveMutation = api.formFields.save.useMutation();

    const createProduct = api.products.create.useMutation({
        onSuccess: async (product) => {
            // Save Form Customizer fields if any
            if (customFields.length > 0) {
                try {
                    await saveMutation.mutateAsync({
                        productId: product.id,
                        fields: customFields.map((f, index) => ({
                            id: f.id,
                            label: f.label.trim() || "Pertanyaan Tanpa Judul",
                            type: f.type,
                            required: f.required,
                            options: f.options,
                            order: index,
                        })),
                    });
                } catch (e) {
                    console.error("Gagal menyimpan kustomisasi form:", e);
                }
            }

            void utils.products.getAll.invalidate();
            toast.success("Produk Digital berhasil dibuat");
            router.push("/produk-digital");
        },
        onError: (error) => {
            toast.error(`Gagal membuat produk digital: ${error.message}`);
        },
    });

    const onSubmit = (data: DigitalProductFormValues) => {
        const actualContentType = data.contentType === "other" ? data.platformCustom : data.contentType;
        createProduct.mutate({
            type: "DIGITAL_PRODUCT",
            name: data.name,
            shortDescription: data.shortDescription,
            description: data.description,
            price: data.price ?? 0,
            link: data.link,
            contentType: actualContentType,
            status: data.status,
            benefit: benefits.filter((b) => b.trim() !== ""),
            image: data.image,
            images: data.images,
            capacity: data.enableQuota ? data.capacity : 0,
            notes: data.enableNotes ? data.notes : undefined,
            vouchers: data.enableVoucher ? data.vouchers : [],
            discountPrice: data.enableDiscount ? data.discountPrice : undefined,
        });
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
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
                        <h1 className="text-xl font-medium text-slate-800">Tambah Produk Digital Baru</h1>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="rounded-xl border border-slate-800 overflow-hidden">
                <ProductDetailTabs defaultTab="detail" buyerCount={0} hidePembeli={true}>
                    <ProductDetailTabContent value="detail" className="bg-transparent overflow-visible">
                        {/* Main Content Area */}
                        <div className="flex-1 min-w-0 bg-white rounded-xl px-4 py-2 sm:px-8 sm:py-8">
                            <SectionHeader title="Informasi Produk Digital" />

                            <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start pt-6">
                                {/* Kiri: Informasi Produk */}
                                <div className="flex-1 min-w-0 w-full space-y-0">
                                    <Row label="Nama Produk" error={errors.name?.message}>
                                        <FormInput placeholder="Masukkan nama produk" {...register("name")} />
                                    </Row>

                                    <Row label="Ringkasan" error={errors.shortDescription?.message}>
                                        <FormTextarea
                                            placeholder="Masukkan ringkasan tentang produk ini"
                                            maxLength={200}
                                            {...register("shortDescription")}
                                        />
                                        <p className="text-xs text-slate-400 mt-1">{watch("shortDescription")?.length ?? 0}/200 karakter</p>
                                    </Row>

                                    <Row label="Deskripsi Lengkap" error={errors.description?.message}>
                                        <div data-color-mode="light" className="relative border border-slate-400 rounded-lg overflow-hidden group">
                                            <MDEditor
                                                textareaProps={{ placeholder: "Masukkan deskripsi lengkap tentang produk ini" }}
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

                                    <Row label="Keuntungan / Benefit" error={errors.benefit?.message}>
                                        <div className="space-y-3 flex flex-col w-full">
                                            {benefits.map((benefit, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <FormInput
                                                        placeholder={`Benefit ${index + 1}`}
                                                        className="flex-1"
                                                        value={benefit}
                                                        onChange={(e) => handleBenefitChange(index, e.target.value)}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="flex h-[52px] w-[52px] items-center justify-center rounded-lg bg-white border border-slate-300 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                                                        onClick={() => handleRemoveBenefit(index)}
                                                    >
                                                        <TrashIcon className="h-5 w-5 translate-y-[0.5px]" weight="bold" />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={handleAddBenefit}
                                                className="flex justify-center items-center gap-2 bg-white border border-slate-400 rounded-lg py-2 px-4 text-sm font-regular text-slate-800 hover:bg-slate-100 w-fit cursor-pointer"
                                            >
                                                <PlusIcon className="h-4 w-4" weight="regular" />
                                                <span>Tambah Benefit</span>
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
                                                    id="price-input-create"
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
                                                        id="discount-price-input-create"
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

                                    <Row label="Status">
                                        <FormSelect {...register("status")}>
                                            <option value="published">Published</option>
                                            <option value="unpublished">Unpublished</option>
                                        </FormSelect>
                                    </Row>

                                    {/* Pengaturan Tambahan */}
                                    <div className="pt-8">
                                        <SectionHeader title="Pengaturan Tambahan" />
                                        <div className="space-y-6 pt-6">
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
                                                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                                        <Row label="" error={errors.notes?.message}>
                                                            <FormTextarea
                                                                placeholder="Masukkan catatan khusus yang akan dikirim ke email pembeli (misal: link download, petunjuk lisensi, dsb)"
                                                                className="min-h-[60px]"
                                                                {...register("notes")}
                                                            />
                                                        </Row>
                                                    </div>
                                                )}
                                            </div>
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

                                    {/* Akses Produk Digital */}
                                    <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                                        <SectionHeader title="Akses Produk Digital" className="mb-4 text-base" />

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

                                        <Row label="Link Akses Produk" error={errors.link?.message}>
                                            <FormInput placeholder="https://..." {...register("link")} />
                                        </Row>
                                    </div>

                                    {/* Pengaturan Stok */}
                                    <div className="bg-slate-50 px-4 pt-2 pb-4 rounded-xl border border-slate-200">
                                        <SectionHeader title="Pengaturan Stok" className="mb-4 text-base" />
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between py-1">
                                                <label className="text-sm font-medium text-slate-700">Batasi Stok</label>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        {...register("enableQuota")}
                                                    />
                                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                                                </label>
                                            </div>

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
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end sm:items-center mt-4 pt-4 border-t border-slate-200 gap-4 w-full">
                                <div className="w-full sm:w-auto flex justify-end gap-4">
                                    <ButtonCancel
                                        type="button"
                                        onClick={() => router.push("/produk-digital")}
                                    />
                                    <ButtonSave
                                        onClick={handleSubmit(onSubmit)}
                                        isLoading={createProduct.isPending || saveMutation.isPending}
                                        label="Tambah Produk"
                                        loadingLabel="Menambahkan..."
                                        icon={PlusIcon}
                                        weight="bold"
                                    />
                                </div>
                            </div>

                        </div>
                    </ProductDetailTabContent>

                    <ProductDetailTabContent value="form">
                        <FormCustomizer value={customFields} onChange={setCustomFields} />
                    </ProductDetailTabContent>
                </ProductDetailTabs>
            </div>
        </div>
    );
}