"use client";

// React
import { useState, useEffect } from "react";

// Next.js
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Third-party
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";

// Icons
import {
    CaretUpIcon,
    CaretDownIcon,
    EyeIcon,
    TrashIcon,
    CopyIcon,
} from "@phosphor-icons/react";

// Internal & Utils
import { api } from "~/trpc/react";
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
import { Skeleton } from "~/components/ui/skeleton";
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

export default function WebinarPage() {
    // ─── States & Hooks ──────────────────────────────────────────────────────

    const utils = api.useUtils();
    const router = useRouter();

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sortBy, setSortBy] = useState<"name" | "createdAt" | "startDate">("createdAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const [priceTypeFilter, setPriceTypeFilter] = useState<"ALL" | "FREE" | "PAID">("ALL");
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

    // ─── API ─────────────────────────────────────────────────────────────────

    const { data, isLoading } = api.products.getAll.useQuery({
        type: "WEBINAR",
        page: page || 1,
        limit: limit || 10,
        search: debouncedSearch || undefined,
        sortBy,
        sortOrder,
        priceType: priceTypeFilter,
        status: statusFilter,
    }, {
        placeholderData: (prev) => prev,
    });

    const webinars = data?.items;
    const total = data?.total ?? 0;
    const totalPages = data?.totalPages ?? 1;

    const isFiltered = debouncedSearch !== "" || priceTypeFilter !== "ALL" || statusFilter !== "ALL";

    // Fetch buyer counts for all webinars
    const productIds = webinars?.map(p => p.id) ?? [];
    const { data: buyerCounts } = api.purchases.countByProductIds.useQuery(
        { productIds },
        { enabled: productIds.length > 0 }
    );

    const [deleteId, setDeleteId] = useState<string | null>(null);

    const deleteProduct = api.products.delete.useMutation({
        onSuccess: () => {
            void utils.products.getAll.invalidate();
            toast.success("Webinar berhasil dihapus");
            setDeleteId(null);
        },
        onError: (error) => {
            toast.error(`Gagal menghapus webinar: ${error.message}`);
            setDeleteId(null);
        },
    });

    const productToDelete = webinars?.find((p) => p.id === deleteId);

    // ─── Helpers ─────────────────────────────────────────────────────────────

    const getStatusColor = (status: string) => {
        const s = status.toLowerCase();
        switch (s) {
            case "selesai": return "bg-blue-100 text-blue-700";
            case "published": return "bg-green-100 text-green-700";
            case "unpublished": return "bg-slate-200 text-slate-500";
            default: return "bg-slate-100 text-slate-600";
        }
    };

    const getStatusLabel = (status: string) => {
        const s = status.toLowerCase();
        switch (s) {
            case "selesai": return "Selesai";
            case "published": return "Published";
            case "unpublished": return "Unpublished";
            default: return status;
        }
    };

    const { data: catalog } = api.catalog.getMine.useQuery();
    const handleCopyLink = (itemId: string, itemSlug: string | null) => {
        if (!catalog?.slug) {
            toast.error("Gagal menyalin link: Catalog belum siap");
            return;
        }
        const host = window.location.origin;
        const productSlug = itemSlug ?? itemId;
        const publicUrl = `${host}/${catalog.slug}/${productSlug}`;
        void navigator.clipboard.writeText(publicUrl);
        toast.success("Link webinar disalin!");
    };

    // ─── Render ──────────────────────────────────────────────────────────────

    if (isLoading && !webinars) {
        return <TableSkeleton columns={9} />;
    }

    return (
        <TooltipProvider>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-slate-50">
                    <div className="sticky top-[74px] bg-slate-50 z-40 -mx-4 px-4 mb-2">
                        <div className="text-2xl font-bold mb-2 text-cyan-600">Webinar</div>
                        <div className="text-sm font-regular text-slate-600">Pantau dan kelola semua webinar yang kamu buat.</div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    {/* Search */}
                    <SearchInput
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari berdasarkan Nama Webinar"
                    />

                    {/* Actions */}
                    <div className="flex gap-3">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <ButtonFilter label={`Tipe: ${priceTypeFilter === "ALL" ? "Semua" : priceTypeFilter === "FREE" ? "Gratis" : "Berbayar"}`} />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                                <DropdownMenuRadioGroup value={priceTypeFilter} onValueChange={(v) => setPriceTypeFilter(v as "ALL" | "FREE" | "PAID")}>
                                    <DropdownMenuRadioItem value="ALL">Semua Tipe</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="FREE">Gratis</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="PAID">Berbayar</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <ButtonFilter label={`Status: ${statusFilter === "ALL" ? "Semua" : statusFilter === "published" ? "Published" : statusFilter === "unpublished" ? "Unpublished" : "Selesai"}`} />
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

                        <ActionButton
                            href="/webinar/create"
                            label="Tambah Webinar"
                        />
                    </div>
                </div>

                {/* Table */}
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
                                    className="w-[18%] cursor-pointer select-none hover:text-slate-900 transition-colors group"
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
                                <TableHead
                                    className="w-[12%] cursor-pointer select-none hover:text-slate-900 transition-colors group"
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
                                        Waktu
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
                                <TableHead className="w-[10%]">Tipe</TableHead>
                                <TableHead className="w-[12%]">Harga</TableHead>
                                <TableHead className="w-[12%]">Pembeli</TableHead>
                                <TableHead className="w-[14%]">Status</TableHead>
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
                                        <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                        <TableCell>
                                            <div className="flex justify-center gap-3">
                                                <Skeleton className="h-5 w-5" />
                                                <Skeleton className="h-5 w-5" />
                                                <Skeleton className="h-5 w-5" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : webinars?.length === 0 ? (
                                <TableRow className="text-center">
                                    <TableCell colSpan={9} className="py-20">
                                        <div className="flex flex-col items-center gap-1">
                                            {isFiltered ? (
                                                <span className="text-slate-500">Hasil pencarian atau filter tidak ditemukan.</span>
                                            ) : (
                                                <>
                                                    <span className="text-slate-500">Belum ada webinar.</span>
                                                    <Link href="/webinar/create" className="text-cyan-600 font-medium hover:underline">
                                                        Yuk, buat webinar pertamamu!
                                                    </Link>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                webinars?.map((item, index) => {
                                    const priceNum = Number(item.price);
                                    const rowNumber = (page - 1) * limit + index + 1;
                                    return (
                                        <TableRow key={item.id} data-type="body">
                                            <TableCell className="text-center font-medium">
                                                {rowNumber}
                                            </TableCell>

                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex items-center min-h-[48px]">
                                                    <Link href={`/webinar/${item.id}`} className="hover:text-cyan-600 transition-colors">
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
                                                <div className="flex flex-col justify-center min-h-[48px]">
                                                    <div className="font-medium text-slate-600">
                                                        {item.startDate ? format(new Date(item.startDate), "d MMM yyyy", { locale: idLocale }) : "-"}
                                                    </div>
                                                    <div className="mt-1 text-slate-500 text-xs">
                                                        {item.startDate ? format(new Date(item.startDate), "HH:mm") : ""}
                                                        {item.startDate && item.endDate ? " - " : ""}
                                                        {item.endDate ? format(new Date(item.endDate), "HH:mm") : ""}
                                                    </div>
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
                                                <div className="flex items-center gap-3 min-h-[48px]">
                                                    <span>{buyerCounts?.[item.id] ?? 0}</span>
                                                    <button
                                                        onClick={() => router.push(`/webinar/${item.id}?tab=user`)}
                                                        className="text-sm text-cyan-600 px-4 py-1 border border-cyan-600 rounded-lg hover:bg-cyan-50 font-medium transition-colors cursor-pointer"
                                                    >
                                                        Lihat
                                                    </button>
                                                </div>
                                            </TableCell>

                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex items-center min-h-[48px]">
                                                    <span className={`px-4 py-1 rounded-full text-[13px] font-medium leading-tight ${getStatusColor(item.endDate && new Date() > new Date(item.endDate) ? "selesai" : item.status || "draft")}`}>
                                                        {getStatusLabel(item.endDate && new Date() > new Date(item.endDate) ? "selesai" : item.status || "draft")}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="px-6 py-4 text-right">
                                                <div className="flex justify-start items-center gap-3">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button onClick={() => router.push(`/webinar/${item.id}`)}>
                                                                <EyeIcon className="w-[24px] h-[24px] text-cyan-600 cursor-pointer hover:text-cyan-700" />
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Lihat Detail</TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button onClick={() => setDeleteId(item.id)}>
                                                                <TrashIcon className="w-[24px] h-[24px] text-red-600 cursor-pointer hover:text-red-700" />
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Hapus Webinar</TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button onClick={() => handleCopyLink(item.id, item.slug ?? null)}>
                                                                <CopyIcon className="w-[24px] h-[24px] text-yellow-500 cursor-pointer hover:text-yellow-600" />
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Salin Link Webinar</TooltipContent>
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

                <ConfirmDialog
                    open={!!deleteId}
                    onOpenChange={(open) => !open && setDeleteId(null)}
                    icon={<TrashIcon size={52} className="bg-red-100 rounded-full p-3 text-red-500" weight="regular" />}
                    title="Hapus Webinar?"
                    description={
                        <>
                            Kamu yakin ingin menghapus {" "}
                            <span className="font-semibold text-slate-800">&quot;{productToDelete?.name}&quot;</span>?
                            <br />
                            Tindakan ini tidak bisa dibatalkan.
                        </>
                    }
                    confirmText="Ya, Hapus"
                    confirmClassName="bg-red-500 hover:bg-red-600 text-white"
                    loading={deleteProduct.isPending}
                    onConfirm={() => {
                        if (deleteId) deleteProduct.mutate({ id: deleteId });
                    }}
                />
            </div>
        </TooltipProvider>
    );
}
