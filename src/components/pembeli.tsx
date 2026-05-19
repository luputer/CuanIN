"use client";

import {
    EyeIcon,
} from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import DetailPembeli from "./detail-pembeli";
import { api } from "~/trpc/react";
import {
    Table,
    TableHead,
    TableHeader,
    TableRow,
    TableBody,
    TableCell,
    TablePagination,
} from "~/components/ui/table";
import SearchInput from "~/components/ui/search";
import ButtonFilter from "~/components/ui/filter";
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
import { Skeleton } from "~/components/ui/skeleton";

export default function Pembeli({ productId }: { productId: string }) {
    const [view, setView] = useState<"list" | "detail">("list");
    const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data, isLoading } = api.purchases.getByProductId.useQuery(
        { productId, page, limit, search: debouncedSearch, status: statusFilter },
        { enabled: !!productId, placeholderData: (prev) => prev }
    );

    const items = data?.items ?? [];
    const total = data?.total ?? 0;
    const totalPages = data?.totalPages ?? 1;

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "completed": return "bg-green-100 text-green-700";
            case "pending": return "bg-yellow-100 text-yellow-600";
            default: return "bg-slate-100 text-slate-600";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status.toLowerCase()) {
            case "completed": return "Sudah Bayar";
            case "pending": return "Pending";
            default: return status;
        }
    };

    if (view === "detail" && selectedPurchaseId) {
        return (
            <DetailPembeli
                purchaseId={selectedPurchaseId}
                onBack={() => {
                    setView("list");
                    setSelectedPurchaseId(null);
                }}
            />
        );
    }

    return (
        <TooltipProvider>
            <div className="bg-white space-y-6 p-4 sm:p-6">

                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <SearchInput
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari berdasarkan Nama Pembeli"
                        className="w-full sm:flex-1 min-w-[280px]"
                    />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <ButtonFilter 
                                label={`Status: ${statusFilter === "ALL" ? "Semua" : statusFilter === "completed" ? "Sudah Bayar" : statusFilter === "pending" ? "Pending" : statusFilter}`} 
                                className="w-full sm:w-auto flex-none"
                            />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                                <DropdownMenuRadioItem value="ALL">Semua Status</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="completed">Sudah Bayar</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="pending">Pending</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Table (Desktop/Tablet) */}
                <div className="hidden sm:block">
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
                                <TableHead className="w-[20%]">Nama</TableHead>
                                <TableHead className="w-[20%]">Email</TableHead>
                                <TableHead className="w-[15%]">Nomor Hp</TableHead>
                                <TableHead className="w-[15%]">Tanggal Beli</TableHead>
                                <TableHead className="w-[15%]">Status</TableHead>
                                <TableHead className="text-left w-[10%]">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow data-type="body" key={i}>
                                        <TableCell className="text-center font-medium whitespace-nowrap">
                                            <div className="flex items-center justify-center min-h-12">
                                                <Skeleton className="h-4 w-4" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            <div className="flex items-center min-h-12">
                                                <Skeleton className="h-4 w-32" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            <div className="flex items-center min-h-12">
                                                <Skeleton className="h-4 w-40" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            <div className="flex items-center min-h-12">
                                                <Skeleton className="h-4 w-24" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            <div className="flex items-center min-h-12">
                                                <Skeleton className="h-4 w-28" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            <div className="flex items-center min-h-12">
                                                <Skeleton className="h-[26px] w-[90px] rounded-full" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-right">
                                            <div className="flex items-center gap-3">
                                                <Skeleton className="h-6 w-6 rounded-md" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : items.length === 0 ? (
                                <TableRow className="text-center">
                                    <TableCell colSpan={7} className="py-8">
                                        Belum ada pembeli untuk produk ini.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.map((item, index) => {
                                    const rowNumber = (page - 1) * limit + index + 1;
                                    return (
                                        <TableRow key={item.id} data-type="body">
                                            <TableCell className="text-center font-medium whitespace-nowrap">
                                                {rowNumber}
                                            </TableCell>

                                            <TableCell className="whitespace-nowrap">
                                                <button
                                                    onClick={() => {
                                                        setSelectedPurchaseId(item.id);
                                                        setView("detail");
                                                    }}
                                                    className="hover:text-cyan-600 transition-colors"
                                                >
                                                    <div className="flex items-center min-h-12">
                                                        {item.buyerName}
                                                    </div>
                                                </button>
                                            </TableCell>

                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex items-center min-h-12">
                                                    {item.buyerEmail}
                                                </div>
                                            </TableCell>

                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex items-center min-h-12">
                                                    {item.buyerPhone}
                                                </div>
                                            </TableCell>

                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex items-center min-h-12">
                                                    {format(new Date(item.createdAt), "d MMM yyyy", { locale: idLocale })}
                                                </div>
                                            </TableCell>

                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex items-center min-h-12">
                                                    <span className={`px-4 py-1 rounded-full text-[13px] font-medium leading-tight ${getStatusColor(item.status)}`}>
                                                        {getStatusLabel(item.status)}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="px-6 py-4 text-right">
                                                <div className="flex items-center gap-3">
                                                    {/* detail */}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button onClick={() => {
                                                                setSelectedPurchaseId(item.id);
                                                                setView("detail");
                                                            }}>
                                                                <EyeIcon className="w-6 h-6 text-cyan-600 cursor-pointer hover:text-cyan-700" />
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Detail</TooltipContent>
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
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-white border border-slate-800 rounded-xl p-4 space-y-3 animate-pulse">
                                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                    <Skeleton className="h-4 w-8" />
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-28" />
                                </div>
                            </div>
                        ))
                    ) : items.length === 0 ? (
                        <div className="text-center py-8 bg-white border border-slate-800 rounded-xl p-4 text-slate-500">
                            Belum ada pembeli untuk produk ini.
                        </div>
                    ) : (
                        items.map((item, index) => {
                            const rowNumber = (page - 1) * limit + index + 1;
                            return (
                                <div key={item.id} className="bg-white border border-slate-800 rounded-xl p-4 space-y-3">
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                        <span className="text-xs font-semibold text-slate-400"># {rowNumber}</span>
                                        <span className={`px-3 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                            {getStatusLabel(item.status)}
                                        </span>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-slate-400 font-medium min-w-[70px]">Nama:</span>
                                            <button
                                                onClick={() => {
                                                    setSelectedPurchaseId(item.id);
                                                    setView("detail");
                                                }}
                                                className="font-semibold text-cyan-600 hover:text-cyan-700 text-right hover:underline"
                                            >
                                                {item.buyerName}
                                            </button>
                                        </div>
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-slate-400 font-medium min-w-[70px]">Email:</span>
                                            <span className="text-slate-700 text-right break-all">{item.buyerEmail}</span>
                                        </div>
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-slate-400 font-medium min-w-[70px]">No Hp:</span>
                                            <span className="text-slate-700 text-right">{item.buyerPhone || "-"}</span>
                                        </div>
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-slate-400 font-medium min-w-[70px]">Tanggal:</span>
                                            <span className="text-slate-700 text-right">
                                                {format(new Date(item.createdAt), "d MMM yyyy", { locale: idLocale })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-2 border-t border-slate-100">
                                        <button
                                            onClick={() => {
                                                setSelectedPurchaseId(item.id);
                                                setView("detail");
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-600 border border-cyan-600 rounded-md hover:bg-cyan-50 transition-colors"
                                        >
                                            <EyeIcon className="w-4 h-4" />
                                            Detail Pembeli
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {/* Mobile Pagination */}
                    {items.length > 0 && (
                        <div className="bg-white border border-slate-800 rounded-xl p-4 shadow-[0px_1.5px_0px_rgba(29,41,61)]">
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
            </div>
        </TooltipProvider>
    );
}
