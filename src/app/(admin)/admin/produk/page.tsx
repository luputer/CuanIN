"use client";

import React from "react";
import { TooltipProvider } from "~/components/ui/tooltip";
import { useAdminProducts } from "~/hooks/admin/use-admin-products";
import { ProductToolbar } from "~/components/admin/products/product-toolbar";
import { ProductTable } from "~/components/admin/products/product-table";

export default function AdminProductsPage() {
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

	return (
		<TooltipProvider>
			<div className="space-y-6">
				{/* Header */}
				<div className="bg-slate-50">
					<div className="sticky top-[74px] bg-slate-50 z-40 -mx-4 px-4 mb-2">
						<div className="text-2xl font-bold mb-2 text-cyan-600">Semua Produk</div>
						<div className="text-sm font-regular text-slate-600">Pantau seluruh produk yang dibuat oleh kreator.</div>
					</div>
				</div>

				{/* Toolbar */}
				<ProductToolbar
					search={search}
					onSearchChange={setSearch}
					typeFilter={typeFilter}
					onTypeFilterChange={setTypeFilter}
					statusFilter={statusFilter}
					onStatusFilterChange={setStatusFilter}
				/>

				{/* Table */}
				<ProductTable
					products={products as any}
					isLoading={isLoading}
					page={page}
					limit={limit}
					total={total}
					totalPages={totalPages}
					onPageChange={setPage}
					onLimitChange={setLimit}
					sortBy={sortBy}
					sortOrder={sortOrder}
					onSort={handleSort}
				/>
			</div>
		</TooltipProvider>
	);
}
