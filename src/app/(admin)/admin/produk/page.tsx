"use client";

// React
import React from "react";

// Next.js

// Third-party

// Icons

// Internal & Utils
import { useAdminProducts } from "~/hooks/admin/use-admin-products";
import { getProductTypeLabel } from "~/lib/constants";

// Components
import {
	Table,
	TableHead,
	TableHeader,
	TableRow,
	TableBody,
	TablePagination,
	SortableTableHead,
} from "~/components/ui/table";
import { DataTableBodySkeleton, DataTableMobileSkeleton } from "~/components/table/skeleton";
import { TableEmptyState, MobileEmptyState } from "~/components/shared/empty-state";
import { AdminProductTableRow, AdminProductMobileCard } from "~/components/admin/products/admin-product-table-items";
import SearchInput from "~/components/ui/search";
import {
	TooltipProvider,
} from "~/components/ui/tooltip";
import { PageHeader } from "~/components/shared/page-header";
import { DataTableToolbar, SelectFilter } from "~/components/table/toolbar";

export default function AdminProductsPage() {
	// ─── States & Hooks ──────────────────────────────────────────────────────

	const {
		page,
		limit,
		search,
		sortBy,
		sortOrder,
		typeFilter,
		statusFilter,
		setPage,
		setLimit,
		setSearch,
		setTypeFilter,
		setStatusFilter,
		handleSort,
		products,
		total,
		totalPages,
		isLoading,
	} = useAdminProducts();

	const isFiltered = search !== "" || typeFilter !== "ALL" || statusFilter !== "ALL";

	// ─── Helpers ─────────────────────────────────────────────────────────────

	// ─── Render ──────────────────────────────────────────────────────────────



	return (
		<TooltipProvider>
			<div className="w-full max-w-7xl mx-auto space-y-6">
				{/* Header */}
				<PageHeader
					title="Semua Produk"
					description="Pantau seluruh produk yang dibuat oleh Kreator."
				/>

				{/* Toolbar */}
				<DataTableToolbar
					search={
						<SearchInput
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Cari berdasarkan Nama Produk atau Kreator"
							className="w-full"
						/>
					}
					actions={
						<>
							<SelectFilter
								label={`Kategori: ${getProductTypeLabel(typeFilter)}`}
								value={typeFilter}
								onValueChange={setTypeFilter}
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
									onSort={handleSort}
								/>
								<TableHead className="w-[20%]">Kreator</TableHead>
								<TableHead className="w-[15%]">Kategori</TableHead>
								<TableHead className="w-[10%]">Tipe</TableHead>
								<TableHead className="w-[10%]">Harga</TableHead>
								<TableHead className="w-[10%]">Status</TableHead>
								<TableHead className="text-left w-[5%]">Aksi</TableHead>
							</TableRow>
						</TableHeader>

						<TableBody>
							{isLoading ? (
								<DataTableBodySkeleton columns={8} rows={5} />
							) : products?.length === 0 ? (
								<TableEmptyState
									colSpan={8}
									title={isFiltered ? "Hasil pencarian atau filter tidak ditemukan." : "Tidak ada produk yang ditemukan."}
								/>
							) : (
								products?.map((item: any, index: number) => (
									<AdminProductTableRow
										key={item.id}
										item={item}
										index={index}
										page={page}
										limit={limit}
										showCreatorColumn={true}
										viewHref={`/admin/produk/${item.id}`}
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
					) : products?.length === 0 ? (
						<MobileEmptyState
							title={isFiltered ? "Hasil pencarian atau filter tidak ditemukan." : "Tidak ada produk yang ditemukan."}
						/>
					) : (
						products?.map((item: any) => (
							<AdminProductMobileCard
								key={item.id}
								item={item}
								showCreatorColumn={true}
								viewHref={`/admin/produk/${item.id}`}
							/>
						))
					)}

					{/* Mobile Pagination */}
					{products && products.length > 0 && (
						<div className="bg-white border border-slate-800 rounded-xl p-4 shadow-[1.5px_1.5px_0px_#000]">
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
