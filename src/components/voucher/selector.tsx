"use client";

import React from "react";
import { CircleNotchIcon } from "@phosphor-icons/react";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { FormLabel } from "~/components/shared/form-layout";

interface VoucherSelectorProps {
    selectedIds: string[];
    onChange: (ids: string[]) => void;
}

export const VoucherSelector = ({ selectedIds, onChange }: VoucherSelectorProps) => {
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
                <FormLabel>Pilih Voucher</FormLabel>
                <button
                    type="button"
                    onClick={handleSelectAll}
                    className="w-full flex justify-end text-[12px] text-cuan-cyan hover:underline font-medium cursor-pointer"
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
                                        isChecked ? "bg-cuan-cyan/10/50" : "hover:bg-slate-50"
                                    )}
                                >
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 accent-cuan-cyan rounded cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                                        checked={isChecked}
                                        disabled={isGlobal}
                                        onChange={() => handleToggle(voucher.id)}
                                    />
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-slate-700">{voucher.code}</span>
                                            {voucher.usageType === "ALL_PRODUCTS" && (
                                                <span className="text-[9px] bg-cuan-cyan/20 text-007EA5 px-1.5 py-0.5 rounded font-medium">Semua Produk</span>
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
