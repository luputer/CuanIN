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
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <SearchInput
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari berdasarkan Nama Pembeli"
                    />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <ButtonFilter label={`Status: ${statusFilter === "ALL" ? "Semua" : statusFilter === "completed" ? "Sudah Bayar" : statusFilter === "pending" ? "Pending" : statusFilter}`} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                            <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                                <DropdownMenuRadioItem value="ALL">Semua Status</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="completed">Sudah Bayar</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="pending">Pending</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Table */}
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
                                    <TableCell><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                    <TableCell>
                                        <div className="flex justify-center">
                                            <Skeleton className="h-5 w-5" />
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
                                                <div className="flex items-center min-h-[48px]">
                                                    {item.buyerName}
                                                </div>
                                            </button>
                                        </TableCell>

                                        <TableCell className="whitespace-nowrap">
                                            <div className="flex items-center min-h-[48px]">
                                                {item.buyerEmail}
                                            </div>
                                        </TableCell>

                                        <TableCell className="whitespace-nowrap">
                                            <div className="flex items-center min-h-[48px]">
                                                {item.buyerPhone}
                                            </div>
                                        </TableCell>

                                        <TableCell className="whitespace-nowrap">
                                            <div className="flex items-center min-h-[48px]">
                                                {format(new Date(item.createdAt), "d MMM yyyy", { locale: idLocale })}
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
                                            <div className="flex items-center gap-3">
                                                {/* detail */}
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <button onClick={() => {
                                                            setSelectedPurchaseId(item.id);
                                                            setView("detail");
                                                        }}>
                                                            <EyeIcon className="w-[24px] h-[24px] text-cyan-600 cursor-pointer hover:text-cyan-700" />
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
        </TooltipProvider>
    );
}