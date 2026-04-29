"use client";

import {
	CaretUpIcon,
	CaretDownIcon,
	EyeIcon,
	UserMinusIcon,
} from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
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
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);

	// Debounce search
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(search);
			setPage(1);
		}, 500);
		return () => clearTimeout(timer);
	}, [search]);

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

	return (
		<TooltipProvider>
			<div className="space-y-6">
				{/* Header */}
				<div className="bg-slate-50">
					<div className="sticky top-[74px] bg-slate-50 z-40 -mx-4 px-4 mb-2">
						<div className="text-2xl font-semibold mb-2 text-blue-600">Daftar User</div>
						<div className="text-sm font-regular text-slate-600">Pantau semua user yang membeli produkmu.</div>
					</div>
				</div>

				{/* Toolbar */}
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
					<SearchInput
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Cari berdasarkan Nama atau Email"
					/>
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
								<TableHead className="w-[20%]">
									<div className="flex items-center gap-2 cursor-pointer hover:text-slate-900 transition-colors group">
										Nama
										<div className="flex flex-col h-4 justify-center">
											<CaretUpIcon className="w-3 h-3 text-slate-400" />
											<CaretDownIcon className="w-3 h-3 text-slate-400" />
										</div>
									</div>
								</TableHead>
								<TableHead className="w-[20%]">Email</TableHead>
								<TableHead className="w-[15%]">Nomor Hp</TableHead>
								<TableHead className="w-[15%] text-center">Produk Dibeli</TableHead>
								<TableHead className="w-[15%]">Total Transaksi</TableHead>
								<TableHead className="text-left w-[10%]">Aksi</TableHead>
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
													{item.phone}
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
															<button className="text-cyan-600 cursor-pointer hover:text-cyan-700 transition-colors">
																<EyeIcon size={24} weight="regular" />
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
			</div>
		</TooltipProvider>
	);
}
