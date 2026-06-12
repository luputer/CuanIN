"use client";

import Link from "next/link";
import { useState } from "react";
import {
    CheckCircleIcon,
    EyeIcon,
    XCircleIcon,
    XIcon,
} from "@phosphor-icons/react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { api } from "~/trpc/react";
import { useDebounce } from "~/hooks/use-debounce";
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
} from "~/components/ui/dialog";
import ButtonFilter from "~/components/ui/filter";
import SearchInput from "~/components/ui/search";
import ButtonSave from "~/components/ui/button-save";
import ButtonCancel from "~/components/ui/button-cancel";
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
import { formatCurrency } from "~/lib/utils";

export default function AdminTransactionPage() {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("ALL");
    const [selectedTx, setSelectedTx] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [confirmTx, setConfirmTx] = useState<any>(null);
    const [isConfirmPaidOpen, setIsConfirmPaidOpen] = useState(false);
    const [isConfirmFailOpen, setIsConfirmFailOpen] = useState(false);

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

    const markPaid = api.admin.markWithdrawalPaid.useMutation({
        onSuccess: async () => {
            toast.success("Withdrawal ditandai sudah ditransfer");
            setIsConfirmPaidOpen(false);
            setConfirmTx(null);
            await utils.admin.getWithdrawals.invalidate();
        },
        onError: (err) => toast.error(err.message),
    });

    const markFailed = api.admin.markWithdrawalPaid.useMutation({
        onSuccess: async () => {
            toast.success("Withdrawal ditandai gagal, saldo dikembalikan");
            setIsConfirmFailOpen(false);
            setConfirmTx(null);
            await utils.admin.getWithdrawals.invalidate();
        },
        onError: (err) => toast.error(err.message),
    });

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
            case "ALL": return "Semua Status";
            case "SUCCEEDED":
            case "COMPLETED": return "Berhasil";
            case "PENDING":
            case "REQUESTED":
            case "ACCEPTED": return "Menunggu";
            case "FAILED":
            case "CANCELLED":
            case "REVERSED": return "Gagal";
            case "EXPIRED": return "Kedaluwarsa";
            default: return status;
        }
    };

    const isPending = (status: string) =>
        ["PENDING", "REQUESTED", "ACCEPTED"].includes(status.toUpperCase());

    return (
        <TooltipProvider>
            <div className="w-full max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-slate-50">
                    <div className="sticky top-[74px] bg-slate-50 z-40 -mx-4 sm:-mx-6 px-4 sm:px-6 mb-2">
                        <div className="text-2xl font-bold mb-2 text-cyan-600">Daftar Transaksi</div>
                        <div className="text-sm text-slate-600">
                            Lihat dan kelola permintaan penarikan saldo dari kreator.
                        </div>
                    </div>
                </div>

                {/* Stats Card */}
                <div className="flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-cyan-50 p-0 shadow-[0px_1px_0px_rgba(29,41,61)] md:flex-row">
                    {/* Balance */}
                    <div className="flex flex-1 flex-col justify-between border-b border-slate-200 p-6 md:border-r md:border-b-0">
                        <p className="mb-2 text-xs font-bold text-slate-700">Saldo Fee Platform</p>
                        <h2 className="text-2xl font-semibold text-cyan-600">
                            {isLoading && !data ? <Skeleton className="h-8 w-40" /> : formatCurrency(stats.balance)}
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">Akumulasi fee 2% dari semua penarikan kreator</p>
                    </div>

                    {/* Total Income */}
                    <div className="flex flex-col justify-center border-b border-slate-200 p-6 md:w-72 md:border-r md:border-b-0">
                        <p className="mb-2 text-xs font-bold text-slate-700">Total Penghasilan</p>
                        <h3 className="mb-2 text-xl font-semibold text-cyan-600">
                            {isLoading && !data ? <Skeleton className="h-7 w-32" /> : formatCurrency(stats.totalIncome)}
                        </h3>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">30 hari terakhir</span>
                            <span className={`rounded-full px-2 py-1 font-medium ${stats.incomeChange >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                {stats.incomeChange >= 0 ? "+" : ""}{Math.min(100, Math.abs(stats.incomeChange)).toFixed(0)}%
                            </span>
                        </div>
                    </div>

                    {/* Total Transactions */}
                    <div className="flex flex-col justify-center p-6 md:w-72">
                        <p className="mb-2 text-xs font-bold text-slate-700">Total Penarikan</p>
                        <h3 className="mb-2 text-xl font-semibold text-cyan-600">
                            {isLoading && !data ? <Skeleton className="h-7 w-12" /> : stats.totalTransactions}
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
                    <SearchInput
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari ID, Nama Kreator, atau Email"
                        className="w-full sm:flex-1 min-w-[280px]"
                    />
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

                {/* Table Desktop */}
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
                                <TableHead className="w-[12%] whitespace-nowrap">Kreator</TableHead>
                                <TableHead className="w-[12%] whitespace-nowrap">Nominal Bersih</TableHead>
                                <TableHead className="w-[10%] whitespace-nowrap">Bank</TableHead>
                                <TableHead className="w-[14%] whitespace-nowrap">No. Rek / Nama</TableHead>
                                <TableHead className="w-[14%] whitespace-nowrap">Tanggal</TableHead>
                                <TableHead className="w-[12%] text-center whitespace-nowrap">Status</TableHead>
                                <TableHead className="w-[8%] text-right whitespace-nowrap">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && !data ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} data-type="body">
                                        {Array.from({ length: 9 }).map((_, j) => (
                                            <TableCell key={j}>
                                                <div className="flex items-center min-h-[48px]">
                                                    <Skeleton className="h-4 w-full max-w-[100px]" />
                                                </div>
                                            </TableCell>
                                        ))}
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
                                    // nominal bersih yang diterima kreator = amount - feeAmount - 4000
                                    const nominalBersih = Number(item.amount) - Number(item.feeAmount ?? 0) - 4000;

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
                                                        <div className="flex min-h-[48px] max-w-[80px] items-center truncate text-slate-400 font-mono text-xs">
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
                                                    <TooltipContent>{item.user?.name || item.user?.email || "-"}</TooltipContent>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex min-h-[48px] items-center font-semibold text-slate-800">
                                                    {formatCurrency(nominalBersih)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center min-h-[48px]">
                                                    {item.bankName ?? "-"}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col justify-center min-h-[48px] gap-0.5">
                                                    <span className="text-slate-800 font-medium text-sm">{item.accountNumber}</span>
                                                    <span className="text-slate-400 text-xs">{item.accountHolderName ?? "-"}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex min-h-[48px] items-center text-slate-600">
                                                    {format(new Date(item.createdAt), "dd MMM yyyy HH:mm", { locale: id })}
                                                </div>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex min-h-[48px] items-center justify-center">
                                                    <span className={`px-3 py-1 rounded-full text-[13px] font-medium leading-tight ${getStatusColor(item.status)}`}>
                                                        {getStatusLabel(item.status)}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-4 py-4 text-right">
                                                <div className="flex justify-end items-center gap-2">
                                                    {isPending(item.status) && (
                                                        <>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <button
                                                                        onClick={() => { setConfirmTx(item); setIsConfirmPaidOpen(true); }}
                                                                        className="p-1.5 rounded-md text-green-600 border border-slate-200 hover:bg-green-50 transition"
                                                                    >
                                                                        <CheckCircleIcon className="w-4 h-4" weight="fill" />
                                                                    </button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Sudah Ditransfer</TooltipContent>
                                                            </Tooltip>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <button
                                                                        onClick={() => { setConfirmTx(item); setIsConfirmFailOpen(true); }}
                                                                        className="p-1.5 rounded-md text-red-500 border border-slate-200 hover:bg-red-50 transition"
                                                                    >
                                                                        <XCircleIcon className="w-4 h-4" weight="fill" />
                                                                    </button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Tolak / Gagalkan</TooltipContent>
                                                            </Tooltip>
                                                        </>
                                                    )}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button onClick={() => { setSelectedTx(item); setIsDetailOpen(true); }}>
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

                {/* Mobile Cards */}
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
                            const nominalBersih = Number(item.amount) - Number(item.feeAmount ?? 0) - 4000;

                            return (
                                <div key={item.id} className="bg-white border border-slate-800 rounded-xl p-4 space-y-3">
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                        <span className="text-xs font-semibold text-slate-400"># {rowNumber}</span>
                                        <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${getStatusColor(item.status)}`}>
                                            {getStatusLabel(item.status)}
                                        </span>
                                    </div>

                                    <div className="space-y-2 flex-1 min-w-0">
                                        <div className="font-semibold text-slate-800">
                                            {item.user?.name || item.user?.email || "-"}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            <span className="font-medium text-slate-400">ID: </span>
                                            <span className="font-mono text-[11px] text-slate-600">{item.id}</span>
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            <span className="font-medium text-slate-400">Bank: </span>
                                            <span className="font-medium text-slate-700">{item.bankName ?? "-"}</span>
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            <span className="font-medium text-slate-400">No. Rek: </span>
                                            <span>{item.accountNumber}</span>
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            <span className="font-medium text-slate-400">Atas Nama: </span>
                                            <span>{item.accountHolderName ?? "-"}</span>
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            <span className="font-medium text-slate-400">Tanggal: </span>
                                            <span>{format(new Date(item.createdAt), "dd MMM yyyy HH:mm", { locale: id })}</span>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1">
                                            <div>
                                                <span className="font-medium text-slate-400 text-xs">Nominal Bersih: </span>
                                                <span className="font-bold text-sm text-slate-800">{formatCurrency(nominalBersih)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {isPending(item.status) && (
                                                    <>
                                                        <button
                                                            onClick={() => { setConfirmTx(item); setIsConfirmPaidOpen(true); }}
                                                            className="p-1.5 rounded-md text-green-600 border border-slate-200 hover:bg-green-50 transition"
                                                        >
                                                            <CheckCircleIcon className="w-4 h-4" weight="fill" />
                                                        </button>
                                                        <button
                                                            onClick={() => { setConfirmTx(item); setIsConfirmFailOpen(true); }}
                                                            className="p-1.5 rounded-md text-red-500 border border-slate-200 hover:bg-red-50 transition"
                                                        >
                                                            <XCircleIcon className="w-4 h-4" weight="fill" />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => { setSelectedTx(item); setIsDetailOpen(true); }}
                                                    className="p-1.5 rounded-md text-cyan-600 border border-slate-200 hover:bg-slate-50 transition"
                                                >
                                                    <EyeIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {transactions && transactions.length > 0 && (
                        <div className="bg-white border border-slate-800 rounded-xl p-4">
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

            {/* ── Confirm Paid Dialog ─────────────────────────────────────────── */}
            <Dialog open={isConfirmPaidOpen} onOpenChange={setIsConfirmPaidOpen}>
                <DialogContent size="default" showCloseButton={false}>
                    <DialogHeader className="flex flex-row justify-between items-center text-left pr-4 pl-6 py-4">
                        <DialogTitle className="text-lg">Konfirmasi Transfer</DialogTitle>
                        <DialogClose asChild>
                            <button className="text-slate-400 hover:text-cyan-600 transition-colors p-1 cursor-pointer">
                                <XIcon size={20} weight="bold" />
                            </button>
                        </DialogClose>
                    </DialogHeader>
                    {confirmTx && (
                        <DialogBody className="px-6 py-4 space-y-4">
                            <div className="rounded-xl bg-green-50 border border-green-200 p-4 space-y-2">
                                <p className="text-sm font-semibold text-green-700">Tandai sebagai sudah ditransfer?</p>
                                <p className="text-xs text-green-600">Pastikan dana sudah benar-benar dikirim ke rekening kreator sebelum konfirmasi.</p>
                            </div>
                            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Kreator</span>
                                    <span className="font-medium text-slate-800">{confirmTx.user?.name || confirmTx.user?.email || "-"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Bank</span>
                                    <span className="font-medium text-slate-800">{confirmTx.bankName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">No. Rekening</span>
                                    <span className="font-medium text-slate-800">{confirmTx.accountNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Atas Nama</span>
                                    <span className="font-medium text-slate-800">{confirmTx.accountHolderName ?? "-"}</span>
                                </div>
                                <div className="flex justify-between border-t border-slate-200 pt-2 mt-1">
                                    <span className="text-slate-500 font-semibold">Nominal Dikirim</span>
                                    <span className="font-bold text-slate-900">
                                        {formatCurrency(Number(confirmTx.amount) - Number(confirmTx.feeAmount ?? 0) - 4000)}
                                    </span>
                                </div>
                            </div>
                        </DialogBody>
                    )}
                    <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-lg flex justify-end gap-3">
                        <DialogClose asChild>
                            <ButtonCancel label="Batal" className="text-sm h-10" />
                        </DialogClose>
                        <ButtonSave
                            type="button"
                            isLoading={markPaid.isPending}
                            label="Ya, Sudah Ditransfer"
                            icon={null}
                            className="text-sm h-10 bg-green-600 hover:bg-green-700"
                            onClick={() => confirmTx && markPaid.mutate({ withdrawalId: confirmTx.id })}
                        />
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Confirm Failed Dialog ───────────────────────────────────────── */}
            <Dialog open={isConfirmFailOpen} onOpenChange={setIsConfirmFailOpen}>
                <DialogContent size="default" showCloseButton={false}>
                    <DialogHeader className="flex flex-row justify-between items-center text-left pr-4 pl-6 py-4">
                        <DialogTitle className="text-lg">Tolak Penarikan</DialogTitle>
                        <DialogClose asChild>
                            <button className="text-slate-400 hover:text-cyan-600 transition-colors p-1 cursor-pointer">
                                <XIcon size={20} weight="bold" />
                            </button>
                        </DialogClose>
                    </DialogHeader>
                    {confirmTx && (
                        <DialogBody className="px-6 py-4 space-y-4">
                            <div className="rounded-xl bg-red-50 border border-red-200 p-4 space-y-2">
                                <p className="text-sm font-semibold text-red-700">Tolak permintaan penarikan ini?</p>
                                <p className="text-xs text-red-500">Saldo kreator akan dikembalikan secara otomatis.</p>
                            </div>
                            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Kreator</span>
                                    <span className="font-medium text-slate-800">{confirmTx.user?.name || confirmTx.user?.email || "-"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Bank</span>
                                    <span className="font-medium text-slate-800">{confirmTx.bankName}</span>
                                </div>
                                <div className="flex justify-between border-t border-slate-200 pt-2 mt-1">
                                    <span className="text-slate-500 font-semibold">Saldo Dikembalikan</span>
                                    <span className="font-bold text-slate-900">
                                        {formatCurrency(Number(confirmTx.amount))}
                                    </span>
                                </div>
                            </div>
                        </DialogBody>
                    )}
                    <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-lg flex justify-end gap-3">
                        <DialogClose asChild>
                            <ButtonCancel label="Batal" className="text-sm h-10" />
                        </DialogClose>
                        <ButtonSave
                            type="button"
                            isLoading={markFailed.isPending}
                            label="Ya, Tolak & Kembalikan Saldo"
                            icon={null}
                            className="text-sm h-10 bg-red-600 hover:bg-red-700"
                            onClick={() => confirmTx && markFailed.mutate({ withdrawalId: confirmTx.id })}
                        />
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Detail Dialog ───────────────────────────────────────────────── */}
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
                            <div className="flex flex-col items-start space-y-1 bg-slate-100 p-5 rounded-xl border border-slate-300">
                                <span className="text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                                    Nominal Bersih Diterima Kreator
                                </span>
                                <div className="flex items-center gap-3 pt-1">
                                    <span className="text-2xl font-semibold text-slate-800 tracking-tight">
                                        {formatCurrency(Number(selectedTx.amount) - Number(selectedTx.feeAmount ?? 0) - 4000)}
                                    </span>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedTx.status)}`}>
                                        {getStatusLabel(selectedTx.status)}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 px-2">
                                <div className="space-y-1">
                                    <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">ID Transaksi</span>
                                    <p className="font-medium text-slate-800 text-sm truncate font-mono" title={selectedTx.id}>{selectedTx.id}</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Tanggal</span>
                                    <p className="font-medium text-slate-800 text-sm">
                                        {format(new Date(selectedTx.createdAt), "dd MMM yyyy, HH:mm", { locale: id })}
                                    </p>
                                </div>
                            </div>

                            <hr className="border-slate-100 mx-2" />

                            <div className="space-y-3 px-2">
                                <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Informasi Penerima</h4>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Kreator</span>
                                    <span className="font-medium text-slate-800">{selectedTx.user?.name || selectedTx.user?.email || "-"}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Bank</span>
                                    <span className="font-medium text-slate-800">{selectedTx.bankName ?? "-"}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">No. Rekening</span>
                                    <span className="font-medium text-slate-800">{selectedTx.accountNumber}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Atas Nama</span>
                                    <span className="font-medium text-slate-800">{selectedTx.accountHolderName ?? "-"}</span>
                                </div>
                            </div>

                            <hr className="border-slate-100 mx-2" />

                            <div className="space-y-3 px-2">
                                <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Rincian</h4>
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>Total Dipotong Saldo</span>
                                    <span className="font-medium text-slate-800">{formatCurrency(Number(selectedTx.amount))}</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>Fee Platform (2%)</span>
                                    <span className="font-medium text-green-600">+{formatCurrency(Number(selectedTx.feeAmount ?? 0))}</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>Biaya Transfer Bank</span>
                                    <span className="font-medium text-slate-500">Rp4.000</span>
                                </div>
                                <div className="flex justify-between border-t border-dashed border-slate-200 pt-3 font-bold text-[15px] text-slate-900">
                                    <span>Nominal Dikirim ke Kreator</span>
                                    <span className="text-cyan-600">
                                        {formatCurrency(Number(selectedTx.amount) - Number(selectedTx.feeAmount ?? 0) - 4000)}
                                    </span>
                                </div>
                            </div>
                        </DialogBody>
                    )}
                </DialogContent>
            </Dialog>
        </TooltipProvider>
    );
}