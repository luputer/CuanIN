"use client";

import { useState } from "react";
import {
	ArrowUpRight,
	Wallet,
} from "lucide-react";
import { api } from "~/trpc/react";
import { useDebounce } from "~/hooks/use-debounce";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Skeleton } from "~/components/ui/skeleton";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
} from "~/components/ui/dropdown-menu";
import ButtonFilter from "~/components/ui/filter";
import SearchInput from "~/components/ui/search";
import {
	Table,
	TableHead,
	TableHeader,
	TableRow,
	TableBody,
	TableCell,
	TablePagination,
} from "~/components/ui/table";

export default function TransactionPage() {
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(7);
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("ALL");
	const debouncedSearch = useDebounce(search, 500);

	const { data, isLoading } = api.purchases.getAllForCreator.useQuery({
		page,
		limit,
		search: debouncedSearch,
		status,
	}, {
		placeholderData: (prev) => prev,
	});

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	const transactions = data?.items ?? [];
	const stats = data?.stats ?? { totalIncome: 0, totalTransactions: 0, balance: 0 };
	const totalPages = data?.totalPages ?? 0;
	const totalItems = data?.total ?? 0;

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case "completed": return "bg-green-100 text-green-700";
			case "pending": return "bg-yellow-100 text-yellow-700";
			case "failed": return "bg-red-100 text-red-700";
			case "expired": return "bg-slate-200 text-slate-500";
			default: return "bg-slate-100 text-slate-600";
		}
	};

	const getStatusLabel = (status: string) => {
		switch (status) {
			case "ALL": return "Semua";
			case "completed": return "Sudah Bayar";
			case "pending": return "Menunggu";
			case "failed": return "Gagal";
			case "expired": return "Kedaluwarsa";
			default: return status;
		}
	};

	return (
		<div className="space-y-8">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-bold text-cyan-600">Daftar Transaksi</h1>
				<p className="text-slate-500 mt-1 text-sm">
					Lihat pemasukan, saldo tersedia, dan tarik dana kapan saja.
				</p>
			</div>

			{/* Stats Card */}
			<div className="bg-white rounded-xl border border-slate-800 shadow-[0px_1px_0px_rgba(30,27,75)] p-0 flex flex-col md:flex-row overflow-hidden">
				{/* Balance Section */}
				<div className="flex-1 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200">
					<div className="flex items-center gap-2 text-slate-500 mb-4">
						<Wallet className="w-5 h-5 text-blue-500" />
						<span className="font-medium text-sm">Saldo saat ini</span>
					</div>
					<div className="flex items-end justify-between">
						<h2 className="text-2xl font-bold text-blue-600">
							{isLoading && !data ? <Skeleton className="h-8 w-40" /> : formatCurrency(stats.balance)}
						</h2>
						<button className="flex items-center gap-2 px-4 py-2 border border-blue-200 text-blue-600 bg-white hover:bg-blue-50 rounded-lg font-medium text-sm transition-colors shadow-sm">
							Tarik Saldo
							<ArrowUpRight className="w-4 h-4" />
						</button>
					</div>
				</div>

				{/* Total Income */}
				<div className="md:w-72 p-6 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-center">
					<p className="text-xs font-bold text-slate-700 mb-2">Total Penghasilan</p>
					<h3 className="text-xl font-bold text-blue-600 mb-2">
						{isLoading && !data ? <Skeleton className="h-7 w-32" /> : formatCurrency(stats.totalIncome)}
					</h3>
					<div className="flex justify-between items-center text-xs">
						<span className="text-slate-400">Total akumulasi</span>
					</div>
				</div>

				{/* Total Transaction */}
				<div className="md:w-72 p-6 flex flex-col justify-center">
					<p className="text-xs font-bold text-slate-700 mb-2">Total Transaksi</p>
					<h3 className="text-xl font-bold text-blue-600 mb-2">
						{isLoading && !data ? <Skeleton className="h-7 w-12" /> : stats.totalTransactions}
					</h3>
					<div className="flex justify-between items-center text-xs">
						<span className="text-slate-400">Transaksi berhasil</span>
					</div>
				</div>
			</div>

			{/* Toolbar */}
			<div className="flex flex-col md:flex-row justify-between gap-4">
				{/* Search */}
				<SearchInput
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Cari berdasarkan ID, Produk, atau Nama Pembeli"
				/>

				{/* Filter */}
				<div className="flex gap-3">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<ButtonFilter label={`Status: ${getStatusLabel(status)}`} />
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-[180px]">
							<DropdownMenuRadioGroup value={status} onValueChange={setStatus}>
								<DropdownMenuRadioItem value="ALL">Semua Status</DropdownMenuRadioItem>
								<DropdownMenuRadioItem value="completed">Sudah Bayar</DropdownMenuRadioItem>
								<DropdownMenuRadioItem value="pending">Menunggu</DropdownMenuRadioItem>
								<DropdownMenuRadioItem value="failed">Gagal</DropdownMenuRadioItem>
								<DropdownMenuRadioItem value="expired">Kedaluwarsa</DropdownMenuRadioItem>
							</DropdownMenuRadioGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* Table */}
			<Table
				pagination={
					<TablePagination
						page={page}
						totalPages={totalPages}
						limit={limit}
						total={totalItems}
						onPageChange={setPage}
						onLimitChange={setLimit}
					/>
				}
			>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[5%] text-center">No</TableHead>
						<TableHead>ID Transaksi</TableHead>
						<TableHead>Total</TableHead>
						<TableHead>Metode</TableHead>
						<TableHead>Nama Pembeli</TableHead>
						<TableHead>Produk</TableHead>
						<TableHead>Tanggal</TableHead>
						<TableHead>Status</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{isLoading && !data ? (
						Array.from({ length: 5 }).map((_, i) => (
							<TableRow key={i}>
								<TableCell><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
								<TableCell><Skeleton className="h-4 w-16" /></TableCell>
								<TableCell><Skeleton className="h-4 w-24" /></TableCell>
								<TableCell><Skeleton className="h-4 w-20" /></TableCell>
								<TableCell><Skeleton className="h-4 w-32" /></TableCell>
								<TableCell><Skeleton className="h-4 w-40" /></TableCell>
								<TableCell><Skeleton className="h-4 w-32" /></TableCell>
								<TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
							</TableRow>
						))
					) : transactions.length === 0 ? (
						<TableRow>
							<TableCell colSpan={8} className="py-20 text-center text-slate-500">
								Tidak ada transaksi ditemukan
							</TableCell>
						</TableRow>
					) : (
						transactions.map((item, index) => (
							<TableRow key={item.id}>
								<TableCell className="text-center font-medium">
									{(page - 1) * limit + index + 1}
								</TableCell>
								<TableCell className="font-medium text-slate-400 text-xs truncate max-w-[100px]">
									{item.id}
								</TableCell>
								<TableCell className="font-medium text-slate-800 whitespace-nowrap">
									{formatCurrency(Number(item.amount))}
								</TableCell>
								<TableCell className="text-slate-600 whitespace-nowrap">
									{item.xenditPaymentMethod ?? "-"}
								</TableCell>
								<TableCell className="text-slate-600 whitespace-nowrap">{item.buyerName}</TableCell>
								<TableCell className="text-slate-600 truncate max-w-[200px]">
									{item.product.name}
								</TableCell>
								<TableCell className="text-slate-600 whitespace-nowrap">
									{format(new Date(item.createdAt), "dd MMM yyyy HH:mm", { locale: id })}
								</TableCell>
								<TableCell>
									<span className={`px-4 py-1 rounded-full text-[13px] font-medium leading-tight ${getStatusColor(item.status)}`}>
										{item.status === "completed" ? "Sudah Bayar" :
										 item.status === "pending" ? "Menunggu" :
										 item.status === "failed" ? "Gagal" :
										 item.status === "expired" ? "Kedaluwarsa" : item.status}
									</span>
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</div>
	);
}

