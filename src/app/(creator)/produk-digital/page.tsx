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
import { useState, useEffect } from "react";
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
} from "~/components/ui/pagination";
import { Skeleton } from "~/components/ui/skeleton";
import Link from "next/link";
import { api } from "~/trpc/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function DigitalProductPage() {
	const utils = api.useUtils();
	const router = useRouter();

	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	// Debounce search
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(search);
			setPage(1); // Reset to page 1 on search
		}, 500);
		return () => clearTimeout(timer);
	}, [search]);

	const { data, isLoading } = api.products.getAll.useQuery({
		type: "DIGITAL_PRODUCT",
		page,
		limit,
		search: debouncedSearch
	});

	const products = data?.items;
	const total = data?.total ?? 0;
	const totalPages = data?.totalPages ?? 1;

	// Fetch buyer counts for all products
	const productIds = products?.map(p => p.id) ?? [];
	const { data: buyerCounts } = api.purchases.countByProductIds.useQuery(
		{ productIds },
		{ enabled: productIds.length > 0 }
	);

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

	const { data: catalog } = api.catalog.getMine.useQuery();
	const handleCopyLink = (itemId: string, itemSlug: string | null) => {
		if (!catalog?.slug) {
			toast.error("Gagal menyalin link: Catalog belum siap");
			return;
		}
		const host = window.location.origin;
		const productSlug = itemSlug ?? itemId;
		const publicUrl = `${host}/${catalog.slug}/${productSlug}`;
		void navigator.clipboard.writeText(publicUrl);
		toast.success("Link produk disalin!");
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
						value={search}
						onChange={(e) => setSearch(e.target.value)}
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
							Array.from({ length: 5 }).map((_, i) => (
								<TableRow key={i}>
									<TableCell className="py-4 px-6"><Skeleton className="h-4 w-32" /></TableCell>
									<TableCell className="py-4 px-6"><Skeleton className="h-12 w-12" /></TableCell>
									<TableCell className="py-4 px-6"><Skeleton className="h-4 w-16" /></TableCell>
									<TableCell className="py-4 px-6"><Skeleton className="h-4 w-20" /></TableCell>
									<TableCell className="py-4 px-6"><Skeleton className="h-4 w-12" /></TableCell>
									<TableCell className="py-4 px-6"><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
									<TableCell className="py-4 px-6"><div className="flex justify-center gap-3"><Skeleton className="h-5 w-5" /><Skeleton className="h-5 w-5" /><Skeleton className="h-5 w-5" /></div></TableCell>
								</TableRow>
							))
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
												<span className="text-slate-600">{buyerCounts?.[item.id] ?? 0}</span>
												<button
													onClick={() => router.push(`/produk-digital/${item.id}?tab=user`)}
													className="px-3 py-1 text-xs font-medium text-blue-500 border border-blue-400 rounded-md hover:bg-blue-50 transition-colors cursor-pointer"
												>
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
												<button
													onClick={() => handleCopyLink(item.id, item.slug ?? null)}
													className="text-amber-400 cursor-pointer hover:text-amber-600 transition-colors"
													title="Salin Link Produk"
												>
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
													onClick={() => setPage(p)}
													className={`h-7 w-7 rounded-[4px] flex items-center justify-center font-medium text-xs transition-colors ${page === p
															? "bg-[#00B4D8] text-white hover:bg-[#009bc2]"
															: "text-slate-500 hover:bg-slate-100"
														}`}
												>
													{p}
												</button>
											</PaginationItem>
										</div>
									);
								})
							}

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