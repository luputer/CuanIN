"use client";

// React
import { useState } from "react";

// Next.js
import Link from "next/link";

// Third-party
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";

// Icons
import {
    PencilSimpleIcon,
    TrashIcon,
} from "@phosphor-icons/react";

// Internal & Utils
import { api } from "~/trpc/react";
import { useDataTable } from "~/hooks/shared/use-data-table";

// Components
import {
    Table,
    TableHead,
    TableHeader,
    TableRow,
    TableBody,
    TableCell,
    TablePagination,
} from "~/components/ui/table";
import { DataTableBodySkeleton, DataTableMobileSkeleton } from "~/components/table/skeleton";
import SearchInput from "~/components/ui/search";
import ActionButton from "~/components/shared/button-add";
import DeleteConfirmDialog from "~/components/shared/delete-confirm-dialog";
import { PageHeader } from "~/components/shared/page-header";
import { SortableTableHead } from "~/components/table/head";
import { TableEmptyState, MobileEmptyState } from "~/components/shared/empty-state";
import { MobilePaginationWrapper } from "~/components/shared/mobile-pagination-wrapper";
import { StatusBadge } from "~/components/ui/status-badge";
import { DataTableToolbar, SelectFilter } from "~/components/table/toolbar";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "~/components/ui/tooltip";

