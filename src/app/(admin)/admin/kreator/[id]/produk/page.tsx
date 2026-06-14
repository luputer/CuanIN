"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

import { api } from "~/trpc/react";
import { getProductTypeLabel } from "~/lib/constants";
import {
    Table,
    TableHead,
    TableHeader,
    TableRow,
    TableBody,
    TablePagination,
    SortableTableHead,
} from "~/components/ui/table";
import { DataTableBodySkeleton, DataTableMobileSkeleton } from "~/components/layout/table-skeleton";
import { TableEmptyState, MobileEmptyState } from "~/components/layout/empty-state";
import { AdminProductTableRow, AdminProductMobileCard } from "~/components/admin/products/admin-product-table-items";
import SearchInput from "~/components/ui/search";
import { DataTableToolbar, SelectFilter } from "~/components/layout/data-table-toolbar";
import { PageHeader } from "~/components/layout/page-header";
import { TooltipProvider } from "~/components/ui/tooltip";

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
    const [priceTypeFilter] = useState<"ALL" | "FREE" | "PAID">("ALL");
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

    const isFiltered = debouncedSearch !== "" || typeFilter !== "ALL" || priceTypeFilter !== "ALL" || statusFilter !== "ALL";


    return (
        <TooltipProvider>
            <div className="w-full max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <PageHeader
                    title="Daftar Produk"
                    description={`oleh ${creator?.name || ""}`}
                    backLink={`/admin/kreator/${id}`}
                    backLabel="Kembali ke Detail Kreator"
                />

                {/* Toolbar */}
                <DataTableToolbar
                    search={
                        <SearchInput
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari berdasarkan Nama Produk"
                            className="w-full"
                        />
                    }
                    actions={
                        <>
                            <SelectFilter
                                label={`Kategori: ${getProductTypeLabel(typeFilter)}`}
                                value={typeFilter}
                                onValueChange={(v) => setTypeFilter(v as any)}
                                options={[
                                    { value: "ALL", label: "Semua Kategori" },
                                    { value: "WEBINAR", label: "Webinar" },
                                    { value: "DIGITAL_PRODUCT", label: "Produk Digital" },
                                    { value: "KELAS_ONLINE", label: "Kelas" },
                                ]}
                            />
                            <SelectFilter
                                label={`Status: ${statusFilter === "ALL" ? "Semua" : statusFilter}`}
                                value={statusFilter}
                                onValueChange={setStatusFilter}
                                width="160px"
                                options={[
                                    { value: "ALL", label: "Semua Status" },
                                    { value: "published", label: "Published" },
                                    { value: "unpublished", label: "Unpublished" },
                                    { value: "selesai", label: "Selesai" },
                                ]}
                            />
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
                                    className="w-[25%]"
                                    label="Nama Produk"
                                    field="name"
                                    currentSortBy={sortBy}
                                    currentSortOrder={sortOrder}
                                    onSort={(field) => {
                                        if (sortBy === field) {
                                            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                                        } else {
                                            setSortBy(field as "name" | "createdAt");
                                            setSortOrder("asc");
                                        }
                                    }}
                                />
                                <TableHead className="w-[15%]">Kategori</TableHead>
                                <TableHead className="w-[10%]">Tipe</TableHead>
                                <TableHead className="w-[10%]">Harga</TableHead>
                                <TableHead className="w-[10%]">Status</TableHead>
                                <TableHead className="text-left w-[5%]">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {isLoading ? (
                                <DataTableBodySkeleton columns={7} rows={5} />
                            ) : !products || products.length === 0 ? (
                                <TableEmptyState
                                    colSpan={7}
                                    title={isFiltered ? "Hasil pencarian atau filter tidak ditemukan." : "Belum ada produk yang ditemukan."}
                                />
                            ) : (
                                products?.map((item: any, index: number) => (
                                    <AdminProductTableRow
                                        key={item.id}
                                        item={item}
                                        index={index}
                                        page={page}
                                        limit={limit}
                                        showCreatorColumn={false}
                                        viewHref={`/admin/kreator/${id}/produk/${item.id}`}
                                    />
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile Cards (Only visible on mobile) */}
                <div className="space-y-4 sm:hidden">
                    {isLoading ? (
                        <DataTableMobileSkeleton rows={3} />
                    ) : !products || products.length === 0 ? (
                        <MobileEmptyState
                            title={isFiltered ? "Hasil pencarian atau filter tidak ditemukan." : "Belum ada produk yang ditemukan."}
                        />
                    ) : (
                        products?.map((item: any) => (
                            <AdminProductMobileCard
                                key={item.id}
                                item={item}
                                showCreatorColumn={false}
                                viewHref={`/admin/kreator/${id}/produk/${item.id}`}
                            />
                        ))
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
