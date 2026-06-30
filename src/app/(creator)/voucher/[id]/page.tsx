"use client"

import {
    CaretDownIcon,
    CaretUpIcon,
    CheckIcon,
    CopyIcon,
    TrashIcon
} from "@phosphor-icons/react";
import { format, isBefore, startOfDay } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import ButtonSave from "~/components/shared/button-save";
import { DateRangeOnlyPicker } from "~/components/shared/date-range-only-picker";
import DeleteConfirmDialog from "~/components/shared/delete-confirm-dialog";
import { DetailHeader } from "~/components/shared/detail-header";
import { FormInput, FormRow, FormSelect, SectionHeader } from "~/components/shared/form-layout";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { cn, formatNumberInput } from "~/lib/utils";
import { api } from "~/trpc/react";
import { useEditVoucher } from "~/hooks/creator/use-edit-voucher";
import { VoucherSidebarMetadata } from "~/components/creator/voucher-sidebar-metadata";

export default function VoucherDetailPage() {
    const params = useParams();
    const id = params?.id as string;

    const { form, voucher, isLoading, isPending, isDeleting, isDirty, onSubmit, handleDelete } = useEditVoucher({ id });
    const { register, watch, setValue, formState: { errors } } = form;

    const type = watch("type");
    const discount = watch("discount");
    const usageType = watch("usageType");
    const selectedProductIds = watch("productIds") || [];
    const startDate = watch("startDate");
    const endDate = watch("endDate");

    const { data: productsData } = api.products.getAll.useQuery({ limit: 100 });
    const productsList = productsData?.items ?? [];

    const [copiedCode, setCopiedCode] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleCopyCode = () => {
        const code = watch("code");
        navigator.clipboard.writeText(code);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
        toast.success("Kode voucher disalin");
    };

    if (isLoading || !voucher) {
        return (
            <div className="w-full max-w-7xl mx-auto space-y-6">
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
        <>
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
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border-cuan-cyan hover:bg-cuan-cyan/10 hover:shadow-sm h-10 px-4 rounded-lg transition-all cursor-pointer"
                                onClick={handleCopyCode}
                            >
                                {copiedCode ? (
                                    <CheckIcon className="w-4 h-4 text-cuan-cyan" />
                                ) : (
                                    <CopyIcon className="w-4 h-4 text-cuan-cyan" />
                                )}
                                <span className="text-sm font-regular text-cuan-cyan whitespace-nowrap">
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
                                <FormRow label="Nama Voucher" error={errors.name?.message}>
                                    <FormInput
                                        {...register("name")}
                                        placeholder="Masukkan nama voucher"
                                    />
                                </FormRow>

                                {/* Kode Voucher */}
                                <FormRow label="Kode Voucher" error={errors.code?.message}>
                                    <FormInput
                                        {...register("code")}
                                        placeholder="Masukkan kode voucher"
                                    />
                                </FormRow>

                                {/* Tipe & Diskon */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <FormRow label="Tipe" error={errors.type?.message}>
                                        <FormSelect {...register("type")}>
                                            <option value="PERSEN">Persen</option>
                                            <option value="NOMINAL">Nominal</option>
                                        </FormSelect>
                                    </FormRow>

                                    <FormRow label="Diskon" error={errors.discount?.message}>
                                        <FormInput
                                            type="text"
                                            inputMode="numeric"
                                            value={discount === 0 ? "" : formatNumberInput(discount.toString())}
                                            onChange={(event) => {
                                                const val = event.target.value.replace(/[^0-9]/g, "");
                                                setValue("discount", val ? Number(val) : 0, { shouldValidate: true, shouldDirty: true });
                                            }}
                                            placeholder="0"
                                            prefix={type === "PERSEN" ? "%" : "Rp"}
                                            suffix={
                                                <div className="flex flex-col">
                                                    <button type="button" onClick={() => setValue("discount", discount + (type === "PERSEN" ? 1 : 1000), { shouldValidate: true, shouldDirty: true })} className="cursor-pointer">
                                                        <CaretUpIcon weight="fill" className="size-3 text-slate-400 hover:text-cuan-cyan transition-colors" />
                                                    </button>
                                                    <button type="button" onClick={() => setValue("discount", Math.max(0, discount - (type === "PERSEN" ? 1 : 1000)), { shouldValidate: true, shouldDirty: true })} className="cursor-pointer">
                                                        <CaretDownIcon weight="fill" className="size-3 text-slate-400 hover:text-cuan-cyan transition-colors" />
                                                    </button>
                                                </div>
                                            }
                                        />
                                    </FormRow>
                                </div>

                                {/* Periode Berlaku */}
                                <FormRow label="Periode Berlaku" error={errors.startDate?.message || errors.endDate?.message}>
                                    <DateRangeOnlyPicker
                                        startDate={startDate}
                                        endDate={endDate}
                                        onChange={({ startDate: s, endDate: e }) => {
                                            if (s) setValue("startDate", s, { shouldValidate: true, shouldDirty: true });
                                            if (e) setValue("endDate", e, { shouldValidate: true, shouldDirty: true });
                                        }}
                                        placeholder="Pilih Masa Berlaku"
                                        disabled={(date) => {
                                            const now = new Date();
                                            return isBefore(date, startOfDay(now));
                                        }}
                                    />
                                </FormRow>

                                {/* Penggunaan */}
                                <FormRow label="Jenis Penggunaan" error={errors.usageType?.message}>
                                    <div className="flex flex-col gap-3 w-full border border-slate-300 rounded-lg bg-white p-3">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                value="ALL_PRODUCTS"
                                                checked={usageType === "ALL_PRODUCTS"}
                                                onChange={() => setValue("usageType", "ALL_PRODUCTS", { shouldValidate: true, shouldDirty: true })}
                                                className="size-4 accent-cuan-cyan text-cuan-cyan focus:ring-cuan-cyan border-slate-300"
                                            />
                                            <span className={cn("text-base transition-colors", usageType === "ALL_PRODUCTS" ? "font-medium text-cuan-cyan" : "font-normal text-slate-700")}>Terapkan ke Semua Produk</span>
                                        </label>

                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                value="SELECTED_PRODUCTS"
                                                checked={usageType === "SELECTED_PRODUCTS"}
                                                onChange={() => setValue("usageType", "SELECTED_PRODUCTS", { shouldValidate: true, shouldDirty: true })}
                                                className="size-4 accent-cuan-cyan text-cuan-cyan focus:ring-cuan-cyan border-slate-300"
                                            />
                                            <span className={cn("text-base transition-colors", usageType === "SELECTED_PRODUCTS" ? "font-medium text-cuan-cyan" : "font-normal text-slate-700")}>Terapkan ke Produk Pilihan</span>
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
                                                                        ? "border-cuan-cyan bg-cuan-cyan/10/50"
                                                                        : "border-slate-200 hover:bg-slate-50"
                                                                )}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isChecked}
                                                                        onChange={() => {
                                                                            if (isChecked) {
                                                                                setValue("productIds", selectedProductIds.filter(id => id !== prod.id), { shouldDirty: true });
                                                                            } else {
                                                                                setValue("productIds", [...selectedProductIds, prod.id], { shouldDirty: true });
                                                                            }
                                                                        }}
                                                                        className="size-3.5 accent-cuan-cyan text-cuan-cyan focus:ring-cuan-cyan rounded border-slate-300"
                                                                    />
                                                                    <span className={cn("font-medium transition-colors", isChecked ? "text-cuan-cyan" : "text-slate-700")}>{prod.name}</span>
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

                            <VoucherSidebarMetadata form={form} />
                        </div>

                        {/* Footer Action Buttons */}
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center mt-4 pt-4 border-t border-slate-200 gap-4 w-full">
                            <p className="text-slate-500 text-sm text-left w-full sm:w-auto">
                                Terakhir diperbarui {format(new Date(voucher.updatedAt), "d MMMM yyyy, HH:mm", { locale: idLocale })}
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
                </div>

                {/* Confirm Delete Dialog */}
                <DeleteConfirmDialog
                    open={showDeleteConfirm}
                    onOpenChange={(open) => !open && setShowDeleteConfirm(false)}
                    title="Hapus Voucher?"
                    itemName={`voucher ${voucher?.code || ""}`.trim()}
                    loading={isDeleting}
                    onConfirm={handleDelete}
                />
            </div>
        </div>
        </>
    );
}
