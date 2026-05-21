"use client";

import React from "react";
import SearchInput from "~/components/ui/search";
import ButtonFilter from "~/components/ui/filter";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
} from "~/components/ui/dropdown-menu";

type ProductToolbarProps = {
	search: string;
	onSearchChange: (val: string) => void;
	typeFilter: string;
	onTypeFilterChange: (val: string) => void;
	statusFilter: string;
	onStatusFilterChange: (val: string) => void;
};

const getTypeLabel = (type: string) => {
	switch (type) {
		case "WEBINAR": return "Webinar";
		case "DIGITAL_PRODUCT": return "Produk Digital";
		case "KELAS_ONLINE": return "Kelas Online";
		default: return "Semua";
	}
};

const getStatusLabel = (status: string) => {
	switch (status) {
		case "published": return "Published";
		case "unpublished": return "Unpublished";
		case "selesai": return "Selesai";
		default: return "Semua";
	}
};

export const ProductToolbar: React.FC<ProductToolbarProps> = ({
	search,
	onSearchChange,
	typeFilter,
	onTypeFilterChange,
	statusFilter,
	onStatusFilterChange,
}) => {
	return (
		<div className="flex flex-col md:flex-row justify-between gap-4">
			<SearchInput
				value={search}
				onChange={(e) => onSearchChange(e.target.value)}
				placeholder="Cari Nama Produk atau Kreator"
			/>

			<div className="flex gap-3">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<ButtonFilter label={`Jenis: ${typeFilter === "ALL" ? "Semua" : getTypeLabel(typeFilter)}`} />
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-[180px]">
						<DropdownMenuRadioGroup value={typeFilter} onValueChange={onTypeFilterChange}>
							<DropdownMenuRadioItem value="ALL">Semua Jenis</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="WEBINAR">Webinar</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="DIGITAL_PRODUCT">Produk Digital</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="KELAS_ONLINE">Kelas Online</DropdownMenuRadioItem>
						</DropdownMenuRadioGroup>
					</DropdownMenuContent>
				</DropdownMenu>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<ButtonFilter label={`Status: ${statusFilter === "ALL" ? "Semua" : getStatusLabel(statusFilter)}`} />
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-[160px]">
						<DropdownMenuRadioGroup value={statusFilter} onValueChange={onStatusFilterChange}>
							<DropdownMenuRadioItem value="ALL">Semua Status</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="published">Published</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="unpublished">Unpublished</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="selesai">Selesai</DropdownMenuRadioItem>
						</DropdownMenuRadioGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
};
