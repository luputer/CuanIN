"use client";

// React
import { useState } from "react";

// Next.js
import Link from "next/link";
import { useRouter } from "next/navigation";

// Third-party
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";

import { api } from "~/trpc/react";
import { useDataTable } from "~/hooks/use-data-table";
import { useCopyProductLink } from "~/hooks/use-copy-product-link";

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
import { DataTableBodySkeleton, DataTableMobileSkeleton } from "~/components/layout/table-skeleton";
import { ProductThumbnail, ProductActions } from "~/components/layout/product-list-components";
import SearchInput from "~/components/ui/search";
import ButtonFilter from "~/components/ui/filter";
import ActionButton from "~/components/ui/button-add";
import DeleteConfirmDialog from "~/components/ui/delete-confirm-dialog";
import { PageHeader } from "~/components/layout/page-header";
import { SortableTableHead } from "~/components/layout/sortable-table-head";
import { TableEmptyState, MobileEmptyState } from "~/components/layout/empty-state";
import { MobilePaginationWrapper } from "~/components/layout/mobile-pagination-wrapper";
import { StatusBadge } from "~/components/ui/status-badge";
import { DataTableToolbar } from "~/components/layout/data-table-toolbar";
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

    const {
        page, setPage,
        limit, setLimit,
        search, setSearch,
        debouncedSearch,
        sortBy, sortOrder,
        handleSort,
    } = useDataTable<"name" | "createdAt" | "startDate">("createdAt", "desc");

    const [priceTypeFilter, setPriceTypeFilter] = useState<"ALL" | "FREE" | "PAID">("ALL");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

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

    const handleCopyLink = useCopyProductLink();

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <TooltipProvider>
            <div className="w-full max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <PageHeader
                    title="Webinar"
                    description="Pantau dan kelola semua webinar yang kamu buat."
                />

                {/* Toolbar */}
                <DataTableToolbar
                    search={
                        <SearchInput
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari berdasarkan Nama Webinar"
                            className="w-full"
                        />
                    }
                    actions={
                        <>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <ButtonFilter
                                        className="flex-1 lg:flex-none"
                                        label={`Tipe: ${priceTypeFilter === "ALL" ? "Semua" : priceTypeFilter === "FREE" ? "Gratis" : "Berbayar"}`}
                                    />
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
                                    <ButtonFilter
                                        className="flex-1 lg:flex-none"
                                        label={`Status: ${statusFilter === "ALL" ? "Semua" : statusFilter === "published" ? "Published" : statusFilter === "unpublished" ? "Unpublished" : "Selesai"}`}
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

                            <ActionButton href="/webinar/create" label="Tambah Webinar" responsive />
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
                                    title="Nama"
                                    sortKey="name"
                                    isActive={sortBy === "name"}
                                    sortOrder={sortOrder}
                                    onClick={() => handleSort("name")}
                                    className="w-[38%]"
                                />
                                <TableHead className="w-[6%]">Thumbnail</TableHead>
                                <SortableTableHead
                                    title="Waktu"
                                    sortKey="startDate"
                                    isActive={sortBy === "startDate"}
                                    sortOrder={sortOrder}
                                    onClick={() => handleSort("startDate")}
                                    className="w-[13%]"
                                />
                                <TableHead className="w-[6%]">Tipe</TableHead>
                                <TableHead className="w-[15%]">Harga</TableHead>
                                <TableHead className="w-[6%]">Pembeli</TableHead>
                                <TableHead className="w-[6%]">Status</TableHead>
                                <TableHead className="text-left w-[5%]">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {isLoading ? (
                                <DataTableBodySkeleton columns={9} rows={5} />
                            ) : webinars?.length === 0 ? (
                                <TableEmptyState
                                    colSpan={9}
                                    description={
                                        isFiltered ? (
                                            "Hasil pencarian atau filter tidak ditemukan."
                                        ) : (
                                            <div className="flex flex-col items-center gap-1">
                                                <span>Belum ada webinar.</span>
                                                <Link href="/webinar/create" className="text-cyan-600 font-medium hover:underline">
                                                    Yuk, buat webinar pertamamu!
                                                </Link>
                                            </div>
                                        )
                                    }
                                />
                            ) : (
                                webinars?.map((item, index) => {
                                    const priceNum = Number(item.price);
                                    const rowNumber = (page - 1) * limit + index + 1;
                                    return (
                                        <TableRow key={item.id} data-type="body">
                                            <TableCell className="text-center font-medium">
                                                {rowNumber}
                                            </TableCell>

                                            <TableCell className="max-w-[360px] leading-normal">
                                                <div className="flex items-center min-h-[48px] py-1">
                                                    <Link href={`/webinar/${item.id}`} className="hover:text-cyan-600 transition-colors font-medium text-slate-800 line-clamp-2 break-words leading-normal">
                                                        {item.name}
                                                    </Link>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <ProductThumbnail image={item.image ?? null} name={item.name} size="sm" />
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
                                                    {(() => {
                                                        const isFinished = item.status === "archived" || (item.endDate && new Date() > new Date(item.endDate));
                                                        const currentStatus = isFinished ? "selesai" : (item.status || "draft");
                                                        return (
                                                            <StatusBadge status={currentStatus} />
                                                        );
                                                    })()}
                                                </div>
                                            </TableCell>

                                            <TableCell className="px-6 py-4 text-right">
                                                <ProductActions
                                                    editUrl={`/webinar/${item.id}`}
                                                    onDelete={() => setDeleteId(item.id)}
                                                    onCopy={() => handleCopyLink(item.id, item.slug ?? null)}
                                                    deleteTooltip="Hapus Webinar"
                                                />
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
                    ) : webinars?.length === 0 ? (
                        <MobileEmptyState
                            description={
                                isFiltered ? (
                                    "Hasil pencarian atau filter tidak ditemukan."
                                ) : (
                                    <div className="flex flex-col items-center gap-1">
                                        <span>Belum ada webinar.</span>
                                        <Link href="/webinar/create" className="text-cyan-600 font-medium hover:underline mt-1 inline-block">
                                            Yuk, buat webinar pertamamu!
                                        </Link>
                                    </div>
                                )
                            }
                        />
                    ) : (
                        webinars?.map((item, index) => {
                            const priceNum = Number(item.price);
                            const rowNumber = (page - 1) * limit + index + 1;
                            const isFinished = item.status === "archived" || (item.endDate && new Date() > new Date(item.endDate));
                            const statusKey = isFinished ? "selesai" : item.status || "draft";

                            return (
                                <div key={item.id} className="bg-white border border-slate-800 rounded-xl p-4 space-y-3">
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                        <span className="text-xs font-semibold text-slate-400"># {rowNumber}</span>
                                        <StatusBadge status={statusKey} />
                                    </div>

                                    <div className="flex gap-3 items-start">
                                        <ProductThumbnail image={item.image ?? null} name={item.name} size="md" />

                                        {/* Content info */}
                                        <div className="space-y-1.5 flex-1 min-w-0">
                                            <Link href={`/webinar/${item.id}`} className="font-semibold text-slate-800 hover:text-cyan-600 break-words line-clamp-2">
                                                {item.name}
                                            </Link>

                                            <div className="text-xs text-slate-500">
                                                <span className="font-medium text-slate-400">Jadwal: </span>
                                                {item.startDate ? format(new Date(item.startDate), "d MMM yyyy", { locale: idLocale }) : "-"}
                                                {item.startDate ? ` (${format(new Date(item.startDate), "HH:mm")})` : ""}
                                            </div>

                                            <div className="flex justify-between items-center text-xs">
                                                <div>
                                                    <span className="font-medium text-slate-400">Harga: </span>
                                                    <span className="font-semibold text-slate-700">
                                                        {priceNum === 0 ? "Gratis" : `Rp ${priceNum.toLocaleString("id-ID")}`}
                                                    </span>
                                                </div>

                                                <div>
                                                    <span className="font-medium text-slate-400">Pembeli: </span>
                                                    <span className="font-semibold text-slate-700">{buyerCounts?.[item.id] ?? 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <ProductActions
                                        isMobile
                                        editUrl={`/webinar/${item.id}`}
                                        onDelete={() => setDeleteId(item.id)}
                                        onCopy={() => handleCopyLink(item.id, item.slug ?? null)}
                                        deleteTooltip="Hapus Webinar"
                                    />
                                </div>
                            );
                        })
                    )}

                    {/* Mobile Pagination */}
                    {webinars && webinars.length > 0 && (
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
                    title="Hapus Webinar?"
                    itemName={productToDelete?.name}
                    loading={deleteProduct.isPending}
                    onConfirm={() => {
                        if (deleteId) deleteProduct.mutate({ id: deleteId });
                    }}
                />
            </div>
        </TooltipProvider>
    );
}
