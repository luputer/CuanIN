"use client";

import {
	Search,
	ChevronDown,
	Plus,
	Eye,
	ChevronLeft,
	ChevronRight
} from "lucide-react";
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
	PaginationLink,
} from "~/components/ui/pagination";
import Link from "next/link";

export default function DigitalProductPage() {
	const products = [
		{
			id: 1,
			name: "Webinar UI/UX Dasar",
			creator: "Mason Brooks",
			avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mason Brooks",
			category: "Webinar",
			type: "Gratis",
			price: 0,
			status: "Selesai"
		},
		{
			id: 2,
			name: "Kelas React untuk Pemula",
			creator: "Olivia Bennett",
			avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia Bennett",
			category: "Kelas",
			type: "Berbayar",
			price: 149000,
			status: "Published"
		},
		{
			id: 3,
			name: "Template CV ATS Friendly",
			creator: "Mason Brooks",
			avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mason Brooks",
			category: "Produk Digital",
			type: "Gratis",
			price: 0,
			status: "Published"
		},
		{
			id: 4,
			name: "Webinar UI/UX Dasar",
			creator: "Olivia Bennett",
			avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia Bennett",
			category: "Webinar",
			type: "Berbayar",
			price: 149000,
			status: "Unpublished"
		},
		{
			id: 5,
			name: "Kelas React untuk Pemula",
			creator: "Mason Brooks",
			avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mason Brooks",
			category: "Kelas",
			type: "Gratis",
			price: 0,
			status: "Selesai"
		},
		{
			id: 6,
			name: "Template CV ATS Friendly",
			creator: "Olivia Bennett",
			avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia Bennett",
			category: "Produk Digital",
			type: "Berbayar",
			price: 149000,
			status: "Unpublished"
		},
	];

	const getStatusColor = (status: string) => {
		switch (status) {
			case "Selesai": return "bg-green-100 text-green-700";
			case "Published": return "bg-yellow-100 text-yellow-600";
			case "Unpublished": return "bg-slate-200 text-slate-500";
			default: return "bg-slate-100 text-slate-600";
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-bold text-blue-600">Daftar Produk</h1>
				<p className="text-slate-500 mt-1 text-sm">
					Pantau semua layanan digital yang tersedia di platform.
				</p>
			</div>

			{/* Toolbar */}
			<div className="flex flex-col md:flex-row justify-between gap-4">
				{/* Search */}
				<div className="relative w-full md:w-96">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
					<input
						type="text"
						placeholder="Cari berdasarkan Nama Produk atau Kreator"
						className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
					/>
				</div>

				{/* Actions */}
				<div className="flex gap-3">
					<button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white hover:bg-slate-50">
						<span>Status: Semua</span>
						<ChevronDown className="w-4 h-4" />
					</button>
					<Link
						href="/produk-digital/create"
						className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm shadow-blue-200"
					>
						<span>Tambah Produk Digital</span>
						<Plus className="w-4 h-4" />
					</Link>
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
							<TableHead className="py-4 px-6 text-slate-700 font-bold whitespace-normal">
								<div className="flex items-center gap-2 cursor-pointer hover:text-blue-600">
									Kreator
									<div className="flex flex-col text-slate-400">
										<ChevronDown className="w-3 h-3 rotate-180 -mb-1" />
										<ChevronDown className="w-3 h-3" />
									</div>
								</div>
							</TableHead>
							<TableHead className="py-4 px-6 text-slate-700 font-bold whitespace-normal">Kategori</TableHead>
							<TableHead className="py-4 px-6 text-slate-700 font-bold whitespace-normal">Tipe</TableHead>
							<TableHead className="py-4 px-6 text-slate-700 font-bold whitespace-normal">Harga</TableHead>
							<TableHead className="py-4 px-6 text-slate-700 font-bold whitespace-normal">Status</TableHead>
							<TableHead className="py-4 px-6 text-slate-700 font-bold text-center whitespace-normal">Aksi</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody className="divide-y divide-slate-100">
						{products.map((item) => (
							<TableRow key={item.id} className="hover:bg-slate-50 transition-colors group">
								<TableCell className="py-4 px-6 text-slate-600 whitespace-normal">
									{item.name}
								</TableCell>
								<TableCell className="py-4 px-6 whitespace-normal">
									<div className="flex items-center gap-3">
										<div className="w-7 h-7 rounded-full bg-slate-200 overflow-hidden shrink-0">
											<img
												src={item.avatar}
												alt={item.creator}
												className="w-full h-full object-cover"
											/>
										</div>
										<span className="text-slate-600 text-sm">{item.creator}</span>
									</div>
								</TableCell>
								<TableCell className="py-4 px-6 text-slate-600 whitespace-normal">{item.category}</TableCell>
								<TableCell className="py-4 px-6 text-slate-600 whitespace-normal">{item.type}</TableCell>
								<TableCell className="py-4 px-6 text-slate-600 whitespace-normal">
									{item.price === 0 ? "Rp 0" : `Rp ${item.price.toLocaleString("id-ID")}`}
								</TableCell>
								<TableCell className="py-4 px-6 whitespace-normal">
									<span className={`px-4 py-1 rounded-full text-[13px] font-medium ${getStatusColor(item.status)}`}>
										{item.status}
									</span>
								</TableCell>
								<TableCell className="py-4 px-6 whitespace-normal">
									<div className="flex justify-center">
										<button className="text-[#00B4D8] hover:text-[#008ba8] transition-colors">
											<Eye className="w-[18px] h-[18px]" strokeWidth={2} />
										</button>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			<div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-slate-500 pt-2 w-full">
				<div className="flex items-center gap-3">
					<button className="flex items-center justify-between px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 w-16">
						7 <ChevronDown className="w-3 h-3 text-slate-400" />
					</button>
					<span className="text-slate-500 whitespace-nowrap">Hasil: 1-7 dari 300</span>
				</div>
				<div className="flex items-center">
					<Pagination className="justify-center sm:justify-end">
						<PaginationContent className="gap-1">
							<PaginationItem>
								<a href="#" className="flex items-center justify-center p-2 text-slate-400 hover:text-slate-700">
									<ChevronLeft className="w-4 h-4" />
								</a>
							</PaginationItem>
							<PaginationItem>
								<PaginationLink
									href="#"
									isActive
									className="h-7 w-7 rounded-[4px] bg-[#00B4D8] text-white hover:bg-[#009bc2] hover:text-white border-0 font-medium text-xs"
								>
									1
								</PaginationLink>
							</PaginationItem>
							<PaginationItem>
								<PaginationLink href="#" className="h-7 w-7 rounded-[4px] border-0 text-slate-500 font-medium text-xs hover:bg-slate-100">2</PaginationLink>
							</PaginationItem>
							<PaginationItem>
								<PaginationLink href="#" className="h-7 w-7 rounded-[4px] border-0 text-slate-500 font-medium text-xs hover:bg-slate-100">3</PaginationLink>
							</PaginationItem>
							<PaginationItem>
								<PaginationEllipsis className="mt-1" />
							</PaginationItem>
							<PaginationItem>
								<PaginationLink href="#" className="h-7 px-2 rounded-[4px] border-0 text-slate-500 font-medium text-xs hover:bg-slate-100">100</PaginationLink>
							</PaginationItem>
							<PaginationItem>
								<a href="#" className="flex items-center justify-center p-2 text-slate-400 hover:text-slate-700">
									<ChevronRight className="w-4 h-4" />
								</a>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				</div>
			</div>
		</div>
	);
}