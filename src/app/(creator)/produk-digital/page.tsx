"use client";

import {
	Search,
	ChevronDown,
	Plus,
	Eye,
	Trash2,
	ChevronLeft,
	ChevronRight,
	Loader2,
	Copy
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "~/components/ui/alert-dialog";
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
import { api } from "~/trpc/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function DigitalProductPage() {
	const utils = api.useUtils();
	const router = useRouter();
	const { data: products, isLoading } = api.products.getAll.useQuery({ type: "DIGITAL_PRODUCT" });

	const [deleteId, setDeleteId] = useState<string | null>(null);

	const deleteProduct = api.products.delete.useMutation({
		onSuccess: () => {
			void utils.products.getAll.invalidate();
			toast.success("Produk Digital berhasil dihapus");
			setDeleteId(null);
		},
		onError: (error) => {
			toast.error(`Gagal menghapus produk: ${error.message}`);
			setDeleteId(null);
		},
	});

	const productToDelete = products?.find((p) => p.id === deleteId);

	const getStatusColor = (status: string) => {
		const s = status.toLowerCase();
		switch (s) {
			case "selesai": return "bg-green-100 text-green-700";
			case "published": return "bg-yellow-100 text-yellow-600";
			case "unpublished": return "bg-slate-200 text-slate-500";
			default: return "bg-slate-100 text-slate-600";
		}
	};

	const getStatusLabel = (status: string) => {
		const s = status.toLowerCase();
		switch (s) {
			case "selesai": return "Selesai";
			case "published": return "Published";
			case "unpublished": return "Unpublished";
			default: return status;
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
						placeholder="Cari berdasarkan Nama Produk"
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
						<span>Tambah Produk</span>
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
							<TableHead className="py-4 px-6 text-slate-700 font-bold whitespace-normal">Thumbnail</TableHead>
							<TableHead className="py-4 px-6 text-slate-700 font-bold whitespace-normal">Tipe</TableHead>
							<TableHead className="py-4 px-6 text-slate-700 font-bold whitespace-normal">Harga</TableHead>
							<TableHead className="py-4 px-6 text-slate-700 font-bold whitespace-normal">Pembeli</TableHead>
							<TableHead className="py-4 px-6 text-slate-700 font-bold whitespace-normal">Status</TableHead>
							<TableHead className="py-4 px-6 text-slate-700 font-bold text-center whitespace-normal">Aksi</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody className="divide-y divide-slate-100">
						{isLoading ? (
							<TableRow>
								<TableCell colSpan={7} className="py-10 text-center text-slate-500">
									Memuat data...
								</TableCell>
							</TableRow>
						) : products?.length === 0 ? (
							<TableRow>
								<TableCell colSpan={7} className="py-10 text-center text-slate-500">
									Belum ada produk digital.
								</TableCell>
							</TableRow>
						) : (
							products?.map((item) => {
								const priceNum = Number(item.price);
								return (
									<TableRow key={item.id} className="hover:bg-slate-50 transition-colors group">
										<TableCell className="py-4 px-6 text-slate-600 font-medium hover:underline cursor-pointer ">
											<Link href={`/produk-digital/${item.id}`}>
												{item.name}
											</Link>
										</TableCell>
										<TableCell className="py-4 px-6 whitespace-normal">
											<div className="w-12 h-12 bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
												{item.image ? (
													<Image
														src={item.image}
														alt={item.name}
														width={48}
														height={48}
														unoptimized
														className="w-full h-full object-cover"
													/>
												) : (
													<div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 italic">
														No image
													</div>
												)}
											</div>
										</TableCell>
										<TableCell className="py-4 px-6 text-slate-600">
											{priceNum > 0 ? "Berbayar" : "Gratis"}
										</TableCell>
										<TableCell className="py-4 px-6 text-slate-600 font-medium">
											{priceNum === 0 ? "Rp 0" : `Rp ${priceNum.toLocaleString("id-ID")}`}
										</TableCell>
										<TableCell className="py-4 px-6">
											<div className="flex items-center gap-2">
												<span className="text-slate-600">27</span>
												<button className="px-3 py-1 text-xs font-medium text-blue-500 border border-blue-400 rounded-md hover:bg-blue-50 transition-colors cursor-pointer">
													Lihat
												</button>
											</div>
										</TableCell>
										<TableCell className="py-4 px-6 whitespace-normal">
											<span className={`px-4 py-1 rounded-full text-[13px] font-medium ${getStatusColor(item.status)}`}>
												{getStatusLabel(item.status)}
											</span>
										</TableCell>
										<TableCell className="py-4 px-6 whitespace-normal">
											<div className="flex justify-center gap-3">
												<button
													onClick={() => router.push(`/produk-digital/${item.id}`)}
													title="Edit Produk"
													className="text-[#00B4D8] cursor-pointer hover:text-[#008ba8] transition-colors">
													<Eye className="w-[18px] h-[18px]" strokeWidth={2} />
												</button>
												<button
													onClick={() => setDeleteId(item.id)}
													className="text-rose-400 cursor-pointer hover:text-rose-600 transition-colors"
													title="Hapus Produk"
												>
													<Trash2 className="w-[18px] h-[18px]" strokeWidth={2} />
												</button>
												<button className="text-amber-400 cursor-pointer hover:text-amber-600 transition-colors" title="Duplikasi Produk">
													<Copy className="w-[18px] h-[18px]" strokeWidth={2} />
												</button>
											</div>
										</TableCell>
									</TableRow>
								);
							})
						)}
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

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Hapus Produk Digital?</AlertDialogTitle>
						<AlertDialogDescription>
							Kamu yakin ingin menghapus produk{" "}
							<span className="font-semibold text-slate-800">&quot;{productToDelete?.name}&quot;</span>?
							<br />
							Tindakan ini tidak bisa dibatalkan.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Batal</AlertDialogCancel>
						<AlertDialogAction
							className="bg-rose-600 hover:bg-rose-700 text-white"
							onClick={() => {
								if (deleteId) deleteProduct.mutate({ id: deleteId });
							}}
							disabled={deleteProduct.isPending}
						>
							{deleteProduct.isPending ? (
								<><Loader2 className="w-4 h-4 animate-spin mr-2" /> Menghapus...</>
							) : "Ya, Hapus"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}