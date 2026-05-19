"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
    CaretUpIcon,
    CaretDownIcon,
    EyeIcon,
    ArrowLeftIcon,
} from "@phosphor-icons/react";

import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
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
    const router = useRouter();

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
            case "KELAS_ONLINE": return "Kelas Online";
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
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <SearchInput
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari berdasarkan nama produk..."
                    />

                    <div className="flex gap-3">
                        {/* Filter Kategori */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <ButtonFilter label={`Kategori: ${typeFilter === "ALL" ? "Semua" : getCategoryLabel(typeFilter)}`} />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[180px]">
                                <DropdownMenuRadioGroup value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
                                    <DropdownMenuRadioItem value="ALL">Semua Kategori</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="WEBINAR">Webinar</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="DIGITAL_PRODUCT">Produk Digital</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="KELAS_ONLINE">Kelas Online</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Filter Tipe */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <ButtonFilter label={`Tipe: ${priceTypeFilter === "ALL" ? "Semua" : priceTypeFilter === "FREE" ? "Gratis" : "Berbayar"}`} />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                                <DropdownMenuRadioGroup value={priceTypeFilter} onValueChange={(v) => setPriceTypeFilter(v as any)}>
                                    <DropdownMenuRadioItem value="ALL">Semua Tipe</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="FREE">Gratis</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="PAID">Berbayar</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Filter Status */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <ButtonFilter label={`Status: ${statusFilter === "ALL" ? "Semua" : statusFilter === "published" ? "Published" : statusFilter === "unpublished" ? "Unpublished" : statusFilter === "selesai" ? "Selesai" : "Draft"}`} />
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

                {/* Table Area */}
                <div className="">
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
                                        Nama
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
                                <TableHead className="w-[12%]">Thumbnail</TableHead>
                                <TableHead className="w-[15%]">Kategori</TableHead>
                                <TableHead className="w-[10%]">Tipe</TableHead>
                                <TableHead className="w-[13%]">Harga</TableHead>
                                <TableHead className="w-[15%]">Status</TableHead>
                                <TableHead className="text-left w-[5%]">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow data-type="body" key={i}>
                                        <TableCell><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-12 w-12 rounded-md" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-8 rounded-lg" /></TableCell>
                                    </TableRow>
                                ))
                            ) : !products || products.length === 0 ? (
                                <TableRow className="text-center">
                                    <TableCell colSpan={8} className="py-20">
                                        <div className="flex flex-col items-center gap-1 text-slate-500">
                                            <span>{isFiltered ? "Hasil pencarian atau filter tidak ditemukan." : "Belum ada produk yang ditemukan."}</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                products?.map((item, index) => {
                                    const priceNum = Number(item.price);
                                    const rowNumber = (page - 1) * limit + index + 1;
                                    const isFinished = item.status === "archived" || (item.endDate && new Date() > new Date(item.endDate));
                                    const currentStatus = isFinished ? "selesai" : (item.status || "draft");

                                    return (
                                        <TableRow key={item.id} data-type="body">
                                            <TableCell className="text-center font-medium">
                                                {rowNumber}
                                            </TableCell>

                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex items-center min-h-[48px]">
                                                    <Link
                                                        href={`/admin/kreator/${id}/produk/${item.id}`}
                                                        className="hover:text-cyan-600 transition-colors"
                                                    >
                                                        {item.name}
                                                    </Link>
                                                </div>
                                            </TableCell>

                                            <TableCell className="whitespace-nowrap">
                                                <div className="w-12 h-12 bg-slate-100 overflow-hidden border border-slate-200 rounded-lg">
                                                    {item.image ? (
                                                        <Image
                                                            src={item.image}
                                                            alt={item.name}
                                                            width={48}
                                                            height={48}
                                                            unoptimized
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 italic">
                                                            No image
                                                        </div>
                                                    )}
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
                                                    {priceNum === 0 ? "Rp 0" : `Rp ${priceNum.toLocaleString("id-ID")}`}
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
                                                                <EyeIcon className="w-[24px] h-[24px] text-cyan-600 hover:text-cyan-700" />
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
            </div>
        </TooltipProvider>
    );
}