export default function VoucherPage() {
    // ─── States & Hooks ──────────────────────────────────────────────────────

    const {
        page, setPage,
        limit, setLimit,
        search, setSearch,
        debouncedSearch,
        sortBy, sortOrder,
        handleSort,
    } = useDataTable<"code" | "createdAt" | "startDate">("createdAt", "desc");

    const [typeFilter, setTypeFilter] = useState<"ALL" | "PERSEN" | "NOMINAL">("ALL");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    // ─── API Logic ───────────────────────────────────────────────────────────
    const utils = api.useUtils();

    const { data, isLoading } = api.vouchers.getAll.useQuery({
        page: page || 1,
        limit: limit || 10,
        search: debouncedSearch || undefined,
        sortBy,
        sortOrder,
        type: typeFilter,
        status: statusFilter,
    }, {
        placeholderData: (prev) => prev,
    });

    const paginatedVouchers = data?.items ?? [];
    const total = data?.total ?? 0;
    const totalPages = data?.totalPages ?? 1;

    const isFiltered = debouncedSearch !== "" || typeFilter !== "ALL" || statusFilter !== "ALL";

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const voucherToDelete = paginatedVouchers.find((v) => v.id === deleteId);

    const deleteMutation = api.vouchers.delete.useMutation({
        onSuccess: () => {
            toast.success("Voucher berhasil dihapus");
            setDeleteId(null);
            void utils.vouchers.getAll.invalidate();
        },
        onError: (error) => {
            toast.error(error.message || "Gagal menghapus voucher");
        }
    });

    const handleDelete = () => {
        if (deleteId) {
            deleteMutation.mutate({ id: deleteId });
        }
    };

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <TooltipProvider>
            <div className="w-full max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <PageHeader
                    title="Voucher"
                    description="Kelola seluruh voucher diskon Anda di sini."
                />

                {/* Toolbar */}
                <DataTableToolbar
                    search={
                        <SearchInput
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari berdasarkan Kode Voucher"
                            className="w-full"
                        />
                    }
                    actions={
                        <>
                            <SelectFilter
                                label={`Tipe: ${typeFilter === "ALL" ? "Semua" : typeFilter === "PERSEN" ? "Persen" : "Nominal"}`}
                                value={typeFilter}
                                onValueChange={(v) => setTypeFilter(v as "ALL" | "PERSEN" | "NOMINAL")}
                                options={[
                                    { value: "ALL", label: "Semua Tipe" },
                                    { value: "PERSEN", label: "Persen" },
                                    { value: "NOMINAL", label: "Nominal" },
                                ]}
                            />

                            <SelectFilter
                                label={`Status: ${statusFilter === "ALL" ? "Semua" : statusFilter === "aktif" ? "Aktif" : statusFilter === "nonaktif" ? "Nonaktif" : "Expired"}`}
                                value={statusFilter}
                                onValueChange={setStatusFilter}
                                options={[
                                    { value: "ALL", label: "Semua Status" },
                                    { value: "aktif", label: "Aktif" },
                                    { value: "nonaktif", label: "Nonaktif" },
                                    { value: "expired", label: "Expired" },
                                ]}
                            />

                            <ActionButton href="/voucher/create" label="Tambah Voucher" responsive />
                        </>
                    }
                />

                {/* Table (Desktop/Tablet) */}
                <div className="hidden sm:block w-full pb-2">
                    <Table
                        pagination={
                            <TablePagination
                                page={page}
                                totalPages={totalPages}
                                limit={limit}
                                total={total}
                                onPageChange={setPage}
                                onLimitChange={setLimit}
                            />
                        }
                    >
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[5%] text-center">No</TableHead>
                                <SortableTableHead
                                    title="Kode Voucher"
                                    sortKey="code"
                                    isActive={sortBy === "code"}
                                    sortOrder={sortOrder}
                                    onClick={() => handleSort("code")}
                                    className="w-[18%] whitespace-nowrap"
                                />
                                <TableHead className="w-[17%] whitespace-nowrap">Nama</TableHead>
                                <TableHead className="w-[10%] whitespace-nowrap">Tipe</TableHead>
                                <TableHead className="w-[13%] whitespace-nowrap">Diskon</TableHead>
                                <SortableTableHead
                                    title="Waktu Berlaku"
                                    sortKey="startDate"
                                    isActive={sortBy === "startDate"}
                                    sortOrder={sortOrder}
                                    onClick={() => handleSort("startDate")}
                                    className="w-[25%] whitespace-nowrap"
                                />
                                <TableHead className="w-[15%] whitespace-nowrap">Status</TableHead>
                                <TableHead className="text-right w-[10%] whitespace-nowrap">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {isLoading ? (
                                <DataTableBodySkeleton columns={8} rows={5} />
                            ) : paginatedVouchers.length === 0 ? (
                                <TableEmptyState
                                    colSpan={8}
                                    description={
                                        isFiltered ? (
                                            "Hasil pencarian atau filter tidak ditemukan."
                                        ) : (
                                            <div className="flex flex-col items-center gap-1">
                                                <span>Belum ada voucher.</span>
                                                <Link href="/voucher/create" className="text-cyan-600 font-medium hover:underline">
                                                    Yuk, buat voucher diskon pertamamu!
                                                </Link>
                                            </div>
                                        )
                                    }
                                />
                            ) : (
                                paginatedVouchers.map((item, index) => {
                                    const rowNumber = (page - 1) * limit + index + 1;
                                    return (
                                        <TableRow key={item.id} data-type="body">
                                            <TableCell className="text-center font-medium">
                                                {rowNumber}
                                            </TableCell>

                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex items-center min-h-[48px] font-semibold text-slate-800">
                                                    {item.code}
                                                </div>
                                            </TableCell>

                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex items-center min-h-[48px] text-slate-600">
                                                    {item.name || "-"}
                                                </div>
                                            </TableCell>

                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex items-center min-h-[48px] text-slate-600 capitalize">
                                                    {item.type.toLowerCase()}
                                                </div>
                                            </TableCell>

                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex items-center min-h-[48px] font-medium text-cyan-600">
                                                    {item.type === "PERSEN" ? `${item.discount}%` : `Rp ${Number(item.discount).toLocaleString("id-ID")}`}
                                                </div>
                                            </TableCell>

                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex items-center min-h-[48px] font-medium text-slate-600 text-sm">
                                                    {format(item.startDate, "d MMM yyyy", { locale: idLocale })} - {format(item.endDate, "d MMM yyyy", { locale: idLocale })}
                                                </div>
                                            </TableCell>

                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex items-center min-h-[48px]">
                                                    <StatusBadge status={item.status} />
                                                </div>
                                            </TableCell>

                                            <TableCell className="px-6 py-4 text-right">
                                                <div className="flex justify-end items-center gap-3">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Link href={`/voucher/${item.id}`}>
                                                                <PencilSimpleIcon className="w-[24px] h-[24px] text-cyan-600 cursor-pointer hover:text-cyan-700" />
                                                            </Link>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Detail & Edit</TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button onClick={() => setDeleteId(item.id)}>
                                                                <TrashIcon className="w-[24px] h-[24px] text-red-600 cursor-pointer hover:text-red-700" />
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Hapus Voucher</TooltipContent>
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
                    {isLoading ? (
                        <DataTableMobileSkeleton rows={3} />
                    ) : paginatedVouchers.length === 0 ? (
                        <MobileEmptyState
                            description={
                                isFiltered ? (
                                    "Hasil pencarian atau filter tidak ditemukan."
                                ) : (
                                    "Belum ada voucher."
                                )
                            }
                        />
                    ) : (
                        paginatedVouchers.map((item, index) => {
                            const rowNumber = (page - 1) * limit + index + 1;
                            return (
                                <div key={item.id} className="bg-white border border-slate-800 rounded-xl p-4 space-y-3 shadow-[1.5px_1.5px_0px_rgba(29,41,61)]">
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                        <span className="text-xs font-semibold text-slate-400"># {rowNumber}</span>
                                        <StatusBadge status={item.status} />
                                    </div>

                                    <div className="space-y-2 flex-1 min-w-0">
                                        <div className="font-semibold text-slate-800 break-words leading-normal text-base flex justify-between items-center">
                                            <span className="font-mono text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200 text-sm">
                                                {item.code}
                                            </span>
                                            <span className="font-bold text-cyan-700 text-sm">
                                                {item.type === "PERSEN" ? `${item.discount}%` : `Rp ${Number(item.discount).toLocaleString("id-ID")}`}
                                            </span>
                                        </div>

                                        <div className="text-xs text-slate-500">
                                            <span className="font-medium text-slate-400">Nama Voucher: </span>
                                            <span className="font-medium text-slate-700">{item.name || "-"}</span>
                                        </div>

                                        <div className="text-xs text-slate-500">
                                            <span className="font-medium text-slate-400">Tipe: </span>
                                            <span className="font-medium text-slate-700 capitalize">{item.type.toLowerCase()}</span>
                                        </div>

                                        <div className="text-xs text-slate-500">
                                            <span className="font-medium text-slate-400">Periode: </span>
                                            <span className="text-slate-600">
                                                {format(item.startDate, "d MMM yyyy", { locale: idLocale })} - {format(item.endDate, "d MMM yyyy", { locale: idLocale })}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex justify-end items-center gap-4 pt-2 border-t border-slate-100">
                                            <Link href={`/voucher/${item.id}`} className="flex items-center gap-1 text-cyan-600 hover:text-cyan-700 font-medium text-xs">
                                                <PencilSimpleIcon className="w-5 h-5" />
                                                <span>Edit</span>
                                            </Link>

                                            <button onClick={() => setDeleteId(item.id)} className="flex items-center gap-1 text-red-600 hover:text-red-700 font-medium text-xs">
                                                <TrashIcon className="w-5 h-5" />
                                                <span>Hapus</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {/* Mobile Pagination */}
                    {paginatedVouchers && paginatedVouchers.length > 0 && (
                        <MobilePaginationWrapper>
                            <TablePagination
                                page={page}
                                totalPages={totalPages}
                                limit={limit}
                                total={total}
                                onPageChange={setPage}
                                onLimitChange={setLimit}
                            />
                        </MobilePaginationWrapper>
                    )}
                </div>

                <DeleteConfirmDialog
                    open={!!deleteId}
                    onOpenChange={(open) => !open && setDeleteId(null)}
                    title="Hapus Voucher?"
                    itemName={`voucher ${voucherToDelete?.code || ""}`.trim()}
                    loading={deleteMutation.isPending}
                    onConfirm={handleDelete}
                />
            </div>
        </TooltipProvider>
    );
}


