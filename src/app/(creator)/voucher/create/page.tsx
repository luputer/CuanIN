"use client"

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    ArrowLeftIcon,
    CaretDownIcon,
    CaretUpIcon,
    PlusIcon
} from "@phosphor-icons/react";
import { format, isBefore, startOfDay } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { FormInput, FormSelect, SectionHeader } from "~/components/ui/form-layout";
import { DateRangePicker } from "~/components/ui/date-range-picker";
import { Calendar } from "~/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { cn, formatNumberInput } from "~/lib/utils";
import ButtonSave from "~/components/ui/button-save";
import ButtonCancel from "~/components/ui/button-cancel";
import type { DateRange as DayPickerDateRange } from "react-day-picker";

type DateRange = DayPickerDateRange;

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



export default function VoucherCreatePage() {
    const router = useRouter();
    const utils = api.useUtils();

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
    const [usageType, setUsageType] = useState<"ALL_PRODUCTS" | "SELECTED_PRODUCTS" | "SINGLE_CHECKOUT">("ALL_PRODUCTS");
    const [usageLimit, setUsageLimit] = useState<number | undefined>();
    const [isLimitEnabled, setIsLimitEnabled] = useState(false);

    // Multi-selected products list state
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

    const createMutation = api.vouchers.create.useMutation({
        onSuccess: () => {
            toast.success("Voucher berhasil dibuat");
            void utils.vouchers.getAll.invalidate();
            router.push("/voucher");
        },
        onError: (error) => {
            toast.error(error.message || "Gagal membuat voucher");
        },
    });

    const isSaveDisabled = !name.trim() || !code.trim() || !startDate || !endDate;

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

        createMutation.mutate({
            name: name.trim(),
            code: code.trim(),
            type,
            discount,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            status,
            usageType,
            usageLimit: isLimitEnabled ? usageLimit : null,
            productIds: usageType === "SELECTED_PRODUCTS" ? selectedProductIds : [],
        });
    };

    return (
        <div className="w-full max-w-7xl mx-auto">
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-slate-50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-[74px] bg-slate-50 z-40 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-2 pb-0">
                        <div className="flex-1 flex flex-col gap-1 min-w-0">
                            <Link
                                href="/voucher"
                                className="group flex items-center gap-2 text-sm font-regular text-slate-600 hover:text-slate-800 transition-colors w-fit mb-2"
                            >
                                <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                                <span className="leading-none">Kembali ke Daftar</span>
                            </Link>
                            <h1 className="text-xl font-medium text-slate-800 break-words max-w-full">
                                Tambah Voucher Baru
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Form Box */}
                <div className="rounded-xl border border-slate-800 overflow-hidden bg-white">
                    <div className="flex-1 min-w-0 bg-white rounded-xl px-4 py-2 sm:px-8 sm:py-8">
                        <SectionHeader title="Informasi Voucher" />

                        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start pt-6">
                            {/* Kiri: Informasi Voucher */}
                            <div className="flex-1 min-w-0 w-full space-y-0">
                                {/* Nama Voucher */}
                                <Row label="Nama Voucher">
                                    <FormInput
                                        value={name}
                                        onChange={(event) => setName(event.target.value)}
                                        placeholder="Masukkan nama voucher"
                                    />
                                </Row>

                                {/* Kode Voucher */}
                                <Row label="Kode Voucher">
                                    <FormInput
                                        value={code}
                                        onChange={(event) => setCode(event.target.value)}
                                        placeholder="Masukkan kode voucher"
                                    />
                                </Row>

                                {/* Tipe & Diskon */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Row label="Tipe">
                                        <FormSelect value={type} onChange={(event) => setType(event.target.value as "PERSEN" | "NOMINAL")}>
                                            <option value="PERSEN">Persen</option>
                                            <option value="NOMINAL">Nominal</option>
                                        </FormSelect>
                                    </Row>

                                    <Row label="Diskon">
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
                                    </Row>
                                </div>

                                {/* Status */}
                                <Row label="Status">
                                    <FormSelect value={status} onChange={(event) => setStatus(event.target.value as "aktif" | "nonaktif" | "expired")}>
                                        <option value="aktif">Aktif</option>
                                        <option value="nonaktif">Nonaktif</option>
                                        <option value="expired">Expired</option>
                                    </FormSelect>
                                </Row>

                                {/* Penggunaan */}
                                <Row label="Jenis Penggunaan">
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

                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="usageType"
                                                value="SINGLE_CHECKOUT"
                                                checked={usageType === "SINGLE_CHECKOUT"}
                                                onChange={() => setUsageType("SINGLE_CHECKOUT")}
                                                className="w-4 h-4 accent-cyan-600 text-cyan-600 focus:ring-cyan-600 border-slate-300"
                                            />
                                            <span className={cn("text-base transition-colors", usageType === "SINGLE_CHECKOUT" ? "font-medium text-cyan-600" : "font-normal text-slate-700")}>Terapkan hanya untuk 1x Checkout</span>
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
                                </Row>


                            </div>

                            {/* Kanan: Sidebar Metadata */}
                            <div className="shrink-0 w-full lg:w-[400px] space-y-6">
                                {/* Periode Berlaku */}
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <p className="text-slate-700 text-sm font-semibold mb-3">Periode Berlaku</p>
                                    <DateRangePicker
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
                                                            setUsageLimit(10);
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
                                </div>
                            </div>
                        </div>

                        {/* Footer Action Buttons */}
                        <div className="flex flex-col sm:flex-row justify-end sm:items-center mt-4 pt-4 border-t border-slate-200 gap-4 w-full">
                            <div className="w-full sm:w-auto flex justify-end gap-4">
                                <ButtonCancel
                                    type="button"
                                    onClick={() => router.push("/voucher")}
                                />
                                <ButtonSave
                                    onClick={handleSubmit}
                                    isLoading={createMutation.isPending}
                                    disabled={isSaveDisabled}
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
