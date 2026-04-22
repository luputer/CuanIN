"use client";

import { useState } from "react";
import {
	Search,
	ChevronDown,
	Eye,
	ChevronLeft,
	ChevronRight,
	UserX
} from "lucide-react";
import { api } from "~/trpc/react";
import { useDebounce } from "~/hooks/use-debounce";
import {
	Table,
	TableHead,
	TableHeader,
	TableRow,
	TableBody,
	TableCell,
} from "~/components/ui/table";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
} from "~/components/ui/pagination";
import { Skeleton } from "~/components/ui/skeleton";

export default function UserPage() {
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const debouncedSearch = useDebounce(search, 500);

	const { data, isLoading } = api.purchases.getAllParticipants.useQuery({
		page,
		limit,
		search: debouncedSearch,
	});

	const participants = data?.items ?? [];
	const total = data?.total ?? 0;
	const totalPages = data?.totalPages ?? 0;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-bold text-blue-600">Daftar Peserta</h1>
				<p className="text-slate-500 mt-1 text-sm">
					Pantau semua peserta yang membeli produkmu.
				</p>
			</div>

			{/* Toolbar */}
			<div className="flex flex-col md:flex-row justify-between gap-4">
				{/* Search */}
				<div className="relative w-full md:w-96">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
					<input
						type="text"
						placeholder="Cari berdasarkan Nama atau Email"
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
							setPage(1);
						}}
						className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
					/>
				</div>
			</div>

			{/* Table */}
			<div className="bg-white border-t border-b border-slate-200">
				<Table className="w-full text-sm text-left">
					<TableHeader className="bg-cyan-50/60 border-b border-t border-cyan-100">
						<TableRow className="hover:bg-cyan-50/60 border-none">
							<TableHead className="py-4 px-6 text-slate-700 font-bold whitespace-normal">
								<div className="flex items-center gap-2 cursor-pointer hover:text-blue-600">
									Nama
									<div className="flex flex-col text-slate-400">
										<ChevronDown className="w-3 h-3 rotate-180 -mb-1" />
										<ChevronDown className="w-3 h-3" />
									</div>
								</div>
							</TableHead>
							<TableHead className="py-4 px-6 text-slate-700 font-bold whitespace-normal">Email</TableHead>
							<TableHead className="py-4 px-6 text-slate-700 font-bold whitespace-normal">Phone</TableHead>
							<TableHead className="py-4 px-6 text-slate-700 font-bold text-center whitespace-normal">Total Produk Dibeli</TableHead>
							<TableHead className="py-4 px-6 text-slate-700 font-bold whitespace-normal">Total Transaksi</TableHead>
							<TableHead className="py-4 px-6 text-slate-700 font-bold text-center whitespace-normal">Action</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody className="divide-y divide-slate-100">
						{isLoading ? (
							Array.from({ length: 5 }).map((_, i) => (
								<TableRow key={i}>
									<TableCell className="py-4 px-6"><Skeleton className="h-4 w-32" /></TableCell>
									<TableCell className="py-4 px-6"><Skeleton className="h-4 w-40" /></TableCell>
									<TableCell className="py-4 px-6"><Skeleton className="h-4 w-32" /></TableCell>
									<TableCell className="py-4 px-6 text-center"><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
									<TableCell className="py-4 px-6"><Skeleton className="h-4 w-24" /></TableCell>
									<TableCell className="py-4 px-6"><div className="flex justify-center"><Skeleton className="h-5 w-5" /></div></TableCell>
								</TableRow>
							))
						) : participants.length > 0 ? (
							participants.map((item, idx) => (
								<TableRow key={idx} className="hover:bg-slate-50 transition-colors">
									<TableCell className="py-4 px-6 font-medium text-slate-800">{item.name}</TableCell>
									<TableCell className="py-4 px-6 text-slate-600">{item.email}</TableCell>
									<TableCell className="py-4 px-6 text-slate-600">{item.phone}</TableCell>
									<TableCell className="py-4 px-6 text-center text-slate-800 font-medium">{item.productsBought}</TableCell>
									<TableCell className="py-4 px-6 font-medium text-slate-800">
										Rp {item.totalTransaction.toLocaleString("id-ID")}
									</TableCell>
									<TableCell className="py-4 px-6">
										<div className="flex justify-center">
											<button className="text-[#00B4D8] cursor-pointer hover:text-[#008ba8] transition-colors p-1">
												<Eye className="w-5 h-5" strokeWidth={2} />
											</button>
										</div>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={6} className="py-10 text-center text-slate-500">
									<div className="flex flex-col items-center gap-2">
										<UserX className="w-8 h-8 text-slate-300" />
										<p>Tidak ada data peserta ditemukan.</p>
									</div>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			{totalPages > 0 && (
				<div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-slate-500 pt-2 w-full">
					<div className="flex items-center gap-3">
						<div className="relative">
							<select
								value={limit}
								onChange={(e) => {
									setLimit(Number(e.target.value));
									setPage(1);
								}}
								className="appearance-none bg-white border border-slate-200 rounded px-3 py-1.5 pr-8 text-slate-600 hover:bg-slate-50 focus:outline-none cursor-pointer w-20"
							>
								<option value={5}>5</option>
								<option value={10}>10</option>
								<option value={20}>20</option>
								<option value={50}>50</option>
							</select>
							<ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
						</div>
						<span className="text-slate-500 whitespace-nowrap">
							Hasil: {total > 0 ? (page - 1) * limit + 1 : 0}-{Math.min(page * limit, total)} dari {total}
						</span>
					</div>
					<div className="flex items-center">
						<Pagination className="justify-center sm:justify-end">
							<PaginationContent className="gap-1">
								<PaginationItem>
									<button
										onClick={() => setPage(p => Math.max(1, p - 1))}
										disabled={page === 1}
										className="flex items-center justify-center p-2 text-slate-400 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										<ChevronLeft className="w-4 h-4" />
									</button>
								</PaginationItem>
								
								{Array.from({ length: totalPages }, (_, i) => i + 1)
									.filter(p => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1))
									.map((p, index, array) => {
										const prev = array[index - 1];
										const showEllipsis = index > 0 && prev !== undefined && p - prev > 1;
										return (
											<div key={p} className="flex items-center gap-1">
												{showEllipsis && <PaginationEllipsis />}
												<PaginationItem>
													<button
														key={p}
														onClick={() => setPage(p)}
														className={`h-7 w-7 rounded-[4px] flex items-center justify-center font-medium text-xs transition-colors ${
															page === p
																? "bg-[#00B4D8] text-white hover:bg-[#009bc2]"
																: "text-slate-500 hover:bg-slate-100"
														}`}
													>
														{p}
													</button>
												</PaginationItem>
											</div>
										);
									})}

								<PaginationItem>
									<button
										onClick={() => setPage(p => Math.min(totalPages, p + 1))}
										disabled={page === totalPages}
										className="flex items-center justify-center p-2 text-slate-400 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										<ChevronRight className="w-4 h-4" />
									</button>
								</PaginationItem>
							</PaginationContent>
						</Pagination>
					</div>
				</div>
			)}
		</div>
	);
}
