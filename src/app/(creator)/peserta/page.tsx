"use client";

// React
// (No React imports needed currently)

// Next.js
import Link from "next/link";

// Icons
import {
	EyeIcon,
	UserMinusIcon,
} from "@phosphor-icons/react";

// Internal & Utils
import { api } from "~/trpc/react";
import { useDataTable } from "~/hooks/use-data-table";

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
import SearchInput from "~/components/ui/search";
import { PageHeader } from "~/components/shared/page-header";
import { DataTableToolbar } from "~/components/table/toolbar";
import { DataTableBodySkeleton, DataTableMobileSkeleton } from "~/components/table/skeleton";
import { TableEmptyState, MobileEmptyState } from "~/components/shared/empty-state";
import { MobilePaginationWrapper } from "~/components/shared/mobile-pagination-wrapper";
import { SortableTableHead } from "~/components/table/head";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "~/components/ui/tooltip";

export default function UserPage() {
	// ─── States & Hooks ──────────────────────────────────────────────────────


	const {
		page, setPage,
		limit, setLimit,
		search, setSearch,
		debouncedSearch,
	} = useDataTable<"name">("name", "asc");

	// ─── API ─────────────────────────────────────────────────────────────────

	const { data, isLoading } = api.purchases.getAllParticipants.useQuery({
		page,
		limit,
		search: debouncedSearch,
	}, {
		placeholderData: (prev) => prev,
	});

	const participants = data?.items ?? [];
	const total = data?.total ?? 0;
	const totalPages = data?.totalPages ?? 1;

	// ─── Render ──────────────────────────────────────────────────────────────

	return (
		<TooltipProvider>
			<div className="w-full max-w-7xl mx-auto space-y-6">
				{/* Header */}
				<PageHeader
					title="Daftar User"
					description="Pantau semua user yang membeli produkmu."
				/>

				{/* Toolbar */}
				<DataTableToolbar
					search={
						<SearchInput
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Cari berdasarkan Nama atau Email"
							className="w-full"
						/>
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
								<TableHead className="w-[5%] text-center whitespace-nowrap">No</TableHead>
								<SortableTableHead
									title="Nama"
									sortKey="name"
									isActive={false}
									sortOrder="asc"
									className="w-[20%] whitespace-nowrap"
								/>
								<TableHead className="w-[20%] whitespace-nowrap">Email</TableHead>
								<TableHead className="w-[15%] whitespace-nowrap">Nomor Hp</TableHead>
								<TableHead className="w-[15%] text-center whitespace-nowrap">Produk Dibeli</TableHead>
								<TableHead className="w-[15%] whitespace-nowrap">Total Transaksi</TableHead>
								<TableHead className="text-left w-[10%] whitespace-nowrap">Aksi</TableHead>
							</TableRow>
						</TableHeader>

						<TableBody>
							{isLoading ? (
								<DataTableBodySkeleton columns={7} rows={5} />
							) : participants.length === 0 ? (
								<TableEmptyState
									colSpan={7}
									icon={<UserMinusIcon size={48} className="text-slate-300" />}
									description="Belum ada data pembeli ditemukan."
								/>
							) : (
								participants.map((item, index) => {
									const rowNumber = (page - 1) * limit + index + 1;
									return (
										<TableRow key={index} data-type="body">
											<TableCell className="text-center font-medium">
												{rowNumber}
											</TableCell>

											<TableCell className="whitespace-nowrap">
												<div className="flex items-center min-h-[48px] font-medium text-slate-800">
													{item.name}
												</div>
											</TableCell>

											<TableCell className="whitespace-nowrap">
												<div className="flex items-center min-h-[48px] text-slate-600">
													{item.email}
												</div>
											</TableCell>

											<TableCell className="whitespace-nowrap">
												<div className="flex items-center min-h-[48px] text-slate-600">
													{item.phone || "-"}
												</div>
											</TableCell>

											<TableCell className="text-center whitespace-nowrap">
												<div className="flex items-center justify-center min-h-[48px] font-medium text-slate-800">
													{item.productsBought}
												</div>
											</TableCell>

											<TableCell className="whitespace-nowrap">
												<div className="flex items-center min-h-[48px] font-medium text-slate-800">
													Rp {item.totalTransaction.toLocaleString("id-ID")}
												</div>
											</TableCell>

											<TableCell className="px-6 py-4">
												<div className="flex justify-start items-center gap-3">
													<Tooltip>
														<TooltipTrigger asChild>
															<Link
																href={`/peserta/${encodeURIComponent(item.email)}`}
															>
																<EyeIcon className="w-[22px] h-[22px] text-cyan-600 cursor-pointer hover:text-cyan-700 transition-colors" />
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
						<DataTableMobileSkeleton rows={3} />
					) : participants.length === 0 ? (
						<MobileEmptyState
							description="Belum ada data pembeli ditemukan."
						/>
					) : (
						participants.map((item, index) => {
							const rowNumber = (page - 1) * limit + index + 1;
							return (
								<div key={index} className="bg-white border border-slate-800 rounded-xl p-4 space-y-3">
									<div className="flex justify-between items-center border-b border-slate-100 pb-2">
										<span className="text-xs font-semibold text-slate-400"># {rowNumber}</span>
									</div>

									<div className="space-y-2 flex-1 min-w-0">
										<Link href={`/peserta/${encodeURIComponent(item.email)}`} className="font-semibold text-slate-800 hover:text-cyan-600 break-words line-clamp-2">
											{item.name}
										</Link>

										<div className="text-xs text-slate-500 break-words">
											<span className="font-medium text-slate-400">Email: </span>
											{item.email}
										</div>

										<div className="text-xs text-slate-500">
											<span className="font-medium text-slate-400">Nomor HP: </span>
											{item.phone || "-"}
										</div>

										<div className="flex justify-between items-center text-xs pt-1">
											<div>
												<span className="font-medium text-slate-400">Produk Dibeli: </span>
												<span className="font-semibold text-slate-700">{item.productsBought}</span>
											</div>

											<div>
												<span className="font-medium text-slate-400">Total Transaksi: </span>
												<span className="font-semibold text-slate-700">
													Rp {item.totalTransaction.toLocaleString("id-ID")}
												</span>
											</div>
										</div>
									</div>

									{/* Action Buttons */}
									<div className="flex justify-end items-center pt-2.5 border-t border-slate-100 gap-2">
										<Link
											href={`/peserta/${encodeURIComponent(item.email)}`}
											className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-cyan-600 border border-cyan-600 rounded-lg hover:bg-cyan-50 transition cursor-pointer"
										>
											<EyeIcon className="w-4 h-4" />
											<span>Lihat Detail</span>
										</Link>
									</div>
								</div>
							);
						})
					)}

					{/* Mobile Pagination */}
					{participants && participants.length > 0 && (
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
			</div>
		</TooltipProvider>
	);
}
