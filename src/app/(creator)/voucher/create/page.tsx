"use client"

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeftIcon, CaretDownIcon, CopyIcon } from "@phosphor-icons/react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { FormGroup, FormInput, FormSelect, SectionHeader } from "~/components/ui/form-layout";
import { Calendar } from "~/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import type { DateRange as DayPickerDateRange } from "react-day-picker";

type DateRange = DayPickerDateRange;

function DateTimeRangePicker({
    startDate,
    endDate,
    onChange,
}: {
    startDate?: Date;
    endDate?: Date;
    onChange: (range: { startDate?: Date; endDate?: Date }) => void;
}) {
    const [range, setRange] = useState<DateRange | undefined>(
        startDate || endDate ? { from: startDate, to: endDate } : undefined
    );

    useEffect(() => {
        setRange(startDate || endDate ? { from: startDate, to: endDate } : undefined);
    }, [startDate, endDate]);

    const updateRange = (nextRange: DateRange | undefined) => {
        setRange(nextRange);

        const from = nextRange?.from;
        const to = nextRange?.to;

        onChange({ startDate: from, endDate: to });
    };

    const label = startDate && endDate
        ? `${format(startDate, "d MMM yyyy", { locale: idLocale })} - ${format(endDate, "d MMM yyyy", { locale: idLocale })}`
        : startDate
            ? `${format(startDate, "d MMM yyyy", { locale: idLocale })} - Pilih akhir`
            : "Pilih rentang tanggal mulai dan akhir";

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full justify-between text-left bg-white border-slate-400 hover:bg-slate-50 h-[52px] px-4 rounded-lg focus:ring-2 focus:ring-cyan-600/50 transition-all shadow-none"
                >
                    <span className="text-sm text-left text-slate-700">{label}</span>
                    <CaretDownIcon className="h-4 w-4 text-slate-400" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[520px] p-0" align="start">
                <div className="p-4">
                    <Calendar
                        mode="range"
                        selected={range}
                        onSelect={(next) => updateRange(next as DateRange)}
                        initialFocus
                    />
                    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
                        Klik tanggal awal terlebih dahulu, lalu pilih tanggal akhir.
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

export default function VoucherCreatePage() {
    const router = useRouter();
    const utils = api.useUtils();

    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [type, setType] = useState<"PERSEN" | "NOMINAL">("PERSEN");
    const [discount, setDiscount] = useState(0);
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [status, setStatus] = useState<"aktif" | "nonaktif" | "expired">("aktif");
    const [usageType, setUsageType] = useState<"ALL_PRODUCTS" | "SELECTED_PRODUCTS" | "SINGLE_CHECKOUT">("ALL_PRODUCTS");
    const [usageLimit, setUsageLimit] = useState<number | undefined>();
    const [copiedCode, setCopiedCode] = useState(false);

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

    const handleCopyCode = () => {
        navigator.clipboard.writeText(code);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
        toast.success("Kode voucher disalin");
    };

    const handleSubmit = () => {
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
            usageLimit,
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-slate-50">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sticky top-[74px] bg-slate-50 z-40 -mx-4 px-4 pt-2">
                    <div className="flex-1 flex flex-col gap-1">
                        <Link
                            href="/voucher"
                            className="group flex items-center gap-2 text-sm font-regular text-slate-600 hover:text-slate-800 transition-colors w-fit mb-2"
                        >
                            <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                            <span className="leading-none">Kembali ke Daftar Voucher</span>
                        </Link>
                        <h1 className="text-xl font-semibold text-slate-800">Tambah Voucher Baru</h1>
                    </div>
                </div>
            </div>

            <div className="bg-cyan-50 rounded-xl border border-slate-800 overflow-hidden shadow-[0px_2px_0px_rgba(29,41,61)]">
                <div className="px-4 sm:px-10 py-6 sm:py-8">
                    {/* ─── Informasi Voucher ─── */}
                    <SectionHeader title="Informasi Voucher" />

                    <div className="mt-4">
                        {/* Nama Voucher */}
                        <FormGroup label="Nama Voucher">
                            <FormInput
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder="Masukkan nama voucher"
                            />
                        </FormGroup>

                        {/* Kode Voucher with Copy Button */}
                        <FormGroup label="Kode Voucher">
                            <div className="flex gap-2">
                                <FormInput
                                    value={code}
                                    onChange={(event) => setCode(event.target.value)}
                                    placeholder="Masukkan kode voucher"
                                    className="flex-1"
                                />
                                <button
                                    type="button"
                                    onClick={handleCopyCode}
                                    disabled={!code.trim()}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-300 text-slate-700 rounded-lg border border-slate-300 transition-colors flex items-center gap-2 font-medium"
                                >
                                    <CopyIcon className="w-4 h-4" />
                                    {copiedCode ? "Tersalin" : "Salin"}
                                </button>
                            </div>
                        </FormGroup>

                        {/* Tipe & Diskon */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <FormGroup label="Tipe">
                                <FormSelect value={type} onChange={(event) => setType(event.target.value as "PERSEN" | "NOMINAL") }>
                                    <option value="PERSEN">Persen</option>
                                    <option value="NOMINAL">Nominal</option>
                                </FormSelect>
                            </FormGroup>

                            <FormGroup label="Diskon">
                                <FormInput
                                    type="number"
                                    min={0}
                                    step={type === "PERSEN" ? 1 : 1000}
                                    value={discount}
                                    onChange={(event) => setDiscount(Number(event.target.value))}
                                    prefix={type === "PERSEN" ? "%" : "Rp"}
                                />
                            </FormGroup>
                        </div>

                        {/* Status */}
                        <FormGroup label="Status">
                            <FormSelect value={status} onChange={(event) => setStatus(event.target.value as "aktif" | "nonaktif" | "expired") }>
                                <option value="aktif">Aktif</option>
                                <option value="nonaktif">Nonaktif</option>
                                <option value="expired">Expired</option>
                            </FormSelect>
                        </FormGroup>

                        {/* Jenis Penggunaan */}
                        <FormGroup label="Jenis Penggunaan">
                            <FormSelect value={usageType} onChange={(event) => setUsageType(event.target.value as "ALL_PRODUCTS" | "SELECTED_PRODUCTS" | "SINGLE_CHECKOUT") }>
                                <option value="ALL_PRODUCTS">Gunakan ke semua produk</option>
                                <option value="SELECTED_PRODUCTS">Gunakan ke produk yang dipilih</option>
                                <option value="SINGLE_CHECKOUT">Gunakan untuk satu kali checkout</option>
                            </FormSelect>
                        </FormGroup>

                        {/* Jumlah Voucher */}
                        <FormGroup label="Jumlah Voucher (Opsional)">
                            <FormInput
                                type="number"
                                min={0}
                                value={usageLimit ?? ""}
                                onChange={(event) => setUsageLimit(event.target.value ? Number(event.target.value) : undefined)}
                                placeholder="Kosongkan untuk penggunaan unlimited"
                            />
                        </FormGroup>
                    </div>

                    {/* ─── Periode Berlaku ─── */}
                    <section className="mt-6">
                        <SectionHeader title="Periode Berlaku" />
                        <div className="mt-4">
                            <FormGroup label="Pilih periode mulai dan berakhir sekaligus">
                                <DateTimeRangePicker
                                    startDate={startDate}
                                    endDate={endDate}
                                    onChange={({ startDate, endDate }) => {
                                        setStartDate(startDate);
                                        setEndDate(endDate);
                                    }}
                                />
                            </FormGroup>
                        </div>
                    </section>
                </div>

                {/* Footer Actions */}
                <div className="px-4 sm:px-10 pb-8 flex justify-end gap-4">
                    <Button
                        variant="secondary"
                        onClick={() => router.push("/voucher")}
                        className="w-full sm:w-auto"
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={createMutation.isPending}
                        className="w-full sm:w-auto"
                    >
                        Tambah Voucher
                    </Button>
                </div>
            </div>
        </div>
    );
}
