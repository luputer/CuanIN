"use client";

import {
	Search,
	ChevronDown,
	Eye,
	ChevronLeft,
	ChevronRight
} from "lucide-react";

export default function UserPage() {
	const users = [
		{
			id: 1,
			name: "Sophia Lee",
			email: "sophialee@gmail.com",
			phone: "081234567890",
			productsBought: 30,
			totalTransaction: "Rp 1.000.000"
		},
		{
			id: 2,
			name: "Sophia Lee",
			email: "sophialee@gmail.com",
			phone: "081234567890",
			productsBought: 30,
			totalTransaction: "Rp 1.000.000"
		},
		{
			id: 3,
			name: "Sophia Lee",
			email: "sophialee@gmail.com",
			phone: "081234567890",
			productsBought: 30,
			totalTransaction: "Rp 1.000.000"
		},
		{
			id: 4,
			name: "Sophia Lee",
			email: "sophialee@gmail.com",
			phone: "081234567890",
			productsBought: 30,
			totalTransaction: "Rp 1.000.000"
		},
		{
			id: 5,
			name: "Sophia Lee",
			email: "sophialee@gmail.com",
			phone: "081234567890",
			productsBought: 30,
			totalTransaction: "Rp 1.000.000"
		},
		{
			id: 6,
			name: "Sophia Lee",
			email: "sophialee@gmail.com",
			phone: "081234567890",
			productsBought: 30,
			totalTransaction: "Rp 1.000.000"
		},
	];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-bold text-blue-600">Daftar User</h1>
				<p className="text-slate-500 mt-1 text-sm">
					Pantau semua user yang membeli produkmu.
				</p>
			</div>

			{/* Toolbar */}
			<div className="flex flex-col md:flex-row justify-between gap-4">
				{/* Search */}
				<div className="relative w-full md:w-96">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
					<input
						type="text"
						placeholder="Cari berdasarkan Nama User atau Produk"
						className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
					/>
				</div>
			</div>

			{/* Table */}
			<div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
				<table className="w-full text-sm text-left">
					<thead className="bg-[#EBF5FF] text-slate-700 font-bold border-b border-blue-100">
						<tr>
							<th className="px-6 py-4 flex items-center gap-1 cursor-pointer hover:text-blue-600">
								Nama
								<div className="flex flex-col">
									<ChevronDown className="w-3 h-3 rotate-180 -mb-1" />
									<ChevronDown className="w-3 h-3" />
								</div>
							</th>
							<th className="px-6 py-4">Email</th>
							<th className="px-6 py-4">Phone</th>
							<th className="px-6 py-4 text-center">Total Produk Dibeli</th>
							<th className="px-6 py-4">Total Transaksi</th>
							<th className="px-6 py-4 text-center">Action</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100">
						{users.map((item) => (
							<tr key={item.id} className="hover:bg-slate-50 transition-colors">
								<td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
								<td className="px-6 py-4 text-slate-600">{item.email}</td>
								<td className="px-6 py-4 text-slate-600">{item.phone}</td>
								<td className="px-6 py-4 text-center text-slate-800 font-medium">{item.productsBought}</td>
								<td className="px-6 py-4 font-medium text-slate-800">{item.totalTransaction}</td>
								<td className="px-6 py-4">
									<div className="flex justify-center">
										<button className="text-blue-500 hover:text-blue-700 transition-colors">
											<Eye className="w-5 h-5" />
										</button>
									</div>
								</td>
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
