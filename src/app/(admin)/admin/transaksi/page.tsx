"use client";

import Link from "next/link";

import { useState, type FormEvent } from "react";
import { WalletIcon, ArrowUpRightIcon, CreditCardIcon, EyeIcon, XIcon } from "@phosphor-icons/react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { api } from "~/trpc/react";
import { useDebounce } from "~/hooks/use-debounce";
import { withdrawalSchema, type WithdrawalFormData } from "~/lib/validation";
import { toast } from "sonner";
import { Skeleton } from "~/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "~/components/ui/dropdown-menu";
import {
    Dialog,
    DialogBody,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog";
import ButtonFilter from "~/components/ui/filter";
import SearchInput from "~/components/ui/search";
import ActionButton from "~/components/ui/button-add";
import ButtonSave from "~/components/ui/button-save";
import ButtonCancel from "~/components/ui/button-cancel";
import { FormGroup, FormInput, FormSelect } from "~/components/ui/form-layout";
import {
    Table,
    TableHead,
    TableHeader,
    TableRow,
    TableBody,
    TableCell,
    TablePagination,
} from "~/components/ui/table";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "~/components/ui/tooltip";
import { formatCurrency, formatNumberInput } from "~/lib/utils";

export default function AdminTransactionPage() {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("ALL");
    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
    const [selectedTx, setSelectedTx] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [withdrawForm, setWithdrawForm] = useState({
        amount: "",
        bank: "",
        accountNumber: "",
        accountHolderName: "",
    });
    const [withdrawErrors, setWithdrawErrors] = useState<Partial<Record<keyof WithdrawalFormData, string>>>({});

    const debouncedSearch = useDebounce(search, 500);
    const utils = api.useUtils();

    const { data, isLoading } = api.admin.getWithdrawals.useQuery({
        page,
        limit,
        search: debouncedSearch,
        status,
    }, {
        placeholderData: (prev) => prev,
    });

    const stats = {
        totalIncome: data?.stats.totalIncome ?? 0,
        totalTransactions: data?.stats.totalTransactions ?? 0,
        balance: data?.stats.balance ?? 0,
        incomeChange: data?.stats.incomeChange ?? 0,
        transactionsChange: data?.stats.transactionsChange ?? 0,
    };

    const transactions = data?.items ?? [];
    const totalPages = data?.totalPages ?? 0;
    const totalItems = data?.total ?? 0;

    const bankOptions = [
        { value: "bca", label: "BCA" },
        { value: "bni", label: "BNI" },
        { value: "bri", label: "BRI" },
        { value: "mandiri", label: "Mandiri" },
        { value: "cimb", label: "CIMB Niaga" },
        { value: "bsi", label: "BSI" },
    ];
    const errorFieldClassName = "border-red-500 focus:ring-red-500/30 focus:border-red-500";

    const createWithdrawal = api.withdrawals.create.useMutation({
        onSuccess: async () => {
            toast.success("Penarikan saldo berhasil diproses");
            setIsWithdrawOpen(false);
            setWithdrawForm({ amount: "", bank: "", accountNumber: "", accountHolderName: "" });
            setWithdrawErrors({});
            await utils.admin.getWithdrawals.invalidate();
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

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
        createWithdrawal.mutate(result.data);
    };

    const handleWithdrawDialogOpenChange = (open: boolean) => {
        setIsWithdrawOpen(open);
        if (!open) setWithdrawErrors({});
    };

    const getStatusColor = (status: string) => {
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

    const getStatusLabel = (status: string) => {
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

    return (
        <TooltipProvider>
            <div className="w-full max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-slate-50">
                    <div className="sticky top-[74px] bg-slate-50 z-40 -mx-4 sm:-mx-6 px-4 sm:px-6 mb-2">
                        <div className="text-2xl font-bold mb-2 text-cyan-600">Daftar Transaksi</div>
                        <div className="text-sm font-regular text-slate-600">
                            Lihat riwayat penarikan kreator dan tarik pendapatan admin.
                        </div>
                    </div>
                </div>

                {/* Stats Card */}
                <div className="flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-cyan-50 p-0 shadow-[0px_1px_0px_rgba(29,41,61)] md:flex-row">
                    {/* Balance Section */}
                    <div className="flex flex-1 flex-col justify-between border-b border-slate-200 p-6 md:border-r md:border-b-0">
                        <div className="mb-4 flex items-center gap-2 text-slate-800">
                            <WalletIcon className="h-5 w-5 text-cyan-600" weight="fill" />
                            <span className="text-sm font-medium">Saldo saat ini</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                            <h2 className="text-2xl font-semibold text-cyan-600">
                                {isLoading && !data ? (
                                    <Skeleton className="h-8 w-40" />
                                ) : (
                                    formatCurrency(stats.balance)
                                )}
                            </h2>
                            <Dialog open={isWithdrawOpen} onOpenChange={handleWithdrawDialogOpenChange}>
                                <DialogTrigger asChild>
                                    <ActionButton label="Tarik Saldo" icon={ArrowUpRightIcon} variant="secondary" />
                                </DialogTrigger>
                                <DialogContent size="2xl" showCloseButton={false}>
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center justify-center gap-4">
                                            <CreditCardIcon className="h-6 w-6" weight="fill" />
                                            Penarikan Saldo Admin
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
                                                    {/* Transaction Summary */}
                                                    {Number(withdrawForm.amount) > 0 ? (
                                                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
                                                            <div className="flex justify-between text-[13px] text-slate-600">
                                                                <span>Nominal Penarikan</span>
                                                                <span className="font-medium text-slate-900">Rp{formatNumberInput(withdrawForm.amount)}</span>
                                                            </div>
                                                            <div className="flex justify-between text-[13px] text-slate-600">
                                                                <span>Biaya Transfer Bank</span>
                                                                <span className="font-medium text-slate-800">+ Rp4.000</span>
                                                            </div>
                                                            <div className="border-t border-slate-200 pt-2 flex justify-between font-semibold text-[14px] text-slate-900">
                                                                <span>Total Potong Saldo</span>
                                                                <span className="text-red-600">
                                                                    Rp{formatNumberInput((Number(withdrawForm.amount) + 4000).toString())}
                                                                </span>
                                                            </div>
                                                            <p className="pt-2 text-[11px] text-slate-400 italic leading-relaxed">
                                                                * Kamu akan menerima bersih <strong>Rp{formatNumberInput(withdrawForm.amount)}</strong>.
                                                                Total saldo akun yang akan terpotong adalah <strong>Rp{formatNumberInput((Number(withdrawForm.amount) + 4000).toString())}</strong>.
                                                            </p>
                                                            {Number(withdrawForm.amount) < 10000 && (
                                                                <p className="text-red-500 text-xs pt-2 border-t border-red-100 text-center font-medium">
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
                                                isLoading={createWithdrawal.isPending}
                                                label="Konfirmasi"
                                                icon={null}
                                                className="text-sm h-12 w-full sm:w-auto"
                                            />
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* Total Income */}
                    <div className="flex flex-col justify-center border-b border-slate-200 p-6 md:w-72 md:border-r md:border-b-0">
                        <p className="mb-2 text-xs font-bold text-slate-700">
                            Total Penghasilan
                        </p>
                        <h3 className="mb-2 text-xl font-semibold text-cyan-600">
                            {isLoading && !data ? (
                                <Skeleton className="h-7 w-32" />
                            ) : (
                                formatCurrency(stats.totalIncome)
                            )}
                        </h3>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">30 hari terakhir</span>
                            <span className={`rounded-full px-2 py-1 font-medium ${stats.incomeChange >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                {stats.incomeChange >= 0 ? "+" : ""}{Math.min(100, Math.abs(stats.incomeChange)).toFixed(0)}%
                            </span>
                        </div>
                    </div>

                    {/* Total Transaction */}
                    <div className="flex flex-col justify-center p-6 md:w-72">
                        <p className="mb-2 text-xs font-bold text-slate-700">
                            Total Penarikan
                        </p>
                        <h3 className="mb-2 text-xl font-semibold text-cyan-600">
                            {isLoading && !data ? (
                                <Skeleton className="h-7 w-12" />
                            ) : (
                                stats.totalTransactions
                            )}
                        </h3>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">30 hari terakhir</span>
                            <span className={`rounded-full px-2 py-1 font-medium ${stats.transactionsChange >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                {stats.transactionsChange >= 0 ? "+" : ""}{Math.min(100, Math.abs(stats.transactionsChange)).toFixed(0)}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Search */}
                    <SearchInput
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari ID, Nama Kreator, atau Email"
                        className="w-full sm:flex-1 min-w-[280px]"
                    />

                    {/* Filter */}
                    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <ButtonFilter className="flex-1 lg:flex-none" label={`Status: ${getStatusLabel(status)}`} />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[180px]">
                                <DropdownMenuRadioGroup value={status} onValueChange={setStatus}>
                                    <DropdownMenuRadioItem value="ALL">Semua Status</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="SUCCEEDED">Berhasil</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="PENDING">Menunggu</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="FAILED">Gagal</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Table (Desktop/Tablet) */}
                <div className="hidden sm:block w-full pb-2">
                    <Table
                        pagination={
                            <TablePagination
                                page={page}
                                totalPages={totalPages}
                                limit={limit}
                                total={totalItems}
                                onPageChange={setPage}
                                onLimitChange={setLimit}
                            />
                        }
                    >
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[5%] text-center">No</TableHead>
                                <TableHead className="w-[8%] whitespace-nowrap">ID</TableHead>
                                <TableHead className="w-[12%] whitespace-nowrap">Akun</TableHead>
                                <TableHead className="w-[12%] whitespace-nowrap">Nominal</TableHead>
                                <TableHead className="w-[7%] whitespace-nowrap">Tipe</TableHead>
                                <TableHead className="w-[10%] whitespace-nowrap">Metode</TableHead>
                                <TableHead className="w-[14%] whitespace-nowrap">No. Rek</TableHead>
                                <TableHead className="w-[14%] whitespace-nowrap">Tanggal</TableHead>
                                <TableHead className="w-[12%] text-center whitespace-nowrap">Status</TableHead>
                                <TableHead className="w-[6%] text-right whitespace-nowrap">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && !data ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} data-type="body">
                                        <TableCell className="text-center font-medium whitespace-nowrap">
                                            <div className="flex items-center justify-center min-h-[48px]">
                                                <Skeleton className="h-4 w-4" />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center min-h-[48px]">
                                                <Skeleton className="h-4 w-16" />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center min-h-[48px]">
                                                <Skeleton className="h-4 w-32" />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center min-h-[48px]">
                                                <Skeleton className="h-4 w-24" />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center min-h-[48px]">
                                                <Skeleton className="h-4 w-12" />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center min-h-[48px]">
                                                <Skeleton className="h-4 w-20" />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center min-h-[48px]">
                                                <Skeleton className="h-4 w-40" />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center min-h-[48px]">
                                                <Skeleton className="h-4 w-32" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            <div className="flex items-center justify-center min-h-[48px]">
                                                <Skeleton className="h-6 w-20 rounded-full" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="py-20 text-center text-slate-500">
                                        Belum ada data penarikan ditemukan
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transactions.map((item: any, index: number) => {
                                    const isAdmin = item.user?.role === "ADMIN";
                                    const typeLabel = isAdmin ? "Tarik" : "Masuk";
                                    const nominal = isAdmin ? Number(item.amount) : Number(item.feeAmount ?? 0);

                                    return (
                                        <TableRow key={item.id} data-type="body">
                                            <TableCell className="text-center font-medium">
                                                <div className="flex min-h-[48px] items-center justify-center">
                                                    {(page - 1) * limit + index + 1}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="flex min-h-[48px] max-w-[80px] items-center truncate text-slate-400">
                                                            {item.id}
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>ID: {item.id}</TooltipContent>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell className="max-w-[120px]">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="flex items-center min-h-[48px]">
                                                            {item.user?.id ? (
                                                                <Link href={`/admin/kreator/${item.user.id}`} className="hover:text-cyan-600 transition-colors font-medium truncate block w-full">
                                                                    {item.user.name || item.user.email || "-"}
                                                                </Link>
                                                            ) : (
                                                                <span className="font-medium truncate block w-full">{item.user?.name || item.user?.email || "-"}</span>
                                                            )}
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        {item.user?.name || item.user?.email || "-"}
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex min-h-[48px] items-center">
                                                    <span className={`font-semibold ${isAdmin ? "text-slate-900" : "text-green-600"}`}>
                                                        {!isAdmin && "+"} {formatCurrency(nominal)}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex min-h-[48px] items-center">
                                                    {typeLabel}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center min-h-[48px]">
                                                    {item.bankName ?? "-"}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex min-h-[48px] max-w-[180px] items-center truncate">
                                                    {item.accountNumber}
                                                </div>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex min-h-[48px] items-center">
                                                    {format(new Date(item.createdAt), "dd MMM yyyy HH:mm", {
                                                        locale: id,
                                                    })}
                                                </div>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex min-h-[48px] items-center justify-center">
                                                    <span
                                                        className={`px-4 py-1 rounded-full text-[13px] font-medium leading-tight ${getStatusColor(item.status)}`}
                                                    >
                                                        {getStatusLabel(item.status)}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-right">
                                                <div className="flex justify-end items-center gap-3">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button onClick={() => {
                                                                setSelectedTx(item);
                                                                setIsDetailOpen(true);
                                                            }}>
                                                                <EyeIcon className="w-[22px] h-[22px] text-cyan-600 cursor-pointer hover:text-cyan-700" />
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Lihat Detail</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile Cards (Only visible on mobile) */}
                <div className="space-y-4 sm:hidden">
                    {isLoading && !data ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-white border border-slate-800 rounded-xl p-4 space-y-3 animate-pulse">
                                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                    <Skeleton className="h-4 w-12" />
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                </div>
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                    <Skeleton className="h-3 w-1/3" />
                                </div>
                            </div>
                        ))
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-8 bg-white border border-slate-800 rounded-xl p-4 text-slate-500">
                            Belum ada data penarikan ditemukan
                        </div>
                    ) : (
                        transactions.map((item: any, index: number) => {
                            const rowNumber = (page - 1) * limit + index + 1;
                            const isAdmin = item.user?.role === "ADMIN";
                            const typeLabel = isAdmin ? "Tarik" : "Masuk";
                            const nominal = isAdmin ? Number(item.amount) : Number(item.feeAmount ?? 0);

                            return (
                                <div key={item.id} className="bg-white border border-slate-800 rounded-xl p-4 space-y-3">
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                        <span className="text-xs font-semibold text-slate-400"># {rowNumber}</span>
                                        <span
                                            className={`rounded-full px-3 py-0.5 text-xs font-medium ${getStatusColor(item.status)}`}
                                        >
                                            {getStatusLabel(item.status)}
                                        </span>
                                    </div>

                                    <div className="space-y-2 flex-1 min-w-0">
                                        <div className="font-semibold text-slate-800 break-words leading-normal flex items-center justify-between">
                                            <span>{item.user?.name || item.user?.email || "-"}</span>
                                            <span className={`text-[12px] font-medium ${isAdmin ? "text-orange-600" : "text-green-600"}`}>
                                                {typeLabel}
                                            </span>
                                        </div>

                                        <div className="text-xs text-slate-500">
                                            <span className="font-medium text-slate-400">ID Transaksi: </span>
                                            <span className="font-mono text-[11px] text-slate-600">{item.id}</span>
                                        </div>

                                        <div className="text-xs text-slate-500">
                                            <span className="font-medium text-slate-400">Metode: </span>
                                            <span className="font-medium text-slate-700">{item.bankName ?? "-"}</span>
                                        </div>

                                        <div className="text-xs text-slate-500">
                                            <span className="font-medium text-slate-400">No. Rek: </span>
                                            <span className="font-medium text-slate-700">{item.accountNumber}</span>
                                        </div>

                                        <div className="text-xs text-slate-500">
                                            <span className="font-medium text-slate-400">Tanggal: </span>
                                            <span className="text-slate-600">
                                                {format(new Date(item.createdAt), "dd MMM yyyy HH:mm", {
                                                    locale: id,
                                                })}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between pt-1 border-t border-slate-50 mt-2">
                                            <div>
                                                <span className="font-medium text-slate-400">Nominal: </span>
                                                <span className={`font-bold text-sm ${isAdmin ? "text-slate-900" : "text-green-600"}`}>
                                                    {!isAdmin && "+"} {formatCurrency(nominal)}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSelectedTx(item);
                                                    setIsDetailOpen(true);
                                                }}
                                                className="p-1.5 rounded-md text-cyan-600 border border-slate-200 hover:bg-slate-50 transition"
                                            >
                                                <EyeIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {/* Mobile Pagination */}
                    {transactions && transactions.length > 0 && (
                        <div className="bg-white border border-slate-800 rounded-xl p-4 shadow-[1.5px_1.5px_0px_rgba(29,41,61)]">
                            <TablePagination
                                page={page}
                                totalPages={totalPages}
                                limit={limit}
                                total={totalItems}
                                onPageChange={setPage}
                                onLimitChange={setLimit}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent size="default" showCloseButton={false}>
                    <DialogHeader className="flex flex-row justify-between items-center text-left pr-4 pl-6 py-4">
                        <DialogTitle className="text-lg">Detail Transaksi</DialogTitle>
                        <DialogClose asChild>
                            <button className="text-slate-400 hover:text-cyan-600 transition-colors p-1 cursor-pointer">
                                <XIcon size={20} weight="bold" />
                            </button>
                        </DialogClose>
                    </DialogHeader>
                    {selectedTx && (
                        <DialogBody className="px-4 py-6 max-w-2xl mx-auto w-full space-y-6">
                            {/* Head Section: Total and Status */}
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

                            {/* Meta Info Grid */}
                            <div className="grid grid-cols-2 gap-4 px-2">
                                <div className="space-y-1">
                                    <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">ID Transaksi</span>
                                    <p className="font-medium text-slate-800 text-sm truncate" title={selectedTx.id}>{selectedTx.id}</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Tanggal & Waktu</span>
                                    <p className="font-medium text-slate-800 text-sm">
                                        {format(new Date(selectedTx.createdAt), "dd MMM yyyy, HH:mm", { locale: id })}
                                    </p>
                                </div>
                            </div>

                            <hr className="border-slate-100 mx-2" />

                            {/* Account Details Group */}
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

                            {/* Calculations */}
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
                                            <span>Total Penarikan</span>
                                            <span className="font-medium text-slate-800">{formatCurrency(Number(selectedTx.amount))}</span>
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
                    )}
                </DialogContent>
            </Dialog>
        </TooltipProvider>
    );
}
