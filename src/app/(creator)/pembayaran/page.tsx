"use client";

import {
	Search,
	ChevronDown,
	ArrowUpRight,
	Wallet,
	ChevronLeft,
	ChevronRight
} from "lucide-react";

export default function TransactionPage() {
	const transactions = [
		{
			id: 1,
			total: "Rp 259.000",
			method: "Transfer Bank",
			name: "Sophia Lee",
			product: "Webinar UI/UX Dasar",
			date: "22 Maret 2026 09:00",
			status: "Sudah Bayar"
		},
		{
			id: 2,
			total: "Rp 149.000",
			method: "Transfer Bank",
			name: "Sophia Lee",
			product: "Kelas React untuk Pemula",
			date: "22 Maret 2026 09:00",
			status: "Sudah Bayar"
		},
		{
			id: 3,
			total: "Rp 259.000",
			method: "Transfer Bank",
			name: "Sophia Lee",
			product: "Template CV ATS Friendly",
			date: "22 Maret 2026 09:00",
			status: "Sudah Bayar"
		},
		{
			id: 4,
			total: "Rp 149.000",
			method: "Transfer Bank",
			name: "Sophia Lee",
			product: "Webinar Personal Branding",
			date: "22 Maret 2026 09:00",
			status: "Sudah Bayar"
		},
		{
			id: 5,
			total: "Rp 149.000",
			method: "Transfer Bank",
			name: "Sophia Lee",
			product: "Bootcamp Laravel 7 Hari",
			date: "22 Maret 2026 09:00",
			status: "Sudah Bayar"
		},
		{
			id: 6,
			total: "Rp 259.000",
			method: "Transfer Bank",
			name: "Sophia Lee",
			product: "Bundle Icon Pack Premium",
			date: "22 Maret 2026 09:00",
			status: "Sudah Bayar"
		},
	];

	return (
		<div className="space-y-8">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-bold text-blue-600">Daftar Transaksi</h1>
				<p className="text-slate-500 mt-1 text-sm">
					Lihat pemasukan, saldo tersedia, dan tarik dana kapan saja.
				</p>
			</div>

			{/* Stats Card */}
			<div className="bg-white rounded-xl border border-blue-100 p-0 flex flex-col md:flex-row shadow-sm overflow-hidden">
				{/* Balance Section */}
				<div className="flex-1 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100">
					<div className="flex items-center gap-2 text-slate-500 mb-4">
						<Wallet className="w-5 h-5 text-blue-500" />
						<span className="font-medium text-sm">Saldo saat ini</span>
					</div>
					<div className="flex items-end justify-between">
						<h2 className="text-3xl font-bold text-blue-600">Rp 1.500.000</h2>
						<button className="flex items-center gap-2 px-4 py-2 border border-blue-200 text-blue-600 bg-white hover:bg-blue-50 rounded-lg font-medium text-sm transition-colors shadow-sm">
							Tarik Saldo
							<ArrowUpRight className="w-4 h-4" />
						</button>
					</div>
				</div>

				{/* Total Income */}
				<div className="md:w-72 p-6 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-center">
					<p className="text-xs font-bold text-slate-700 mb-2">Total Penghasilan</p>
					<h3 className="text-xl font-bold text-blue-600 mb-2">Rp 1.500.000</h3>
					<div className="flex justify-between items-center text-xs">
						<span className="text-slate-400">30 hari terakhir</span>
						<span className="px-2 py-0.5 bg-green-100 text-green-600 rounded-full font-medium">+ 30%</span>
					</div>
				</div>

				{/* Total Transaction */}
				<div className="md:w-72 p-6 flex flex-col justify-center">
					<p className="text-xs font-bold text-slate-700 mb-2">Total Transaksi</p>
					<h3 className="text-xl font-bold text-blue-600 mb-2">65</h3>
					<div className="flex justify-between items-center text-xs">
						<span className="text-slate-400">30 hari terakhir</span>
						<span className="px-2 py-0.5 bg-green-100 text-green-600 rounded-full font-medium">+ 30%</span>
					</div>
				</div>
			</div>

			{/* Toolbar */}
			<div className="flex flex-col md:flex-row justify-between gap-4">
				{/* Search */}
				<div className="relative w-full md:w-96">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
					<input
						type="text"
						placeholder="Cari berdasarkan ID Transaksi atau Creator"
						className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
					/>
				</div>

				{/* Filter */}
				<div className="flex gap-3">
					<button className="flex items-center justify-between gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white hover:bg-slate-50 min-w-[150px]">
						<span>Status: Semua</span>
						<ChevronDown className="w-4 h-4" />
					</button>
				</div>
			</div>

			{/* Table */}
			<div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
				<table className="w-full text-sm text-left">
					<thead className="bg-[#EBF5FF] text-slate-700 font-bold border-b border-blue-100">
						<tr>
							<th className="px-6 py-4">ID Transaksi</th>
							<th className="px-6 py-4">Total</th>
							<th className="px-6 py-4">Metode</th>
							<th className="px-6 py-4 cursor-pointer hover:text-blue-600">
								<div className="flex items-center gap-1">
									Nama
									<div className="flex flex-col">
										<ChevronDown className="w-3 h-3 rotate-180 -mb-1" />
										<ChevronDown className="w-3 h-3" />
									</div>
								</div>
							</th>
							<th className="px-6 py-4 cursor-pointer hover:text-blue-600">
								<div className="flex items-center gap-1">
									Produk
									<div className="flex flex-col">
										<ChevronDown className="w-3 h-3 rotate-180 -mb-1" />
										<ChevronDown className="w-3 h-3" />
									</div>
								</div>
							</th>
							<th className="px-6 py-4 cursor-pointer hover:text-blue-600">
								<div className="flex items-center gap-1">
									Tanggal
									<div className="flex flex-col">
										<ChevronDown className="w-3 h-3 rotate-180 -mb-1" />
										<ChevronDown className="w-3 h-3" />
									</div>
								</div>
							</th>
							<th className="px-6 py-4">Status</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100">
						{transactions.map((item) => (
							<tr key={item.id} className="hover:bg-slate-50 transition-colors">
								<td className="px-6 py-4 font-medium text-slate-600 text-center">{item.id}</td>
								<td className="px-6 py-4 font-medium text-slate-800">{item.total}</td>
								<td className="px-6 py-4 text-slate-600">{item.method}</td>
								<td className="px-6 py-4 text-slate-600">{item.name}</td>
								<td className="px-6 py-4 text-slate-600 truncate max-w-[200px]">{item.product}</td>
								<td className="px-6 py-4 text-slate-600">{item.date}</td>
								<td className="px-6 py-4 font-medium text-slate-800">{item.status}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			<div className="flex items-center justify-between text-sm text-slate-500 pt-2">
				<div className="flex items-center gap-3">
					<button className="flex items-center justify-between px-3 py-2 border border-slate-200 rounded-lg bg-white w-16">
						7 <ChevronDown className="w-3 h-3" />
					</button>
					<span className="text-slate-400">Hasil: 1-7 dari 300</span>
				</div>
				<div className="flex items-center gap-2">
					<button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
						<ChevronLeft className="w-4 h-4" />
					</button>
					<button className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg font-medium shadow-sm shadow-blue-200">1</button>
					<button className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 rounded-lg text-slate-500">2</button>
					<button className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 rounded-lg text-slate-500">3</button>
					<span className="px-1 text-slate-400">...</span>
					<button className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 rounded-lg text-slate-500">100</button>
					<button className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
						<ChevronRight className="w-4 h-4" />
					</button>
				</div>
			</div>
		</div>
	);
}
