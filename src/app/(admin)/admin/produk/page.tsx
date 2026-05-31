"use client";

// React
import React from "react";

// Next.js
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Third-party
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

// Icons
import {
	EyeIcon,
	CaretUpIcon,
	CaretDownIcon,
	UserCircleIcon,
} from "@phosphor-icons/react";

// Internal & Utils
import { useAdminProducts } from "~/hooks/admin/use-admin-products";
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
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "~/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
} from "~/components/ui/dropdown-menu";

export default function AdminProductsPage() {
	// ─── States & Hooks ──────────────────────────────────────────────────────

	const router = useRouter();

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

	const getStatusColor = (status: string) => {
		const s = status.toLowerCase();
		switch (s) {
			case "published": return "bg-green-100 text-green-700";
			case "unpublished": return "bg-slate-200 text-slate-500";
			case "selesai":
			case "archived": return "bg-blue-100 text-blue-700";
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
			default: return status === "ALL" ? "Semua" : status;
		}
	};

	const getTypeLabel = (type: string) => {
		switch (type) {
			case "WEBINAR": return "Webinar";
			case "DIGITAL_PRODUCT": return "Produk Digital";
			case "KELAS_ONLINE": return "Kelas";
			default: return type === "ALL" ? "Semua" : type;
		}
	};

	// ─── Render ──────────────────────────────────────────────────────────────

	if (isLoading && !products) {
		return <TableSkeleton columns={8} />;
	}

	return (
		<TooltipProvider>
			<div className="w-full max-w-7xl mx-auto space-y-6">
				{/* Header */}
				<div className="bg-slate-50">
					<div className="sticky top-[74px] bg-slate-50 z-40 -mx-4 sm:-mx-6 px-4 sm:px-6 mb-2">
						<div className="text-2xl font-bold mb-2 text-cyan-600">Semua Produk</div>
						<div className="text-sm font-regular text-slate-600">Pantau seluruh produk yang dibuat oleh Kreator.</div>
					</div>
				</div>

				{/* Toolbar */}
				<div className="flex flex-wrap items-center justify-between gap-4">
					{/* Search */}
					<SearchInput
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Cari berdasarkan Nama Produk atau Kreator"
						className="w-full sm:flex-1 min-w-[280px]"
					/>

					{/* Actions */}
					<div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<ButtonFilter
									className="flex-1 lg:flex-none"
									label={`Kategori: ${typeFilter === "ALL" ? "Semua" : getTypeLabel(typeFilter)}`}
								/>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-[180px]">
								<DropdownMenuRadioGroup value={typeFilter} onValueChange={setTypeFilter}>
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
									onClick={() => handleSort("name")}
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
											<div className="flex items-center min-h-[48px] gap-3">
												<Skeleton className="h-8 w-8 rounded-full" />
												<Skeleton className="h-4 w-32" />
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
							) : products?.length === 0 ? (
								<TableRow className="text-center">
									<TableCell colSpan={8} className="py-20">
										<div className="flex flex-col items-center gap-1">
											{isFiltered ? (
												<span className="text-slate-500">Hasil pencarian atau filter tidak ditemukan.</span>
											) : (
												<span className="text-slate-500">Tidak ada produk yang ditemukan.</span>
											)}
										</div>
									</TableCell>
								</TableRow>
							) : (
								products?.map((item: any, index: number) => {
									const priceNum = Number(item.price);
									const rowNumber = (page - 1) * limit + index + 1;

									const isFinished = item.status === "archived" || (item.endDate && new Date() > new Date(item.endDate));
									const currentStatus = isFinished ? "selesai" : (item.status || "unpublished");
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
												<div className="flex items-center gap-3 min-h-[48px]">
													<Avatar>
														<AvatarImage src={item.user.image ?? undefined} alt={item.user.name ?? ""} />
														<AvatarFallback>
															<UserCircleIcon size={24} className="text-slate-400" />
														</AvatarFallback>
													</Avatar>
													<Link href={`/admin/kreator/${item.userId}`} className="hover:text-cyan-600 transition-colors font-medium">
														{item.user.name || "-"}
													</Link>
												</div>
											</TableCell>

											<TableCell className="whitespace-nowrap">
												<div className="flex items-center min-h-[48px]">
													{getTypeLabel(item.type)}
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
													<span className={`px-4 py-1 rounded-full text-[13px] font-medium leading-tight ${getStatusColor(currentStatus)}`}>
														{getStatusLabel(currentStatus)}
													</span>
												</div>
											</TableCell>

											<TableCell className="px-6 py-4 text-right">
												<div className="flex justify-start items-center gap-3">
													<Tooltip>
														<TooltipTrigger asChild>
															<button onClick={() => router.push(`/admin/produk/${item.id}`)}>
																<EyeIcon className="w-[22px] h-[22px] text-cyan-600 cursor-pointer hover:text-cyan-700" />
															</button>
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
					) : products?.length === 0 ? (
						<div className="text-center py-8 bg-white border border-slate-800 rounded-xl p-4 text-slate-500">
							{isFiltered ? (
								"Hasil pencarian atau filter tidak ditemukan."
							) : (
								"Tidak ada produk yang ditemukan."
							)}
						</div>
					) : (
						products?.map((item: any, index: number) => {
							const priceNum = Number(item.price);
							const rowNumber = (page - 1) * limit + index + 1;
							const isFinished = item.status === "archived" || (item.endDate && new Date() > new Date(item.endDate));
							const currentStatus = isFinished ? "selesai" : (item.status || "unpublished");

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
												<Link href={`/admin/kreator/${item.userId}`} className="font-medium hover:text-cyan-600 hover:underline">
													{item.user.name || "-"}
												</Link>
											</div>

											<div className="flex justify-between items-center text-xs pt-1">
												<div>
													<span className="font-medium text-slate-400">Kategori: </span>
													<span className="font-semibold text-slate-700">{getTypeLabel(item.type)}</span>
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
											<button
												onClick={() => router.push(`/admin/produk/${item.id}`)}
												className="p-2 rounded-lg text-cyan-600 border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
												title="Lihat Detail"
											>
												<EyeIcon className="w-5 h-5" />
											</button>
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
