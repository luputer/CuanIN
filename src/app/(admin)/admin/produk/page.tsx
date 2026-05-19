"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
	EyeIcon,
	CaretUpIcon,
	CaretDownIcon,
	UserCircleIcon,
} from "@phosphor-icons/react";

import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
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
import { TableSkeleton } from "~/components/layout/table-skeleton";
import SearchInput from "~/components/ui/search";
import ButtonFilter from "~/components/ui/filter";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "~/components/ui/tooltip";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
} from "~/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

export default function AdminProductsPage() {
	const router = useRouter();

	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [sortBy, setSortBy] = useState<"name" | "createdAt">("createdAt");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

	const [typeFilter, setTypeFilter] = useState<string>("ALL");
	const [statusFilter, setStatusFilter] = useState<string>("ALL");

	// Debounce search
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(search);
			setPage(1);
		}, 500);
		return () => clearTimeout(timer);
	}, [search]);

	const { data, isLoading } = api.products.adminGetAll.useQuery({
		page,
		limit,
		search: debouncedSearch || undefined,
		sortBy,
		sortOrder,
		type: typeFilter === "ALL" ? undefined : typeFilter as any,
		status: statusFilter,
	}, {
		placeholderData: (prev) => prev,
	});

	const products = data?.items;
	const total = data?.total ?? 0;
	const totalPages = data?.totalPages ?? 1;

	const getStatusColor = (status: string) => {
		const s = status.toLowerCase();
		switch (s) {
			case "published": return "bg-green-100 text-green-700";
			case "unpublished": return "bg-slate-200 text-slate-500";
			case "selesai":
			case "archived": return "bg-blue-100 text-blue-700";
			default: return "bg-slate-100 text-slate-600";
		}
	};

	const getStatusLabel = (status: string) => {
		const s = status.toLowerCase();
		switch (s) {
			case "selesai":
			case "archived": return "Selesai";
			case "published": return "Published";
			case "unpublished": return "Unpublished";
			default: return status;
		}
	};

	const getTypeLabel = (type: string) => {
		switch (type) {
			case "WEBINAR": return "Webinar";
			case "DIGITAL_PRODUCT": return "Produk Digital";
			case "KELAS_ONLINE": return "Kelas Online";
			default: return type;
		}
	};

	return (
		<TooltipProvider>
			<div className="space-y-6">
				{/* Header */}
				<div className="bg-slate-50">
					<div className="sticky top-[74px] bg-slate-50 z-40 -mx-4 px-4 mb-2">
						<div className="text-2xl font-bold mb-2 text-cyan-600">Semua Produk</div>
						<div className="text-sm font-regular text-slate-600">Pantau seluruh produk yang dibuat oleh kreator.</div>
					</div>
				</div>

				{/* Toolbar */}
				<div className="flex flex-col md:flex-row justify-between gap-4">
					<SearchInput
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Cari Nama Produk atau Kreator"
					/>

					<div className="flex gap-3">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<ButtonFilter label={`Jenis: ${typeFilter === "ALL" ? "Semua" : getTypeLabel(typeFilter)}`} />
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-[180px]">
								<DropdownMenuRadioGroup value={typeFilter} onValueChange={setTypeFilter}>
									<DropdownMenuRadioItem value="ALL">Semua Jenis</DropdownMenuRadioItem>
									<DropdownMenuRadioItem value="WEBINAR">Webinar</DropdownMenuRadioItem>
									<DropdownMenuRadioItem value="DIGITAL_PRODUCT">Produk Digital</DropdownMenuRadioItem>
									<DropdownMenuRadioItem value="KELAS_ONLINE">Kelas Online</DropdownMenuRadioItem>
								</DropdownMenuRadioGroup>
							</DropdownMenuContent>
						</DropdownMenu>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<ButtonFilter label={`Status: ${statusFilter === "ALL" ? "Semua" : statusFilter === "published" ? "Published" : statusFilter === "unpublished" ? "Unpublished" : statusFilter === "selesai" ? "Selesai" : "Draft"}`} />
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-[160px]">
								<DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
									<DropdownMenuRadioItem value="ALL">Semua Status</DropdownMenuRadioItem>
									<DropdownMenuRadioItem value="published">Published</DropdownMenuRadioItem>
									<DropdownMenuRadioItem value="unpublished">Unpublished</DropdownMenuRadioItem>
									<DropdownMenuRadioItem value="selesai">Selesai</DropdownMenuRadioItem>
								</DropdownMenuRadioGroup>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
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
								<TableHead
									className="w-[25%] cursor-pointer select-none hover:text-slate-900 transition-colors group"
									onClick={() => {
										if (sortBy === "name") {
											setSortOrder(sortOrder === "asc" ? "desc" : "asc");
										} else {
											setSortBy("name");
											setSortOrder("asc");
										}
									}}
								>
									<div className="flex items-center gap-2">
										Nama Produk
										<div className="flex flex-col h-4 justify-center">
											<CaretUpIcon
												weight={sortBy === "name" && sortOrder === "asc" ? "bold" : "regular"}
												className={cn("w-4 h-4 -mb-1", sortBy === "name" && sortOrder === "asc" ? "text-slate-800" : "text-slate-400")}
											/>
											<CaretDownIcon
												weight={sortBy === "name" && sortOrder === "desc" ? "bold" : "regular"}
												className={cn("w-4 h-4", sortBy === "name" && sortOrder === "desc" ? "text-slate-800" : "text-slate-400")}
											/>
										</div>
									</div>
								</TableHead>
								<TableHead className="w-[20%]">Kreator</TableHead>
								<TableHead className="w-[15%]">Jenis</TableHead>
								<TableHead className="w-[10%]">Tipe</TableHead>
								<TableHead className="w-[10%]">Harga</TableHead>
								<TableHead className="w-[10%]">Status</TableHead>
								<TableHead className="text-left w-[5%]">Aksi</TableHead>
							</TableRow>
						</TableHeader>

						<TableBody>
							{isLoading ? (
								Array.from({ length: 5 }).map((_, i) => (
									<TableRow data-type="body" key={i}>
										<TableCell><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
										<TableCell><Skeleton className="h-4 w-32" /></TableCell>
										<TableCell><Skeleton className="h-4 w-48" /></TableCell>
										<TableCell><Skeleton className="h-4 w-20" /></TableCell>
										<TableCell><Skeleton className="h-4 w-16" /></TableCell>
										<TableCell><Skeleton className="h-4 w-20" /></TableCell>
										<TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
										<TableCell><Skeleton className="h-5 w-5" /></TableCell>
									</TableRow>
								))
							) : products?.length === 0 ? (
								<TableRow className="text-center">
									<TableCell colSpan={8} className="py-20 text-slate-500">
										Tidak ada produk yang ditemukan.
									</TableCell>
								</TableRow>
							) : (
								products?.map((item, index) => {
									const priceNum = Number(item.price);
									const rowNumber = (page - 1) * limit + index + 1;

									const isFinished = item.status === "archived" || (item.endDate && new Date() > new Date(item.endDate));
									const currentStatus = isFinished ? "selesai" : (item.status || "unpublished");
									return (
										<TableRow key={item.id} data-type="body">
											<TableCell className="text-center font-medium">{rowNumber}</TableCell>

											<TableCell className="whitespace-nowrap">
												<div className="flex items-center min-h-[48px]">
													{item.name}
												</div>
											</TableCell>

											<TableCell className="whitespace-nowrap">
												<div className="flex items-center gap-3 min-h-[48px]">
													<Avatar>
														<AvatarImage src={item.user.image ?? undefined} alt={item.user.name ?? ""} />
														<AvatarFallback>
															<UserCircleIcon size={24} className="text-slate-400" />
														</AvatarFallback>
													</Avatar>
													<Link href={`/admin/kreator/${item.userId}`} className="hover:text-cyan-600 transition-colors">
														{item.user.name || "-"}
													</Link>
												</div>
											</TableCell>

											<TableCell className="whitespace-nowrap">
												<div className="flex items-center min-h-[48px]">
													{getTypeLabel(item.type)}
												</div>
											</TableCell>

											<TableCell className="whitespace-nowrap">
												<div className="flex items-center min-h-[48px]">
													{priceNum > 0 ? "Berbayar" : "Gratis"}
												</div>
											</TableCell>

											<TableCell className="whitespace-nowrap">
												<div className="flex items-center min-h-[48px]">
													{priceNum === 0 ? "Gratis" : `Rp ${priceNum.toLocaleString("id-ID")}`}
												</div>
											</TableCell>

											<TableCell className="whitespace-nowrap">
												<div className="flex items-center min-h-[48px]">
													<span className={`px-4 py-1 rounded-full ${getStatusColor(currentStatus)}`}>
														{getStatusLabel(currentStatus)}
													</span>
												</div>
											</TableCell>

											<TableCell className="px-6 py-4">
												<div className="flex justify-start items-center">
													<Tooltip>
														<TooltipTrigger asChild>
															<button onClick={() => router.push(`/admin/produk/${item.id}`)}>
																<EyeIcon className="w-[24px] h-[24px] text-cyan-600 cursor-pointer hover:text-cyan-700" />
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
