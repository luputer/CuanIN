import type { UseFormReturn, FieldValues, Path, PathValue } from "react-hook-form";
import { FormSelect, FormInput } from "~/components/shared/form-layout";
import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react";

interface VoucherSidebarMetadataProps<TFieldValues extends FieldValues = FieldValues> {
    form: UseFormReturn<TFieldValues>;
    usageCount?: number;
}

export function VoucherSidebarMetadata<TFieldValues extends FieldValues = FieldValues>({
    form,
    usageCount
}: VoucherSidebarMetadataProps<TFieldValues>) {
    const { register, watch, setValue } = form;
    const usageLimit = watch("usageLimit" as Path<TFieldValues>) as number | null | undefined;
    const isLimitEnabled = usageLimit !== undefined && usageLimit !== null;
    const isLimitPerUser = watch("isLimitPerUser" as Path<TFieldValues>) as boolean | undefined;

    return (
        <div className="shrink-0 w-full lg:w-[400px] space-y-6">
            {/* Total Digunakan (Hanya muncul jika ada usageCount) */}
            {usageCount !== undefined && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="text-slate-700 text-sm font-semibold mb-1">Total Digunakan</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-semibold text-slate-800">{usageCount}</span>
                        {usageLimit && (
                            <span className="text-sm text-slate-500 font-medium">/ {usageLimit}</span>
                        )}
                    </div>
                </div>
            )}

            {/* Status */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-slate-700 text-sm font-semibold mb-3">Status</p>
                <FormSelect {...register("status" as Path<TFieldValues>)}>
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                    <option value="expired">Expired</option>
                </FormSelect>
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
                                            setValue("usageLimit" as Path<TFieldValues>, null as PathValue<TFieldValues, Path<TFieldValues>>, { shouldDirty: true });
                                        } else {
                                            setValue("usageLimit" as Path<TFieldValues>, 10 as PathValue<TFieldValues, Path<TFieldValues>>, { shouldDirty: true });
                                        }
                                    }}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cuan-cyan"></div>
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
                                        setValue("usageLimit" as Path<TFieldValues>, (val ? Number(val) : null) as PathValue<TFieldValues, Path<TFieldValues>>, { shouldValidate: true, shouldDirty: true });
                                    }}
                                    placeholder="Masukkan batas kuota voucher"
                                    suffix={
                                        <div className="flex flex-col">
                                            <button type="button" onClick={() => setValue("usageLimit" as Path<TFieldValues>, ((usageLimit ?? 0) + 1) as PathValue<TFieldValues, Path<TFieldValues>>, { shouldValidate: true, shouldDirty: true })} className="cursor-pointer">
                                                <CaretUpIcon weight="fill" className="w-3 h-3 text-slate-400 hover:text-cuan-cyan transition-colors" />
                                            </button>
                                            <button type="button" onClick={() => setValue("usageLimit" as Path<TFieldValues>, Math.max(1, (usageLimit ?? 0) - 1) as PathValue<TFieldValues, Path<TFieldValues>>, { shouldValidate: true, shouldDirty: true })} className="cursor-pointer">
                                                <CaretDownIcon weight="fill" className="w-3 h-3 text-slate-400 hover:text-cuan-cyan transition-colors" />
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
                                checked={!!isLimitPerUser}
                                onChange={() => setValue("isLimitPerUser" as Path<TFieldValues>, !isLimitPerUser as PathValue<TFieldValues, Path<TFieldValues>>, { shouldDirty: true })}
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cuan-cyan"></div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
