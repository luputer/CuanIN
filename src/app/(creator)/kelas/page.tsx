"use client";

import {
	Search,
	ChevronDown,
	Plus,
	Eye,
	Trash2,
	ChevronLeft,
	ChevronRight
} from "lucide-react";

export default function ClassPage() {
	const classes = [
		{
			id: 1,
			name: "Kelas React untuk Pemula",
			duration: "6 Jam",
			type: "Gratis",
			price: "Rp 0",
			buyers: 27,
			status: "Selesai"
		},
		{
			id: 2,
			name: "Bootcamp Laravel 7 Hari",
			duration: "6 Jam",
			type: "Berbayar",
			price: "Rp 149.000",
			buyers: 27,
			status: "Published"
		},
		{
			id: 3,
			name: "Kelas React untuk Pemula",
			duration: "6 Jam",
			type: "Gratis",
			price: "Rp 0",
			buyers: 27,
			status: "Published"
		},
		{
			id: 4,
			name: "Bootcamp Laravel 7 Hari",
			duration: "6 Jam",
			type: "Berbayar",
			price: "Rp 149.000",
			buyers: 27,
			status: "Unpublished"
		},
		{
			id: 5,
			name: "Kelas React untuk Pemula",
			duration: "6 Jam",
			type: "Gratis",
			price: "Rp 0",
			buyers: 27,
			status: "Selesai"
		},
		{
			id: 6,
			name: "Bootcamp Laravel 7 Hari",
			duration: "6 Jam",
			type: "Berbayar",
			price: "Rp 149.000",
			buyers: 27,
			status: "Unpublished"
		},
	];

	const getStatusColor = (status: string) => {
		switch (status) {
			case "Selesai": return "bg-green-100 text-green-600 border border-green-200";
			case "Published": return "bg-amber-100 text-amber-600 border border-amber-200";
			case "Unpublished": return "bg-slate-200 text-slate-600 border border-slate-300";
			default: return "bg-slate-100 text-slate-600";
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-bold text-blue-600">Daftar Kelas</h1>
				<p className="text-slate-500 mt-1 text-sm">
					Pantau dan kelola semua kelas yang kamu buat.
				</p>
			</div>

			{/* Toolbar */}
			<div className="flex flex-col md:flex-row justify-between gap-4">
				{/* Search */}
				<div className="relative w-full md:w-96">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
					<input
						type="text"
						placeholder="Cari berdasarkan Nama Kelas"
						className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
					/>
				</div>

				{/* Actions */}
				<div className="flex gap-3">
					<button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white hover:bg-slate-50">
						<span>Tipe: Semua</span>
						<ChevronDown className="w-4 h-4" />
					</button>
					<button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white hover:bg-slate-50">
						<span>Status: Semua</span>
						<ChevronDown className="w-4 h-4" />
					</button>
					<button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm shadow-blue-200">
						<span>Tambah Kelas</span>
						<Plus className="w-4 h-4" />
					</button>
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
							<th className="px-6 py-4">Durasi</th>
							<th className="px-6 py-4">Tipe</th>
							<th className="px-6 py-4">Harga</th>
							<th className="px-6 py-4">Pembeli</th>
							<th className="px-6 py-4">Status</th>
							<th className="px-6 py-4 text-center">Action</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100">
						{classes.map((item) => (
							<tr key={item.id} className="hover:bg-slate-50 transition-colors">
								<td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
								<td className="px-6 py-4 text-slate-600">{item.duration}</td>
								<td className="px-6 py-4 text-slate-600">{item.type}</td>
								<td className="px-6 py-4 font-medium text-slate-800">{item.price}</td>
								<td className="px-6 py-4">
									<div className="flex items-center gap-2">
										<span className="font-medium text-slate-800">{item.buyers}</span>
										<button className="text-[10px] px-2 py-0.5 rounded-full border border-blue-200 text-blue-600 hover:bg-blue-50">Lihat</button>
									</div>
								</td>
								<td className="px-6 py-4">
									<span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
										{item.status}
									</span>
								</td>
								<td className="px-6 py-4">
									<div className="flex justify-center gap-3">
										<button className="text-blue-500 hover:text-blue-700 transition-colors">
											<Eye className="w-5 h-5" />
										</button>
										<button className="text-rose-400 hover:text-rose-600 transition-colors">
											<Trash2 className="w-5 h-5" />
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
