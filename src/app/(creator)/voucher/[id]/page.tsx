"use client"

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    CaretDownIcon,
    CaretUpIcon,
    CopyIcon,
    TrashIcon,
    CheckIcon
} from "@phosphor-icons/react";
import { format, isBefore, startOfDay } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { FormInput, FormSelect, SectionHeader, FormRow } from "~/components/shared/form-layout";
import { DateRangeOnlyPicker } from "~/components/shared/date-range-only-picker";
import DeleteConfirmDialog from "~/components/shared/delete-confirm-dialog";
import { DetailHeader } from "~/components/shared/detail-header";
import { Skeleton } from "~/components/ui/skeleton";
import { cn, formatNumberInput } from "~/lib/utils";
import ButtonSave from "~/components/shared/button-save";

export default function VoucherDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;
    const utils = api.useUtils();

    const { data: voucher, isLoading } = api.vouchers.getById.useQuery(
        { id },
        { enabled: !!id }
    );

    // Fetch creator's products list
    const { data: productsData } = api.products.getAll.useQuery(
        { limit: 100 }
    );
    const productsList = productsData?.items ?? [];

    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [type, setType] = useState<"PERSEN" | "NOMINAL">("PERSEN");
    const [discount, setDiscount] = useState(0);
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [status, setStatus] = useState<"aktif" | "nonaktif" | "expired">("aktif");
    const [usageType, setUsageType] = useState<"ALL_PRODUCTS" | "SELECTED_PRODUCTS">("ALL_PRODUCTS");
    const [usageLimit, setUsageLimit] = useState<number | undefined>();
    const [isLimitEnabled, setIsLimitEnabled] = useState(false);
    const [isLimitPerUser, setIsLimitPerUser] = useState(false);

    // Multi-selected products list state
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

    const [copiedCode, setCopiedCode] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (voucher) {
            setName(voucher.name ?? "");
            setCode(voucher.code);
            setType(voucher.type);
            setDiscount(Number(voucher.discount));
            setStartDate(new Date(voucher.startDate));
            setEndDate(new Date(voucher.endDate));
            setStatus(voucher.status as "aktif" | "nonaktif" | "expired");
            const validUsageTypes = ["ALL_PRODUCTS", "SELECTED_PRODUCTS"];
            setUsageType(
                validUsageTypes.includes(voucher.usageType)
                    ? (voucher.usageType as "ALL_PRODUCTS" | "SELECTED_PRODUCTS")
                    : "ALL_PRODUCTS"
            );
            setUsageLimit(voucher.usageLimit ?? undefined);
            setIsLimitEnabled(!!voucher.usageLimit);
            setIsLimitPerUser(voucher.isLimitPerUser ?? false);
            if (voucher.products) {
                setSelectedProductIds(voucher.products.map((p: any) => p.id));
            }
        }
    }, [voucher]);

    const isDirty = voucher ? (
        name !== (voucher.name ?? "") ||
        code !== voucher.code ||
        type !== voucher.type ||
        discount !== Number(voucher.discount) ||
        startDate?.getTime() !== new Date(voucher.startDate).getTime() ||
        endDate?.getTime() !== new Date(voucher.endDate).getTime() ||
        status !== voucher.status ||
        usageType !== (voucher.usageType || "ALL_PRODUCTS") ||
        usageLimit !== (voucher.usageLimit ?? undefined) ||
        isLimitPerUser !== (voucher.isLimitPerUser ?? false) ||

        JSON.stringify(selectedProductIds.slice().sort()) !== JSON.stringify((voucher.products || []).map((p: any) => p.id).slice().sort())
    ) : false;

    const updateMutation = api.vouchers.update.useMutation({
        onSuccess: () => {
            toast.success("Voucher berhasil diperbarui");
            void utils.vouchers.getAll.invalidate();
            router.push("/voucher");
        },
        onError: (error) => {
            toast.error(error.message || "Gagal menyimpan voucher");
        },
    });

    const deleteMutation = api.vouchers.delete.useMutation({
        onSuccess: () => {
            toast.success("Voucher berhasil dihapus");
            void utils.vouchers.getAll.invalidate();
            router.push("/voucher");
        },
        onError: (error) => {
            toast.error(error.message || "Gagal menghapus voucher");
            setShowDeleteConfirm(false);
        }
    });

    const handleCopyCode = () => {
        navigator.clipboard.writeText(code);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
        toast.success("Kode voucher disalin");
    };

    const handleDelete = () => {
        deleteMutation.mutate({ id });
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast.error("Nama voucher wajib diisi");
            return;
        }

        if (!code.trim()) {
            toast.error("Kode voucher wajib diisi");
            return;
        }

        if (!startDate || !endDate) {
            toast.error("Periode mulai dan berakhir wajib diisi");
            return;
        }

        if (startDate > endDate) {
            toast.error("Tanggal selesai harus sama atau lebih besar dari tanggal mulai");
            return;
        }

        if (isLimitEnabled && (!usageLimit || usageLimit < 1)) {
            toast.error("Batas kuota voucher harus lebih dari 0");
            return;
        }

        updateMutation.mutate({
            id,
            name: name.trim(),
            code: code.trim(),
            type,
            discount,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            status,
            usageType,
            usageLimit: isLimitEnabled ? usageLimit : null,
            isLimitPerUser,
            productIds: usageType === "SELECTED_PRODUCTS" ? selectedProductIds : [],
        });
    };

    if (isLoading || !voucher) {
        return (
            <div className="w-full max-w-7xl mx-auto space-y-6">
                {/* Header Skeleton */}
                <div className="bg-slate-50">
                    <div className="sticky top-[74px] bg-slate-50 z-40 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-2 pb-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1 flex flex-col gap-1 min-w-0">
                                <Skeleton className="h-4 w-36" />
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-7 w-52" />
                                    <Skeleton className="h-5 w-14 rounded-full" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3">
                                <Skeleton className="h-10 w-32 rounded-lg" />
                                <Skeleton className="h-10 w-10 rounded-lg" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Card Skeleton */}
                <div className="rounded-xl border border-slate-800 overflow-hidden bg-white">
                    <div className="flex-1 min-w-0 bg-white rounded-xl px-4 py-2 sm:px-8 sm:py-8">
                        <Skeleton className="h-6 w-44" />
                        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start pt-6">
                            <div className="flex-1 min-w-0 w-full space-y-0">
                                <div className="space-y-5">
                                    <div className="space-y-1">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-10 w-full rounded-lg" />
                                    </div>
                                    <div className="space-y-1">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-10 w-full rounded-lg" />
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-1">
                                            <Skeleton className="h-4 w-16" />
                                            <Skeleton className="h-10 w-full rounded-lg" />
                                        </div>
                                        <div className="space-y-1">
                                            <Skeleton className="h-4 w-16" />
                                            <Skeleton className="h-10 w-full rounded-lg" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-10 w-full rounded-lg" />
                                    </div>
                                    <div className="space-y-1">
                                        <Skeleton className="h-4 w-28" />
                                        <Skeleton className="h-20 w-full rounded-lg" />
                                    </div>
                                </div>
                            </div>
                            <div className="shrink-0 w-full lg:w-[400px] space-y-6">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-10 w-full rounded-lg" />
                                    <Skeleton className="h-10 w-full rounded-lg" />
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-5 w-full" />
                                    <Skeleton className="h-5 w-full" />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center mt-4 pt-4 border-t border-slate-200 gap-4 w-full">
                            <Skeleton className="h-4 w-56" />
                            <Skeleton className="h-10 w-40 rounded-lg" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto">
            <div className="space-y-6">
                {/* Header */}
                <DetailHeader
                    backLink="/voucher"
                    backLabel="Kembali ke Daftar"
                    title={voucher.code}
                    badges={
                        <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wider",
                            voucher.status === "aktif"
                                ? "bg-green-100 text-green-700 border border-green-200"
                                : voucher.status === "expired"
                                    ? "bg-red-100 text-red-700 border border-red-200"
                                    : "bg-slate-200 text-slate-500 border border-slate-300"
                        )}>
                            {voucher.status === "aktif" ? "Aktif" : voucher.status === "expired" ? "Expired" : "Nonaktif"}
                        </span>
                    }
                    actions={
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border-cyan-600 hover:bg-cyan-50 hover:shadow-sm h-10 px-4 rounded-lg transition-all cursor-pointer"
                                onClick={handleCopyCode}
                            >
                                {copiedCode ? (
                                    <CheckIcon className="w-4 h-4 text-cyan-600" />
                                ) : (
                                    <CopyIcon className="w-4 h-4 text-cyan-600" />
                                )}
                                <span className="text-sm font-regular text-cyan-600 whitespace-nowrap">
                                    Copy Code
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
                        </>
                    }
                />

                {/* Form Box */}
                <div className="rounded-xl border border-slate-800 overflow-hidden bg-white">
                    <div className="flex-1 min-w-0 bg-white rounded-xl px-4 py-2 sm:px-8 sm:py-8">
                        <SectionHeader title="Informasi Voucher" />

                        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start pt-6">
                            {/* Kiri: Informasi Voucher */}
                            <div className="flex-1 min-w-0 w-full space-y-0">
                                {/* Nama Voucher */}
                                <FormRow label="Nama Voucher">
                                    <FormInput
                                        value={name}
                                        onChange={(event) => setName(event.target.value)}
                                        placeholder="Masukkan nama voucher"
                                    />
                                </FormRow>

                                {/* Kode Voucher */}
                                <FormRow label="Kode Voucher">
                                    <FormInput
                                        value={code}
                                        onChange={(event) => setCode(event.target.value)}
                                        placeholder="Masukkan kode voucher"
                                    />
                                </FormRow>

                                {/* Tipe & Diskon */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <FormRow label="Tipe">
                                        <FormSelect value={type} onChange={(event) => setType(event.target.value as "PERSEN" | "NOMINAL")}>
                                            <option value="PERSEN">Persen</option>
                                            <option value="NOMINAL">Nominal</option>
                                        </FormSelect>
                                    </FormRow>

                                    <FormRow label="Diskon">
                                        <FormInput
                                            type="text"
                                            inputMode="numeric"
                                            value={discount === 0 ? "" : formatNumberInput(discount.toString())}
                                            onChange={(event) => {
                                                const val = event.target.value.replace(/[^0-9]/g, "");
                                                setDiscount(val ? Number(val) : 0);
                                            }}
                                            placeholder="0"
                                            prefix={type === "PERSEN" ? "%" : "Rp"}
                                            suffix={
                                                <div className="flex flex-col">
                                                    <button type="button" onClick={() => setDiscount((prev) => prev + (type === "PERSEN" ? 1 : 1000))} className="cursor-pointer">
                                                        <CaretUpIcon weight="fill" className="w-3 h-3 text-slate-400 hover:text-cyan-600 transition-colors" />
                                                    </button>
                                                    <button type="button" onClick={() => setDiscount((prev) => Math.max(0, prev - (type === "PERSEN" ? 1 : 1000)))} className="cursor-pointer">
                                                        <CaretDownIcon weight="fill" className="w-3 h-3 text-slate-400 hover:text-cyan-600 transition-colors" />
                                                    </button>
                                                </div>
                                            }
                                        />
                                    </FormRow>
                                </div>

                                {/* Status */}
                                <FormRow label="Status">
                                    <FormSelect value={status} onChange={(event) => setStatus(event.target.value as "aktif" | "nonaktif" | "expired")}>
                                        <option value="aktif">Aktif</option>
                                        <option value="nonaktif">Nonaktif</option>
                                        <option value="expired">Expired</option>
                                    </FormSelect>
                                </FormRow>

                                {/* Penggunaan */}
                                <FormRow label="Jenis Penggunaan">
                                    <div className="flex flex-col gap-3 w-full border border-slate-300 rounded-lg bg-white p-3">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="usageType"
                                                value="ALL_PRODUCTS"
                                                checked={usageType === "ALL_PRODUCTS"}
                                                onChange={() => setUsageType("ALL_PRODUCTS")}
                                                className="w-4 h-4 accent-cyan-600 text-cyan-600 focus:ring-cyan-600 border-slate-300"
                                            />
                                            <span className={cn("text-base transition-colors", usageType === "ALL_PRODUCTS" ? "font-medium text-cyan-600" : "font-normal text-slate-700")}>Terapkan ke Semua Produk</span>
                                        </label>

                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="usageType"
                                                value="SELECTED_PRODUCTS"
                                                checked={usageType === "SELECTED_PRODUCTS"}
                                                onChange={() => setUsageType("SELECTED_PRODUCTS")}
                                                className="w-4 h-4 accent-cyan-600 text-cyan-600 focus:ring-cyan-600 border-slate-300"
                                            />
                                            <span className={cn("text-base transition-colors", usageType === "SELECTED_PRODUCTS" ? "font-medium text-cyan-600" : "font-normal text-slate-700")}>Terapkan ke Produk Pilihan</span>
                                        </label>
                                    </div>

                                    {usageType === "SELECTED_PRODUCTS" && (
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-200 border border-slate-200 rounded-lg p-4 bg-white mt-2 space-y-2">
                                            <span className="text-md font-regular text-slate-600 block">Pilih Produk:</span>
                                            <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-1">
                                                {productsList.length === 0 ? (
                                                    <p className="text-xs text-slate-400 italic">Belum ada produk.</p>
                                                ) : (
                                                    productsList.map((prod) => {
                                                        const isChecked = selectedProductIds.includes(prod.id);
                                                        return (
                                                            <label
                                                                key={prod.id}
                                                                className={cn(
                                                                    "flex items-center justify-between p-2 rounded border cursor-pointer transition-colors text-sm",
                                                                    isChecked
                                                                        ? "border-cyan-600 bg-cyan-50/50"
                                                                        : "border-slate-200 hover:bg-slate-50"
                                                                )}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isChecked}
                                                                        onChange={() => {
                                                                            if (isChecked) {
                                                                                setSelectedProductIds(selectedProductIds.filter(id => id !== prod.id));
                                                                            } else {
                                                                                setSelectedProductIds([...selectedProductIds, prod.id]);
                                                                            }
                                                                        }}
                                                                        className="w-3.5 h-3.5 accent-cyan-600 text-cyan-600 focus:ring-cyan-600 rounded border-slate-300"
                                                                    />
                                                                    <span className={cn("font-medium transition-colors", isChecked ? "text-cyan-600" : "text-slate-700")}>{prod.name}</span>
                                                                </div>
                                                                <span className="text-xs font-regular text-slate-400 bg-slate-100 border px-1 rounded shrink-0">
                                                                    {prod.type === "DIGITAL_PRODUCT" ? "Produk Digital" : prod.type === "WEBINAR" ? "Webinar" : "Kelas"}
                                                                </span>
                                                            </label>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </FormRow>


                            </div>

                            {/* Kanan: Sidebar Metadata */}
                            <div className="shrink-0 w-full lg:w-[400px] space-y-6">
                                {/* Periode Berlaku */}
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <p className="text-slate-700 text-sm font-semibold mb-3">Periode Berlaku</p>
                                    <DateRangeOnlyPicker
                                        startDate={startDate}
                                        endDate={endDate}
                                        onChange={({ startDate, endDate }) => {
                                            setStartDate(startDate);
                                            setEndDate(endDate);
                                        }}
                                        placeholder="Pilih Masa Berlaku"
                                        disabled={(date) => {
                                            const now = new Date();
                                            return isBefore(date, startOfDay(now));
                                        }}
                                    />
                                </div>

                                {/* Batasan */}
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <p className="text-slate-700 text-sm font-semibold mb-3">Batasan</p>
                                    <div className="space-y-4 pt-2">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-medium text-slate-700">Batasi Jumlah Voucher</label>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={isLimitEnabled}
                                                        onChange={() => {
                                                            if (isLimitEnabled) {
                                                                setUsageLimit(undefined);
                                                            } else {
                                                                setUsageLimit(voucher.usageLimit ?? 10);
                                                            }
                                                            setIsLimitEnabled(!isLimitEnabled);
                                                        }}
                                                    />
                                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                                                </label>
                                            </div>

                                            {isLimitEnabled && (
                                                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <FormInput
                                                        type="text"
                                                        inputMode="numeric"
                                                        value={usageLimit ?? ""}
                                                        onChange={(event) => {
                                                            const val = event.target.value.replace(/[^0-9]/g, "");
                                                            setUsageLimit(val ? Number(val) : undefined);
                                                        }}
                                                        placeholder="Masukkan batas kuota voucher"
                                                        suffix={
                                                            <div className="flex flex-col">
                                                                <button type="button" onClick={() => setUsageLimit((prev) => (prev ?? 0) + 1)} className="cursor-pointer">
                                                                    <CaretUpIcon weight="fill" className="w-3 h-3 text-slate-400 hover:text-cyan-600 transition-colors" />
                                                                </button>
                                                                <button type="button" onClick={() => setUsageLimit((prev) => Math.max(1, (prev ?? 0) - 1))} className="cursor-pointer">
                                                                    <CaretDownIcon weight="fill" className="w-3 h-3 text-slate-400 hover:text-cyan-600 transition-colors" />
                                                                </button>
                                                            </div>
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                                            <label className="text-sm font-medium text-slate-700">Batasi 1x per Pembeli (Email)</label>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={isLimitPerUser}
                                                    onChange={() => setIsLimitPerUser(!isLimitPerUser)}
                                                />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Action Buttons */}
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center mt-4 pt-4 border-t border-slate-200 gap-4 w-full">
                            <p className="text-slate-500 text-sm text-left w-full sm:w-auto">
                                Terakhir diperbarui {format(new Date(voucher.updatedAt), "d MMMM yyyy, HH:mm", { locale: idLocale })}
                            </p>
                            <div className="w-full sm:w-auto flex justify-end">
                                <ButtonSave
                                    onClick={handleSubmit}
                                    isLoading={updateMutation.isPending}
                                    disabled={!isDirty}
                                    label="Simpan Perubahan"
                                    loadingLabel="Menyimpan..."
                                    weight="bold"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Confirm Delete Dialog */}
                <DeleteConfirmDialog
                    open={showDeleteConfirm}
                    onOpenChange={(open) => !open && setShowDeleteConfirm(false)}
                    title="Hapus Voucher?"
                    itemName={`voucher ${voucher?.code || ""}`.trim()}
                    loading={deleteMutation.isPending}
                    onConfirm={handleDelete}
                />
            </div>
        </div>
    );
}
