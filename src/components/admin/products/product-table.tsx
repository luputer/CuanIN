"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	EyeIcon,
	CaretUpIcon,
	CaretDownIcon,
	UserCircleIcon,
} from "@phosphor-icons/react";
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
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "~/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

type ProductItem = {
	id: string;
	name: string;
	type: string;
	price: any;
	status: string;
	userId: string;
	endDate: Date | null;
	user: {
		name: string | null;
		image: string | null;
	};
};

type ProductTableProps = {
	products: ProductItem[] | undefined;
	isLoading: boolean;
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	onPageChange: (val: number) => void;
	onLimitChange: (val: number) => void;
	sortBy: string;
	sortOrder: string;
	onSort: (field: "name" | "createdAt") => void;
};

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

export const ProductTable: React.FC<ProductTableProps> = ({
	products,
	isLoading,
	page,
	limit,
	total,
	totalPages,
	onPageChange,
	onLimitChange,
	sortBy,
	sortOrder,
	onSort,
}) => {
	const router = useRouter();

	return (
		<Table
			pagination={
				<TablePagination
					page={page}
					totalPages={totalPages}
					limit={limit}
					total={total}
					onPageChange={onPageChange}
					onLimitChange={onLimitChange}
				/>
			}
		>
			<TableHeader>
				<TableRow>
					<TableHead className="w-[5%] text-center">No</TableHead>
					<TableHead
						className="w-[25%] cursor-pointer select-none hover:text-slate-900 transition-colors group"
						onClick={() => onSort("name")}
					>
						<div className="flex items-center gap-2">
							Nama Produk
							<div className="flex flex-col h-4 justify-center">
								<CaretUpIcon
									weight={sortBy === "name" && sortOrder === "asc" ? "bold" : "regular"}
									className={cn("size-4 -mb-1", sortBy === "name" && sortOrder === "asc" ? "text-slate-800" : "text-slate-400")}
								/>
								<CaretDownIcon
									weight={sortBy === "name" && sortOrder === "desc" ? "bold" : "regular"}
									className={cn("size-4 ", sortBy === "name" && sortOrder === "desc" ? "text-slate-800" : "text-slate-400")}
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
							<TableCell><Skeleton className="size-4 mx-auto" /></TableCell>
							<TableCell><Skeleton className="h-4 w-32" /></TableCell>
							<TableCell><Skeleton className="h-4 w-48" /></TableCell>
							<TableCell><Skeleton className="h-4 w-20" /></TableCell>
							<TableCell><Skeleton className="h-4 w-16" /></TableCell>
							<TableCell><Skeleton className="h-4 w-20" /></TableCell>
							<TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
							<TableCell><Skeleton className="size-5" /></TableCell>
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
												<button type="button" onClick={() => router.push(`/admin/produk/${item.id}`)}>
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
	);
};
