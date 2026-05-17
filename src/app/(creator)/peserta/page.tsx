"use client";

// React
import { useState, useEffect } from "react";

// Next.js
import Link from "next/link";

// Icons
import {
	CaretUpIcon,
	CaretDownIcon,
	EyeIcon,
	UserMinusIcon,
} from "@phosphor-icons/react";

// Internal & Utils
import { api } from "~/trpc/react";

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
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "~/components/ui/tooltip";

export default function UserPage() {
	// ─── States & Hooks ──────────────────────────────────────────────────────

	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);

	// ─── Effects ─────────────────────────────────────────────────────────────

	// Debounce search
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(search);
			setPage(1);
		}, 500);
		return () => clearTimeout(timer);
	}, [search]);

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
				<div className="bg-slate-50">
					<div className="sticky top-[74px] bg-slate-50 z-40 -mx-4 sm:-mx-6 px-4 sm:px-6 mb-2">
						<div className="text-2xl font-bold mb-2 text-cyan-600">Daftar User</div>
						<div className="text-sm font-regular text-slate-600">Pantau semua user yang membeli produkmu.</div>
					</div>
				</div>

				{/* Toolbar */}
				<div className="flex flex-wrap items-center justify-between gap-4">
					{/* Search */}
					<SearchInput
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Cari berdasarkan Nama atau Email"
						className="w-full sm:flex-1 min-w-[280px]"
					/>
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
								<TableHead className="w-[5%] text-center whitespace-nowrap">No</TableHead>
								<TableHead className="w-[20%] whitespace-nowrap">
									<div className="flex items-center gap-2 cursor-pointer hover:text-slate-900 transition-colors group">
										Nama
										<div className="flex flex-col h-4 justify-center">
											<CaretUpIcon className="w-3 h-3 text-slate-400" />
											<CaretDownIcon className="w-3 h-3 text-slate-400" />
										</div>
									</div>
								</TableHead>
								<TableHead className="w-[20%] whitespace-nowrap">Email</TableHead>
								<TableHead className="w-[15%] whitespace-nowrap">Nomor Hp</TableHead>
								<TableHead className="w-[15%] text-center whitespace-nowrap">Produk Dibeli</TableHead>
								<TableHead className="w-[15%] whitespace-nowrap">Total Transaksi</TableHead>
								<TableHead className="text-left w-[10%] whitespace-nowrap">Aksi</TableHead>
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
										<TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
										<TableCell><Skeleton className="h-4 w-24" /></TableCell>
										<TableCell>
											<div className="flex justify-start">
												<Skeleton className="h-5 w-5" />
											</div>
										</TableCell>
									</TableRow>
								))
							) : participants.length === 0 ? (
								<TableRow className="text-center">
									<TableCell colSpan={7} className="py-20">
										<div className="flex flex-col items-center gap-2">
											<UserMinusIcon size={48} className="text-slate-300" />
											<span className="text-slate-500">Tidak ada data peserta ditemukan.</span>
										</div>
									</TableCell>
								</TableRow>
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
						Array.from({ length: 3 }).map((_, i) => (
							<div key={i} className="bg-white border border-slate-800 rounded-xl p-4 space-y-3 animate-pulse">
								<div className="flex justify-between items-center border-b border-slate-100 pb-2">
									<Skeleton className="h-4 w-8" />
									<Skeleton className="h-6 w-20 rounded-full" />
								</div>
								<div className="space-y-2 flex-1">
									<Skeleton className="h-4 w-3/4" />
									<Skeleton className="h-3 w-1/2" />
									<Skeleton className="h-3 w-1/3" />
								</div>
							</div>
						))
					) : participants.length === 0 ? (
						<div className="text-center py-8 bg-white border border-slate-800 rounded-xl p-4 text-slate-500">
							Tidak ada data peserta ditemukan.
						</div>
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
