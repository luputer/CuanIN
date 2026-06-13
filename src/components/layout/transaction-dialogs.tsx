import { useState, type FormEvent, useEffect } from "react";
import { CreditCardIcon, XIcon } from "@phosphor-icons/react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

import {
    Dialog,
    DialogBody,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog";
import { FormGroup, FormInput, FormSelect } from "~/components/ui/form-layout";
import ButtonSave from "~/components/ui/button-save";
import ButtonCancel from "~/components/ui/button-cancel";
import { StatusBadge } from "~/components/ui/status-badge";
import { formatCurrency, formatNumberInput } from "~/lib/utils";
import { withdrawalSchema, type WithdrawalFormData } from "~/lib/validation";

// ─── Helpers ─────────────────────────────────────────────────────────────

export const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
        case "SUCCEEDED":
        case "COMPLETED":
            return "bg-green-100 text-green-700";
        case "PENDING":
        case "REQUESTED":
        case "ACCEPTED":
            return "bg-yellow-100 text-yellow-700";
        case "FAILED":
        case "CANCELLED":
        case "REVERSED":
            return "bg-red-100 text-red-700";
        case "EXPIRED":
            return "bg-slate-200 text-slate-500";
        default:
            return "bg-slate-100 text-slate-600";
    }
};

export const getStatusLabel = (status: string) => {
    switch (status.toUpperCase()) {
        case "ALL":
            return "Semua Status";
        case "SUCCEEDED":
        case "COMPLETED":
            return "Berhasil";
        case "PENDING":
        case "REQUESTED":
        case "ACCEPTED":
            return "Menunggu";
        case "FAILED":
        case "CANCELLED":
        case "REVERSED":
            return "Gagal";
        case "EXPIRED":
            return "Kedaluwarsa";
        default:
            return status;
    }
};

// ─── Withdrawal Dialog ───────────────────────────────────────────────────

export interface WithdrawalDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: WithdrawalFormData) => void;
    isPending: boolean;
    isAdmin?: boolean;
}

