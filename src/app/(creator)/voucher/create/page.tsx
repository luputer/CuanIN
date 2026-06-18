"use client"

import {
    CaretDownIcon,
    CaretUpIcon,
    PlusIcon
} from "@phosphor-icons/react";
import { isBefore, startOfDay } from "date-fns";
import { api } from "~/trpc/react";
import { FormInput, FormSelect, SectionHeader, FormRow } from "~/components/shared/form-layout";
import { DateRangeOnlyPicker } from "~/components/shared/date-range-only-picker";
import { cn, formatNumberInput } from "~/lib/utils";
import { Skeleton } from "~/components/ui/skeleton";
import ButtonSave from "~/components/shared/button-save";
import ButtonCancel from "~/components/shared/button-cancel";
import { DetailHeader } from "~/components/shared/detail-header";
import { VoucherSidebarMetadata } from "~/components/creator/voucher-sidebar-metadata";
import { useCreateVoucher } from "~/hooks/creator/use-create-voucher";

export default function VoucherCreatePage() {
    const { form, router, isPending, onSubmit } = useCreateVoucher();
    const { register, watch, setValue, formState: { errors } } = form;

    // Watch values for conditional rendering and logic
    const type = watch("type");
    const discount = watch("discount");
    const usageType = watch("usageType");
    const selectedProductIds = watch("productIds") || [];
    const startDate = watch("startDate");
    const endDate = watch("endDate");

    const { data: productsData, isLoading: isProductsLoading } = api.products.getAll.useQuery(
        { limit: 100 }
    );
    const productsList = productsData?.items ?? [];

    if (isProductsLoading) {
        return (
            <div className="w-full max-w-7xl mx-auto space-y-6">
                <Skeleton className="h-10 w-48" />
                <div className="rounded-xl border border-slate-800 overflow-hidden bg-white px-4 py-4 sm:px-8 sm:py-8 space-y-6">
                    <Skeleton className="h-6 w-44" />
                    <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start pt-6">
                        {/* Kiri: Form Skeleton */}
                        <div className="flex-1 min-w-0 w-full space-y-5">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <div className="grid grid-cols-2 gap-4">
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                            </div>
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                        {/* Kanan: Sidebar Skeleton */}
                        <div className="shrink-0 w-full lg:w-[400px] space-y-6">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-32 w-full" />
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
                    title="Tambah Voucher Baru"
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
                                                        <CaretUpIcon weight="fill" className="size-3 text-slate-400 hover:text-cyan-600 transition-colors" />
                                                    </button>
                                                    <button type="button" onClick={() => setValue("discount", Math.max(0, discount - (type === "PERSEN" ? 1 : 1000)), { shouldValidate: true, shouldDirty: true })} className="cursor-pointer">
                                                        <CaretDownIcon weight="fill" className="size-3 text-slate-400 hover:text-cyan-600 transition-colors" />
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
                                                className="size-4 accent-cyan-600 text-cyan-600 focus:ring-cyan-600 border-slate-300"
                                            />
                                            <span className={cn("text-base transition-colors", usageType === "ALL_PRODUCTS" ? "font-medium text-cyan-600" : "font-normal text-slate-700")}>Terapkan ke Semua Produk</span>
                                        </label>

                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                value="SELECTED_PRODUCTS"
                                                checked={usageType === "SELECTED_PRODUCTS"}
                                                onChange={() => setValue("usageType", "SELECTED_PRODUCTS", { shouldValidate: true, shouldDirty: true })}
                                                className="size-4 accent-cyan-600 text-cyan-600 focus:ring-cyan-600 border-slate-300"
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
                                                                                setValue("productIds", selectedProductIds.filter(id => id !== prod.id), { shouldDirty: true });
                                                                            } else {
                                                                                setValue("productIds", [...selectedProductIds, prod.id], { shouldDirty: true });
                                                                            }
                                                                        }}
                                                                        className="size-3.5 accent-cyan-600 text-cyan-600 focus:ring-cyan-600 rounded border-slate-300"
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

                            <VoucherSidebarMetadata form={form} />
                        </div>

                        {/* Footer Action Buttons */}
                        <div className="flex flex-col sm:flex-row justify-end sm:items-center mt-4 pt-4 border-t border-slate-200 gap-4 w-full">
                            <div className="w-full sm:w-auto flex justify-end gap-4">
                                <ButtonCancel
                                    type="button"
                                    onClick={() => router.push("/voucher")}
                                />
                                <ButtonSave
                                    onClick={onSubmit}
                                    isLoading={isPending}
                                    label="Tambah Voucher"
                                    loadingLabel="Menambah..."
                                    icon={PlusIcon}
                                    weight="bold"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
