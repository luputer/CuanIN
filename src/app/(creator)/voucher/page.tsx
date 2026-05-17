"use client";

// React
import { useState, useEffect } from "react";

// Next.js
import Link from "next/link";

// Third-party
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";

// Icons
import {
    CaretUpIcon,
    CaretDownIcon,
    PencilSimpleIcon,
    TrashIcon,
} from "@phosphor-icons/react";

// Internal & Utils
import { cn } from "~/lib/utils";

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
import { TableSkeleton } from "~/components/layout/table-skeleton";
import SearchInput from "~/components/ui/search";
import ButtonFilter from "~/components/ui/filter";
import ActionButton from "~/components/ui/button-add";
import ConfirmDialog from "~/components/ui/confirm-dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "~/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "~/components/ui/dropdown-menu";

import { api } from "~/trpc/react";

export default function VoucherPage() {
    // ─── States & Hooks ──────────────────────────────────────────────────────

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sortBy, setSortBy] = useState<"code" | "createdAt" | "startDate">("createdAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const [typeFilter, setTypeFilter] = useState<"ALL" | "PERSEN" | "NOMINAL">("ALL");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    // ─── Effects ─────────────────────────────────────────────────────────────

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset to page 1 on search
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

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

    // ─── Helpers ─────────────────────────────────────────────────────────────

    const getStatusColor = (status: string) => {
        const s = status.toLowerCase();
        switch (s) {
            case "aktif": return "bg-green-100 text-green-700";
            case "expired": return "bg-red-100 text-red-700";
            case "nonaktif": return "bg-slate-200 text-slate-500";
            default: return "bg-slate-100 text-slate-600";
        }
    };

    const getStatusLabel = (status: string) => {
        const s = status.toLowerCase();
        switch (s) {
            case "aktif": return "Aktif";
            case "expired": return "Expired";
            case "nonaktif": return "Nonaktif";
            default: return status;
        }
    };

    // ─── Render ──────────────────────────────────────────────────────────────

    if (isLoading) {
        return <TableSkeleton columns={7} />;
    }

    return (
        <TooltipProvider>
            <div className="w-full max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-slate-50">
                    <div className="sticky top-[74px] bg-slate-50 z-40 -mx-4 sm:-mx-6 px-4 sm:px-6 mb-2">
                        <div className="text-2xl font-bold mb-2 text-cyan-600">Voucher</div>
                        <div className="text-sm font-regular text-slate-600">
                            Kelola seluruh voucher diskon Anda di sini.
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Search */}
                    <SearchInput
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari berdasarkan Kode Voucher"
                        className="w-full sm:flex-1 min-w-[280px]"
                    />

                    {/* Actions */}
                    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <ButtonFilter
                                    className="flex-1 lg:flex-none"
                                    label={`Tipe: ${typeFilter === "ALL" ? "Semua" : typeFilter === "PERSEN" ? "Persen" : "Nominal"}`}
                                />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                                <DropdownMenuRadioGroup value={typeFilter} onValueChange={(v) => setTypeFilter(v as "ALL" | "PERSEN" | "NOMINAL")}>
                                    <DropdownMenuRadioItem value="ALL">Semua Tipe</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="PERSEN">Persen</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="NOMINAL">Nominal</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <ButtonFilter
                                    className="flex-1 lg:flex-none"
                                    label={`Status: ${statusFilter === "ALL" ? "Semua" : statusFilter === "aktif" ? "Aktif" : statusFilter === "nonaktif" ? "Nonaktif" : "Expired"}`}
                                />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                                <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                                    <DropdownMenuRadioItem value="ALL">Semua Status</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="aktif">Aktif</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="nonaktif">Nonaktif</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="expired">Expired</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <ActionButton
                            href="/voucher/create"
                            label="Tambah Voucher"
                            responsive
                        />
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
                                total={total}
                                onPageChange={setPage}
                                onLimitChange={setLimit}
                            />
                        }
                    >
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[5%] text-center">No</TableHead>
                                <TableHead
                                    className="w-[18%] cursor-pointer select-none hover:text-slate-900 transition-colors group whitespace-nowrap"
                                    onClick={() => {
                                        if (sortBy === "code") {
                                            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                                        } else {
                                            setSortBy("code");
                                            setSortOrder("asc");
                                        }
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        Kode Voucher
                                        <div className="flex flex-col h-4 justify-center">
                                            <CaretUpIcon
                                                weight={sortBy === "code" && sortOrder === "asc" ? "bold" : "regular"}
                                                className={cn("w-4 h-4 -mb-1", sortBy === "code" && sortOrder === "asc" ? "text-slate-800" : "text-slate-400 group-hover:text-slate-400")}
                                            />
                                            <CaretDownIcon
                                                weight={sortBy === "code" && sortOrder === "desc" ? "bold" : "regular"}
                                                className={cn("w-4 h-4", sortBy === "code" && sortOrder === "desc" ? "text-slate-800" : "text-slate-400 group-hover:text-slate-400")}
                                            />
                                        </div>
                                    </div>
                                </TableHead>
                                <TableHead className="w-[17%] whitespace-nowrap">Nama</TableHead>
                                <TableHead className="w-[10%] whitespace-nowrap">Tipe</TableHead>
                                <TableHead className="w-[13%] whitespace-nowrap">Diskon</TableHead>
                                <TableHead
                                    className="w-[25%] cursor-pointer select-none hover:text-slate-900 transition-colors group whitespace-nowrap"
                                    onClick={() => {
                                        if (sortBy === "startDate") {
                                            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                                        } else {
                                            setSortBy("startDate");
                                            setSortOrder("asc");
                                        }
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        Waktu Berlaku
                                        <div className="flex flex-col h-4 justify-center">
                                            <CaretUpIcon
                                                weight={sortBy === "startDate" && sortOrder === "asc" ? "bold" : "regular"}
                                                className={cn("w-4 h-4 -mb-1", sortBy === "startDate" && sortOrder === "asc" ? "text-slate-800" : "text-slate-400 group-hover:text-slate-400")}
                                            />
                                            <CaretDownIcon
                                                weight={sortBy === "startDate" && sortOrder === "desc" ? "bold" : "regular"}
                                                className={cn("w-4 h-4", sortBy === "startDate" && sortOrder === "desc" ? "text-slate-800" : "text-slate-400 group-hover:text-slate-400")}
                                            />
                                        </div>
                                    </div>
                                </TableHead>
                                <TableHead className="w-[15%] whitespace-nowrap">Status</TableHead>
                                <TableHead className="text-right w-[10%] whitespace-nowrap">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {paginatedVouchers.length === 0 ? (
                                <TableRow className="text-center">
                                    <TableCell colSpan={7} className="py-20">
                                        <div className="flex flex-col items-center gap-1">
                                            {isFiltered ? (
                                                <span className="text-slate-500">Hasil pencarian atau filter tidak ditemukan.</span>
                                            ) : (
                                                <>
                                                    <span className="text-slate-500">Belum ada voucher.</span>
                                                    <Link href="/voucher/create" className="text-cyan-600 font-medium hover:underline">
                                                        Yuk, buat voucher diskon pertamamu!
                                                    </Link>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
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
                                                <div className="flex items-center min-h-[48px] font-medium text-cyan-700">
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
                                                    <span className={`px-4 py-1 rounded-full text-[13px] font-medium leading-tight ${getStatusColor(item.status)}`}>
                                                        {getStatusLabel(item.status)}
                                                    </span>
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
                                                        <TooltipContent>Edit Voucher</TooltipContent>
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
                    {paginatedVouchers.length === 0 ? (
                        <div className="text-center py-8 bg-white border border-slate-800 rounded-xl p-4 text-slate-500">
                            {isFiltered ? "Hasil pencarian atau filter tidak ditemukan." : "Belum ada voucher."}
                        </div>
                    ) : (
                        paginatedVouchers.map((item, index) => {
                            const rowNumber = (page - 1) * limit + index + 1;
                            return (
                                <div key={item.id} className="bg-white border border-slate-800 rounded-xl p-4 space-y-3 shadow-[1.5px_1.5px_0px_rgba(29,41,61)]">
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                        <span className="text-xs font-semibold text-slate-400"># {rowNumber}</span>
                                        <span
                                            className={`rounded-full px-3 py-0.5 text-xs font-medium ${getStatusColor(item.status)}`}
                                        >
                                            {getStatusLabel(item.status)}
                                        </span>
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
                        <div className="bg-white border border-slate-800 rounded-xl p-4 shadow-[1.5px_1.5px_0px_rgba(29,41,61)]">
                            <TablePagination
                                page={page}
                                totalPages={totalPages}
                                limit={limit}
                                total={total}
                                onPageChange={setPage}
                                onLimitChange={setLimit}
                            />
                        </div>
                    )}
                </div>

                <ConfirmDialog
                    open={!!deleteId}
                    onOpenChange={(open) => !open && setDeleteId(null)}
                    icon={<TrashIcon size={52} className="bg-red-100 rounded-full p-3 text-red-500" weight="regular" />}
                    title="Hapus Voucher?"
                    description={
                        <>
                            Kamu yakin ingin menghapus voucher {" "}
                            <span className="font-semibold text-slate-800">&quot;{voucherToDelete?.code}&quot;</span>?
                            <br />
                            Tindakan ini tidak bisa dibatalkan.
                        </>
                    }
                    confirmText="Ya, Hapus"
                    confirmClassName="bg-red-500 hover:bg-red-600 text-white"
                    loading={deleteMutation.isPending}
                    onConfirm={handleDelete}
                />
            </div>
        </TooltipProvider>
    );
}