export function WithdrawalDialog({
    open,
    onOpenChange,
    onSubmit,
    isPending,
    isAdmin = false,
}: WithdrawalDialogProps) {
    const [withdrawForm, setWithdrawForm] = useState({
        amount: "",
        bank: "",
        accountNumber: "",
        accountHolderName: "",
    });
    const [withdrawErrors, setWithdrawErrors] = useState<Partial<Record<keyof WithdrawalFormData, string>>>({});

    // Reset form when dialog closes/opens
    useEffect(() => {
        if (!open) {
            setWithdrawErrors({});
            setWithdrawForm({
                amount: "",
                bank: "",
                accountNumber: "",
                accountHolderName: "",
            });
        }
    }, [open]);

    const bankOptions = [
        { value: "bca", label: "BCA" },
        { value: "bni", label: "BNI" },
        { value: "bri", label: "BRI" },
        { value: "mandiri", label: "Mandiri" },
        { value: "cimb", label: "CIMB Niaga" },
        { value: "bsi", label: "BSI" },
    ];
    const errorFieldClassName = "border-red-500 focus:ring-red-500/30 focus:border-red-500";

    const updateWithdrawField = (field: keyof typeof withdrawForm, value: string) => {
        const nextValue = (field === "amount" || field === "accountNumber") ? value.replace(/\D/g, "") : value;
        setWithdrawForm((current) => ({ ...current, [field]: nextValue }));
        setWithdrawErrors((current) => {
            if (!current[field]) return current;
            const next = { ...current };
            delete next[field];
            return next;
        });
    };

    const handleWithdrawalSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const result = withdrawalSchema.safeParse(withdrawForm);
        if (!result.success) {
            const fieldErrors = result.error.flatten().fieldErrors;
            setWithdrawErrors({
                amount: fieldErrors.amount?.[0],
                bank: fieldErrors.bank?.[0],
                accountNumber: fieldErrors.accountNumber?.[0],
                accountHolderName: fieldErrors.accountHolderName?.[0],
            });
            return;
        }
        setWithdrawErrors({});
        onSubmit(result.data);
    };

    const amountVal = Number(withdrawForm.amount);
    const appFee = isAdmin ? 0 : Math.round(amountVal * 0.02);
    const bankFee = 4000;
    const totalDeduction = amountVal + appFee + bankFee;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent size="2xl" showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-center gap-4">
                        <CreditCardIcon className="h-6 w-6" weight="fill" />
                        {isAdmin ? "Penarikan Saldo Admin" : "Penarikan Saldo"}
                    </DialogTitle>
                </DialogHeader>

                <form className="flex flex-col flex-1 overflow-hidden" onSubmit={handleWithdrawalSubmit}>
                    <DialogBody className="px-6 py-6 flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            <div className="space-y-[-14px]">
                                <FormGroup label="Jumlah" layout="vertical" error={withdrawErrors.amount}>
                                    <FormInput
                                        type="text"
                                        inputMode="numeric"
                                        prefix="Rp"
                                        value={formatNumberInput(withdrawForm.amount)}
                                        className={withdrawErrors.amount ? errorFieldClassName : ""}
                                        onChange={(event) => updateWithdrawField("amount", event.target.value)}
                                        placeholder="Contoh: 500000"
                                    />
                                </FormGroup>

                                <FormGroup label="Pilih Bank" layout="vertical" error={withdrawErrors.bank}>
                                    <FormSelect
                                        value={withdrawForm.bank}
                                        className={withdrawErrors.bank ? errorFieldClassName : ""}
                                        onChange={(e) => updateWithdrawField("bank", e.target.value)}
                                    >
                                        <option value="" disabled>Pilih salah satu</option>
                                        {bankOptions.map((bank) => (
                                            <option key={bank.value} value={bank.value}>{bank.label}</option>
                                        ))}
                                    </FormSelect>
                                </FormGroup>

                                <FormGroup label="Atas Nama" layout="vertical" error={withdrawErrors.accountHolderName}>
                                    <FormInput
                                        value={withdrawForm.accountHolderName}
                                        className={withdrawErrors.accountHolderName ? errorFieldClassName : ""}
                                        onChange={(event) => updateWithdrawField("accountHolderName", event.target.value)}
                                        placeholder="Masukkan nama pemilik rekening"
                                    />
                                </FormGroup>

                                <FormGroup label="No Rekening" layout="vertical" error={withdrawErrors.accountNumber}>
                                    <FormInput
                                        inputMode="numeric"
                                        value={withdrawForm.accountNumber}
                                        className={withdrawErrors.accountNumber ? errorFieldClassName : ""}
                                        onChange={(event) => updateWithdrawField("accountNumber", event.target.value)}
                                        placeholder="Masukkan nomor rekening anda"
                                    />
                                </FormGroup>
                            </div>

                            <div className="space-y-4 pt-6">
                                {amountVal > 0 ? (
                                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
                                        <div className="flex justify-between text-[13px] text-slate-600">
                                            <span>Nominal Penarikan</span>
                                            <span className="font-medium text-slate-900">Rp{formatNumberInput(amountVal.toString())}</span>
                                        </div>
                                        {!isAdmin && (
                                            <div className="flex justify-between text-[13px] text-slate-600">
                                                <span>Biaya Aplikasi (2%)</span>
                                                <span className="font-medium text-slate-700">+ Rp{formatNumberInput(appFee.toString())}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-[13px] text-slate-600">
                                            <span>Biaya Transfer Bank</span>
                                            <span className="font-medium text-slate-800">+ Rp4.000</span>
                                        </div>
                                        <div className="border-t border-slate-200 pt-2 flex justify-between font-semibold text-[14px] text-slate-900">
                                            <span>Total Potong Saldo</span>
                                            <span className="text-red-600">
                                                Rp{formatNumberInput(totalDeduction.toString())}
                                            </span>
                                        </div>
                                        <p className="pt-2 text-[11px] text-slate-400 italic leading-relaxed">
                                            * Kamu akan menerima bersih <strong>Rp{formatNumberInput(amountVal.toString())}</strong>.
                                            Total saldo akun yang akan terpotong adalah <strong>Rp{formatNumberInput(totalDeduction.toString())}</strong>.
                                        </p>
                                        {amountVal < 10000 && (
                                            <p className="text-red-500 text-xs pt-2 mt-1 border-t border-red-100 text-center font-medium">
                                                Minimal penarikan adalah Rp10.000.
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center text-slate-500 text-[13px]">
                                        Masukkan nominal penarikan untuk melihat rincian biaya.
                                    </div>
                                )}
                            </div>
                        </div>
                    </DialogBody>

                    <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-lg grid grid-cols-2 gap-3 sm:flex sm:justify-end">
                        <DialogClose asChild>
                            <ButtonCancel label="Batal" className="text-sm h-12 w-full sm:w-auto" />
                        </DialogClose>
                        <ButtonSave
                            type="submit"
                            isLoading={isPending}
                            label="Konfirmasi"
                            icon={null}
                            className="text-sm h-12 w-full sm:w-auto"
                        />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Transaction Detail Dialog ───────────────────────────────────────────

export interface TransactionDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedTx: any;
    viewMode: "creator" | "admin";
}

export function TransactionDetailDialog({
    open,
    onOpenChange,
    selectedTx,
    viewMode,
}: TransactionDetailDialogProps) {
    if (!selectedTx) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent size="default" showCloseButton={false}></DialogContent>
            </Dialog>
        );
    }

    if (viewMode === "admin") {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent size="default" showCloseButton={false}>
                    <DialogHeader className="flex flex-row justify-between items-center text-left pr-4 pl-6 py-4">
                        <DialogTitle className="text-lg">Detail Transaksi</DialogTitle>
                        <DialogClose asChild>
                            <button className="text-slate-400 hover:text-cyan-600 transition-colors p-1 cursor-pointer">
                                <XIcon size={20} weight="bold" />
                            </button>
                        </DialogClose>
                    </DialogHeader>
                    <DialogBody className="px-4 py-6 max-w-2xl mx-auto w-full space-y-6">
                        <div className="flex flex-col items-start justify-center space-y-1 bg-slate-100 p-4 rounded-xl border border-slate-300">
                            <span className="text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                                {selectedTx.user?.role === "ADMIN" ? "Total Penarikan" : "Total Transaksi"}
                            </span>
                            <div className="flex items-center gap-3 pt-1">
                                <span className="text-2xl font-semibold text-slate-800 tracking-tight">
                                    {formatCurrency(Number(selectedTx.amount))}
                                </span>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedTx.status)}`}>
                                    {getStatusLabel(selectedTx.status)}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 px-2">
                            <div className="space-y-1">
                                <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">ID Transaksi</span>
                                <p className="font-medium text-slate-800 text-sm truncate" title={selectedTx.id}>{selectedTx.id}</p>
                            </div>
                            <div className="space-y-1 text-right">
                                <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Tanggal & Waktu</span>
                                <p className="font-medium text-slate-800 text-sm">
                                    {format(new Date(selectedTx.createdAt), "dd MMM yyyy, HH:mm", { locale: idLocale })}
                                </p>
                            </div>
                        </div>

                        <hr className="border-slate-100 mx-2" />

                        <div className="space-y-3 px-2">
                            <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Informasi Akun & Penerima</h4>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Tipe Transaksi</span>
                                <span className="font-medium text-slate-800">{selectedTx.user?.role === "ADMIN" ? "Tarik Saldo" : "Masuk"}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Akun</span>
                                <span className="font-medium text-slate-800">{selectedTx.user?.name || selectedTx.user?.email || "-"}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Metode / Bank</span>
                                <span className="font-medium text-slate-800">{selectedTx.bankName ?? "-"}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">No. Rekening</span>
                                <span className="font-medium text-slate-800">{selectedTx.accountNumber}</span>
                            </div>
                            {selectedTx.accountHolderName && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Atas Nama</span>
                                    <span className="font-medium text-slate-800">{selectedTx.accountHolderName}</span>
                                </div>
                            )}
                        </div>

                        <hr className="border-slate-100 mx-2" />

                        <div className="space-y-3 px-2">
                            <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Rincian Transaksi</h4>
                            {selectedTx.user?.role === "ADMIN" ? (
                                <>
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>Total Penarikan</span>
                                        <span className="font-medium text-slate-800">{formatCurrency(Number(selectedTx.amount))}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>Biaya Transfer Bank</span>
                                        <span className="font-medium text-slate-800">-Rp4.000</span>
                                    </div>
                                    <div className="flex justify-between border-t border-dashed border-slate-200 pt-3 mt-1 font-bold text-[15px] text-slate-900">
                                        <span>Total Diterima</span>
                                        <span className="text-cyan-600">{formatCurrency(Number(selectedTx.amount) - 4000)}</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>Total Transaksi</span>
                                        <span className="font-medium text-slate-800">{formatCurrency(Number(selectedTx.amount))}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>Biaya Transfer Bank</span>
                                        <span className="font-medium text-slate-800">-Rp4.000</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>Fee Platform</span>
                                        <span className="font-medium text-green-600">+{formatCurrency(Number(selectedTx.feeAmount ?? 0))}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>Biaya Transfer Bank</span>
                                        <span className="font-medium text-slate-500">Rp4.000</span>
                                    </div>
                                    <div className="flex justify-between border-t border-dashed border-slate-200 pt-3 mt-1 font-bold text-[15px] text-slate-900">
                                        <span>Total Diterima</span>
                                        <span className="text-cyan-600">
                                            {formatCurrency(Number(selectedTx.amount) - Number(selectedTx.feeAmount ?? 0) - 4000)}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </DialogBody>
                </DialogContent>
            </Dialog>
        );
    }

    // viewMode === "creator"
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent size="default" showCloseButton={false}>
                <DialogHeader className="flex flex-row justify-between items-center text-left pr-4 pl-6 py-4">
                    <DialogTitle className="text-lg">Detail Transaksi</DialogTitle>
                    <DialogClose asChild>
                        <button className="text-slate-400 hover:text-cyan-600 transition-colors p-1 cursor-pointer">
                            <XIcon size={20} weight="bold" />
                        </button>
                    </DialogClose>
                </DialogHeader>
                <DialogBody className="px-4 py-6 max-w-2xl mx-auto w-full space-y-6">
                    <div className="flex flex-col items-start justify-center space-y-1 bg-slate-100 p-5 rounded-xl border border-slate-300">
                        <span className="text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                            {selectedTx.type === "INCOME" ? "Total Pendapatan" : "Total Penarikan"}
                        </span>
                        <div className="flex items-center gap-3 pt-1">
                            <span className="text-2xl font-semibold text-slate-800 tracking-tight">
                                {selectedTx.type === "INCOME" ? "+" : ""} {formatCurrency(selectedTx.type === "INCOME" ? Number(selectedTx.amount) : (Number(selectedTx.amount) - Number(selectedTx.feeAmount ?? 0) - 4000))}
                            </span>
                            <StatusBadge status={selectedTx.status} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 px-2">
                        <div className="space-y-1">
                            <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">ID Transaksi</span>
                            <p className="font-medium text-slate-800 text-sm truncate" title={selectedTx.id}>{selectedTx.id}</p>
                        </div>
                        <div className="space-y-1 text-right">
                            <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Tanggal & Waktu</span>
                            <p className="font-medium text-slate-800 text-sm">
                                {format(new Date(selectedTx.createdAt), "dd MMM yyyy, HH:mm", { locale: idLocale })}
                            </p>
                        </div>
                    </div>

                    <hr className="border-slate-100 mx-2" />

                    <div className="space-y-3 px-2">
                        <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Informasi Akun & Penerima</h4>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Tipe Transaksi</span>
                            <span className="font-medium text-slate-800">{selectedTx.type === "INCOME" ? "Masuk" : "Tarik Saldo"}</span>
                        </div>
                        {selectedTx.type === "INCOME" && (
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Produk</span>
                                <span className="font-medium text-slate-800 text-right max-w-[60%] leading-tight">{selectedTx.product?.name ?? "-"}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">{selectedTx.type === "INCOME" ? "Akun" : "Bank"}</span>
                            <span className="font-medium text-slate-800">{selectedTx.type === "INCOME" ? selectedTx.buyerName : (selectedTx.bankName ?? "-")}</span>
                        </div>
                        {selectedTx.type !== "INCOME" && (
                            <>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">No. Rekening</span>
                                    <span className="font-medium text-slate-800">{selectedTx.accountNumber}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Atas Nama</span>
                                    <span className="font-medium text-slate-800">{selectedTx.accountHolderName}</span>
                                </div>
                            </>
                        )}
                    </div>

                    <hr className="border-slate-100 mx-2" />

                    <div className="space-y-3 px-2">
                        <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Rincian Transaksi</h4>
                        {selectedTx.type === "INCOME" ? (
                            <>
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>Nominal Penjualan</span>
                                    <span className="font-medium text-slate-800">{formatCurrency(Number(selectedTx.amount))}</span>
                                </div>
                                <div className="flex justify-between border-t border-dashed border-slate-200 pt-3 mt-1 font-bold text-[15px] text-slate-900">
                                    <span>Total Diterima</span>
                                    <span className="text-green-600">{formatCurrency(Number(selectedTx.amount))}</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>Total Penarikan</span>
                                    <span className="font-medium text-slate-800">{formatCurrency(Number(selectedTx.amount))}</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>Biaya Transfer Bank</span>
                                    <span className="font-medium text-slate-800">-Rp4.000</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>Biaya Aplikasi (2%)</span>
                                    <span className="font-medium text-slate-800">-Rp{selectedTx.feeAmount ? formatCurrency(Number(selectedTx.feeAmount)) : "0"}</span>
                                </div>
                                <div className="flex justify-between border-t border-dashed border-slate-200 pt-3 mt-1 font-bold text-[15px] text-slate-900">
                                    <span>Total Diterima</span>
                                    <span className="text-cyan-600">
                                        {formatCurrency(Number(selectedTx.amount) - Number(selectedTx.feeAmount ?? 0) - 4000)}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </DialogBody>
            </DialogContent>
        </Dialog>
    );
}
