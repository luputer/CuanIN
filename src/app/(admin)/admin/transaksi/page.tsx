"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircleIcon, EyeIcon, XCircleIcon } from "@phosphor-icons/react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { api } from "~/trpc/react";
import { useDebounce } from "~/hooks/use-debounce";
import { toast } from "sonner";

import {
    ConfirmPaidDialog,
    ConfirmFailedDialog,
    TransactionDetailDialog,
    getStatusColor,
    getStatusLabel,
} from "~/components/layout/transaction-dialogs";
import SearchInput from "~/components/ui/search";
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
import { PageHeader } from "~/components/layout/page-header";
import { DataTableToolbar, SelectFilter } from "~/components/layout/data-table-toolbar";
import { DataTableBodySkeleton, DataTableMobileSkeleton } from "~/components/layout/table-skeleton";
import { TableEmptyState, MobileEmptyState } from "~/components/layout/empty-state";
import { MobilePaginationWrapper } from "~/components/layout/mobile-pagination-wrapper";
import { TransactionStatsCard } from "~/components/layout/transaction-stats-card";

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

    const markFailed = api.admin.markWithdrawalFailed.useMutation({
        onSuccess: async () => {
            toast.success("Withdrawal ditandai gagal, saldo dikembalikan");
            setIsConfirmFailOpen(false);
            setConfirmTx(null);
            await utils.admin.getWithdrawals.invalidate();
        },
        onError: (err) => toast.error(err.message),
    });

    const isPending = (status: string) =>
        ["PENDING", "REQUESTED", "ACCEPTED"].includes(status.toUpperCase());

    return (
        <TooltipProvider>
            <div className="w-full max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <PageHeader
                    title="Daftar Transaksi"
                    description="Lihat dan kelola permintaan penarikan saldo dari kreator."
                />

                {/* Stats Card */}
                <TransactionStatsCard
                    isLoading={isLoading}
                    data={data}
                    stats={stats}
                    isAdmin={true}
                />

                {/* Toolbar */}
                <DataTableToolbar
                    search={
                        <SearchInput
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari ID, Nama Kreator, atau Email"
                            className="w-full sm:flex-1 min-w-[280px]"
                        />
                    }
                    actions={
                        <SelectFilter
                            label={`Status: ${getStatusLabel(status)}`}
                            value={status}
                            onValueChange={setStatus}
                            options={[
                                { value: "ALL", label: "Semua Status" },
                                { value: "SUCCEEDED", label: "Berhasil" },
                                { value: "PENDING", label: "Menunggu" },
                                { value: "FAILED", label: "Gagal" },
                            ]}
                        />
                    }
                />

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
                                <DataTableBodySkeleton columns={9} rows={5} />
                            ) : transactions.length === 0 ? (
                                <TableEmptyState
                                    colSpan={10}
                                    description="Belum ada data penarikan ditemukan"
                                />
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
                        <DataTableMobileSkeleton rows={3} />
                    ) : transactions.length === 0 ? (
                        <MobileEmptyState description="Belum ada data penarikan ditemukan" />
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
                                                    <EyeIcon className="w-[18px] h-[18px]" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {transactions.length > 0 && (
                    <MobilePaginationWrapper>
                        <TablePagination
                            page={page}
                            totalPages={totalPages}
                            limit={limit}
                            total={totalItems}
                            onPageChange={setPage}
                            onLimitChange={setLimit}
                        />
                    </MobilePaginationWrapper>
                )}

                {/* Dialogs */}
                <ConfirmPaidDialog
                    open={isConfirmPaidOpen}
                    onOpenChange={setIsConfirmPaidOpen}
                    confirmTx={confirmTx}
                    onConfirm={() => markPaid.mutate({ withdrawalId: confirmTx?.id })}
                    isPending={markPaid.isPending}
                />

                <ConfirmFailedDialog
                    open={isConfirmFailOpen}
                    onOpenChange={setIsConfirmFailOpen}
                    confirmTx={confirmTx}
                    onConfirm={() => markFailed.mutate({ withdrawalId: confirmTx?.id })}
                    isPending={markFailed.isPending}
                />

                <TransactionDetailDialog
                    open={isDetailOpen}
                    onOpenChange={setIsDetailOpen}
                    selectedTx={selectedTx}
                    viewMode="admin"
                />
            </div>
        </TooltipProvider>
    );
}