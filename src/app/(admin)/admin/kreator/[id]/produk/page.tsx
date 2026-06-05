"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    CaretUpIcon,
    CaretDownIcon,
    EyeIcon,
    ArrowLeftIcon,
    UserCircleIcon,
} from "@phosphor-icons/react";

import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
    Table,
    TableHead,
    TableHeader,
    TableRow,
    TableBody,
    TableCell,
    TablePagination,
} from "~/components/ui/table";
import { Skeleton } from "~/components/ui/skeleton";
import { TableSkeleton } from "~/components/layout/table-skeleton";
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

export default function CreatorProductsPage() {
    const params = useParams();
    const id = params.id as string;

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sortBy, setSortBy] = useState<"name" | "createdAt">("createdAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const [typeFilter, setTypeFilter] = useState<"ALL" | "WEBINAR" | "DIGITAL_PRODUCT" | "KELAS_ONLINE">("ALL");
    const [priceTypeFilter, setPriceTypeFilter] = useState<"ALL" | "FREE" | "PAID">("ALL");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data: creator } = api.creators.getById.useQuery({ id }, { enabled: !!id });

    const { data, isLoading } = api.creators.getProducts.useQuery({
        creatorId: id,
        type: typeFilter === "ALL" ? undefined : typeFilter,
        page,
        limit,
        search: debouncedSearch || undefined,
        sortBy,
        sortOrder,
        priceType: priceTypeFilter,
        status: statusFilter,
    }, {
        enabled: !!id,
        placeholderData: (prev) => prev,
    });

    const products = data?.items;
    const total = data?.total ?? 0;
    const totalPages = data?.totalPages ?? 1;

    const getStatusColor = (status: string) => {
        const s = status.toLowerCase();
        switch (s) {
            case "selesai":
            case "archived": return "bg-blue-100 text-blue-700";
            case "published": return "bg-green-100 text-green-700";
            case "unpublished": return "bg-slate-200 text-slate-500";
            default: return "bg-slate-100 text-slate-600";
        }
    };

    const getStatusLabel = (status: string) => {
        const s = status.toLowerCase();
        switch (s) {
            case "selesai":
            case "archived": return "Selesai";
            case "published": return "Published";
            case "unpublished": return "Unpublished";
            default: return status;
        }
    };

    const getCategoryLabel = (type: string) => {
        switch (type) {
            case "WEBINAR": return "Webinar";
            case "DIGITAL_PRODUCT": return "Produk Digital";
            case "KELAS_ONLINE": return "Kelas";
            default: return type;
        }
    };

    const isFiltered = debouncedSearch !== "" || typeFilter !== "ALL" || priceTypeFilter !== "ALL" || statusFilter !== "ALL";

    if (isLoading && !products) {
        return <TableSkeleton columns={8} />;
    }

    return (
        <TooltipProvider>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-slate-50">
                    <div className="sticky top-[74px] bg-slate-50 z-40 -mx-4 px-4 mb-2">
                        <Link
                            href={`/admin/kreator/${id}`}
                            className="group flex items-center gap-2 text-sm font-regular text-slate-600 hover:text-slate-800 transition-colors w-fit mb-2"
                        >
                            <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                            <span className="leading-none">Kembali ke Detail Kreator</span>
                        </Link>
                        <div className="text-2xl font-bold mb-2 text-cyan-600">Daftar Produk</div>
                        <div className="text-sm font-regular text-slate-600">oleh {creator?.name}</div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Search */}
                    <SearchInput
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari berdasarkan Nama Produk"
                        className="w-full sm:flex-1 min-w-[280px]"
                    />

                    {/* Actions */}
                    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <ButtonFilter
                                    className="flex-1 lg:flex-none"
                                    label={`Kategori: ${typeFilter === "ALL" ? "Semua" : getCategoryLabel(typeFilter)}`}
                                />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[180px]">
                                <DropdownMenuRadioGroup value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
                                    <DropdownMenuRadioItem value="ALL">Semua Kategori</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="WEBINAR">Webinar</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="DIGITAL_PRODUCT">Produk Digital</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="KELAS_ONLINE">Kelas</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <ButtonFilter
                                    className="flex-1 lg:flex-none"
                                    label={`Status: ${statusFilter === "ALL" ? "Semua" : getStatusLabel(statusFilter)}`}
                                />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                                <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                                    <DropdownMenuRadioItem value="ALL">Semua Status</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="published">Published</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="unpublished">Unpublished</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="selesai">Selesai</DropdownMenuRadioItem>
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
                                    className="w-[25%] cursor-pointer select-none hover:text-slate-900 transition-colors group"
                                    onClick={() => {
                                        if (sortBy === "name") {
                                            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                                        } else {
                                            setSortBy("name");
                                            setSortOrder("asc");
                                        }
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        Nama Produk
                                        <div className="flex flex-col h-4 justify-center">
                                            <CaretUpIcon
                                                weight={sortBy === "name" && sortOrder === "asc" ? "bold" : "regular"}
                                                className={cn("w-4 h-4 -mb-1", sortBy === "name" && sortOrder === "asc" ? "text-slate-800" : "text-slate-400 group-hover:text-slate-400")}
                                            />
                                            <CaretDownIcon
                                                weight={sortBy === "name" && sortOrder === "desc" ? "bold" : "regular"}
                                                className={cn("w-4 h-4", sortBy === "name" && sortOrder === "desc" ? "text-slate-800" : "text-slate-400 group-hover:text-slate-400")}
                                            />
                                        </div>
                                    </div>
                                </TableHead>
                                <TableHead className="w-[15%]">Kategori</TableHead>
                                <TableHead className="w-[10%]">Tipe</TableHead>
                                <TableHead className="w-[10%]">Harga</TableHead>
                                <TableHead className="w-[10%]">Status</TableHead>
                                <TableHead className="text-left w-[5%]">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow data-type="body" key={i}>
                                        <TableCell className="text-center font-medium whitespace-nowrap">
                                            <div className="flex items-center justify-center min-h-[48px]">
                                                <Skeleton className="h-4 w-4" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-[360px]">
                                            <div className="flex items-center min-h-[48px] py-1">
                                                <Skeleton className="h-4 w-48" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            <div className="flex items-center min-h-[48px]">
                                                <Skeleton className="h-4 w-20" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            <div className="flex items-center min-h-[48px]">
                                                <Skeleton className="h-4 w-16" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            <div className="flex items-center min-h-[48px]">
                                                <Skeleton className="h-4 w-20" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            <div className="flex items-center min-h-[48px]">
                                                <Skeleton className="h-6 w-20 rounded-full" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-right">
                                            <div className="flex justify-start items-center gap-3">
                                                <Skeleton className="w-[22px] h-[22px]" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : !products || products.length === 0 ? (
                                <TableRow className="text-center">
                                    <TableCell colSpan={8} className="py-20">
                                        <div className="flex flex-col items-center gap-1">
                                            {isFiltered ? (
                                                <span className="text-slate-500">Hasil pencarian atau filter tidak ditemukan.</span>
                                            ) : (
                                                <span className="text-slate-500">Belum ada produk yang ditemukan.</span>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                products?.map((item: any, index: number) => {
                                    const priceNum = Number(item.price);
                                    const rowNumber = (page - 1) * limit + index + 1;
                                    const isFinished = item.status === "archived" || (item.endDate && new Date() > new Date(item.endDate));
                                    const currentStatus = isFinished ? "selesai" : (item.status || "draft");

                                    return (
                                        <TableRow key={item.id} data-type="body">
                                            <TableCell className="text-center font-medium">
                                                {rowNumber}
                                            </TableCell>

                                            <TableCell className="max-w-[360px] leading-normal">
                                                <div className="flex items-center min-h-[48px] py-1 font-medium text-slate-800 line-clamp-2 break-words leading-normal">
                                                    {item.name}
                                                </div>
                                            </TableCell>

                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex items-center min-h-[48px]">
                                                    {getCategoryLabel(item.type)}
                                                </div>
                                            </TableCell>

                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex items-center min-h-[48px]">
                                                    {priceNum > 0 ? "Berbayar" : "Gratis"}
                                                </div>
                                            </TableCell>

                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex items-center min-h-[48px]">
                                                    {priceNum === 0 ? "Gratis" : `Rp ${priceNum.toLocaleString("id-ID")}`}
                                                </div>
                                            </TableCell>

                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex items-center min-h-[48px]">
                                                    <span className={cn(
                                                        "px-4 py-1 rounded-full text-[13px] font-medium leading-tight",
                                                        getStatusColor(currentStatus)
                                                    )}>
                                                        {getStatusLabel(currentStatus)}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="px-6 py-4 text-right">
                                                <div className="flex justify-start items-center gap-3">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Link
                                                                href={`/admin/kreator/${id}/produk/${item.id}`}
                                                                className="cursor-pointer"
                                                            >
                                                                <EyeIcon className="w-[22px] h-[22px] text-cyan-600 hover:text-cyan-700" />
                                                            </Link>
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
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-white border border-slate-800 rounded-xl p-4 space-y-3 animate-pulse">
                                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                    <Skeleton className="h-4 w-8" />
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                </div>
                                <div className="flex gap-3">
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-1/2" />
                                        <Skeleton className="h-3 w-1/3" />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : !products || products.length === 0 ? (
                        <div className="text-center py-8 bg-white border border-slate-800 rounded-xl p-4 text-slate-500">
                            {isFiltered ? (
                                "Hasil pencarian atau filter tidak ditemukan."
                            ) : (
                                "Belum ada produk yang ditemukan."
                            )}
                        </div>
                    ) : (
                        products?.map((item: any, index: number) => {
                            const priceNum = Number(item.price);
                            const rowNumber = (page - 1) * limit + index + 1;
                            const isFinished = item.status === "archived" || (item.endDate && new Date() > new Date(item.endDate));
                            const currentStatus = isFinished ? "selesai" : (item.status || "draft");

                            return (
                                <div key={item.id} className="bg-white border border-slate-800 rounded-xl p-4 space-y-3">
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                        <span className="text-xs font-semibold text-slate-400"># {rowNumber}</span>
                                        <span className={`px-3 py-0.5 rounded-full text-xs font-medium ${getStatusColor(currentStatus)}`}>
                                            {getStatusLabel(currentStatus)}
                                        </span>
                                    </div>

                                    <div className="flex gap-3 items-start">
                                        <div className="space-y-1.5 flex-1 min-w-0">
                                            <div className="font-semibold text-slate-800 line-clamp-2">
                                                {item.name}
                                            </div>

                                            <div className="text-xs text-slate-500">
                                                <span className="font-medium text-slate-400">Kreator: </span>
                                                <Link href={`/admin/kreator/${creator?.id}`} className="font-medium hover:text-cyan-600 hover:underline">
                                                    {creator?.name || "-"}
                                                </Link>
                                            </div>

                                            <div className="flex justify-between items-center text-xs pt-1">
                                                <div>
                                                    <span className="font-medium text-slate-400">Kategori: </span>
                                                    <span className="font-semibold text-slate-700">{getCategoryLabel(item.type)}</span>
                                                </div>

                                                <div>
                                                    <span className="font-medium text-slate-400">Harga: </span>
                                                    <span className="font-semibold text-slate-700">
                                                        {priceNum === 0 ? "Gratis" : `Rp ${priceNum.toLocaleString("id-ID")}`}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 gap-2">
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/admin/kreator/${id}/produk/${item.id}`}
                                                className="p-2 rounded-lg text-cyan-600 border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                                                title="Lihat Detail"
                                            >
                                                <EyeIcon className="w-5 h-5" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {/* Mobile Pagination */}
                    {products && products.length > 0 && (
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
            </div>
        </TooltipProvider>
    );
}
