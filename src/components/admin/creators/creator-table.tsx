"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    TrashIcon,
    EyeIcon,
    UserCircleIcon,
    CaretUpIcon,
    CaretDownIcon,
} from "@phosphor-icons/react";
import { cn } from "~/lib/utils";
import {
    Avatar,
    AvatarImage,
    AvatarFallback,
} from "~/components/ui/avatar";
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

type CreatorItem = {
    id: string;
    name: string | null;
    email: string | null;
    phoneNumber: string | null;
    image: string | null;
    _count: {
        products: number;
    };
};

type CreatorTableProps = {
    creators: CreatorItem[] | undefined;
    isLoading: boolean;
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    onPageChange: (val: number) => void;
    onLimitChange: (val: number) => void;
    sortBy: string;
    sortOrder: string;
    onSort: (field: "name" | "email") => void;
    onDelete: (id: string) => void;
    debouncedSearch: string;
};

export const CreatorTable: React.FC<CreatorTableProps> = ({
    creators,
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
    onDelete,
    debouncedSearch,
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
                        className="w-[35%] cursor-pointer select-none hover:text-slate-900 transition-colors group"
                        onClick={() => onSort("name")}
                    >
                        <div className="flex items-center gap-2">
                            Nama Kreator
                            <div className="flex flex-col h-4 justify-center">
                                <CaretUpIcon
                                    weight={sortBy === "name" && sortOrder === "asc" ? "bold" : "regular"}
                                    className={cn("size-4 -mb-1", sortBy === "name" && sortOrder === "asc" ? "text-slate-800" : "text-slate-400 group-hover:text-slate-400")}
                                />
                                <CaretDownIcon
                                    weight={sortBy === "name" && sortOrder === "desc" ? "bold" : "regular"}
                                    className={cn("size-4 ", sortBy === "name" && sortOrder === "desc" ? "text-slate-800" : "text-slate-400 group-hover:text-slate-400")}
                                />
                            </div>
                        </div>
                    </TableHead>
                    <TableHead
                        className="w-[30%] cursor-pointer select-none hover:text-slate-900 transition-colors group"
                        onClick={() => onSort("email")}
                    >
                        <div className="flex items-center gap-2">
                            Email
                            <div className="flex flex-col h-4 justify-center">
                                <CaretUpIcon
                                    weight={sortBy === "email" && sortOrder === "asc" ? "bold" : "regular"}
                                    className={cn("size-4 -mb-1", sortBy === "email" && sortOrder === "asc" ? "text-slate-800" : "text-slate-400 group-hover:text-slate-400")}
                                />
                                <CaretDownIcon
                                    weight={sortBy === "email" && sortOrder === "desc" ? "bold" : "regular"}
                                    className={cn("size-4 ", sortBy === "email" && sortOrder === "desc" ? "text-slate-800" : "text-slate-400 group-hover:text-slate-400")}
                                />
                            </div>
                        </div>
                    </TableHead>
                    <TableHead className="w-[15%]">Nomor Hp</TableHead>
                    <TableHead className="w-[15%] text-center">Total Produk</TableHead>
                    <TableHead className="text-left w-[10%]">Aksi</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <TableRow data-type="body" key={i}>
                            <TableCell><Skeleton className="size-4 mx-auto" /></TableCell>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Skeleton className="size-10 rounded-full" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            </TableCell>
                            <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                            <TableCell>
                                <div className="flex justify-start gap-3">
                                    <Skeleton className="size-5" />
                                    <Skeleton className="size-5" />
                                </div>
                            </TableCell>
                        </TableRow>
                    ))
                ) : creators?.length === 0 ? (
                    <TableRow className="text-center">
                        <TableCell colSpan={6} className="py-20">
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-slate-500">
                                    {debouncedSearch ? "Hasil pencarian tidak ditemukan." : "Belum ada kreator yang terdaftar."}
                                </span>
                                {!debouncedSearch && (
                                    <Link href="/admin/kreator/create" className="text-cyan-600 font-medium hover:underline">
                                        Daftarkan kreator pertama!
                                    </Link>
                                )}
                            </div>
                        </TableCell>
                    </TableRow>
                ) : (
                    creators?.map((item, index) => {
                        const rowNumber = (page - 1) * limit + index + 1;
                        return (
                            <TableRow key={item.id} data-type="body">
                                <TableCell className="text-center font-medium">
                                    {rowNumber}
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                    <div className="flex items-center gap-3 min-h-[48px]">
                                        <Avatar>
                                            <AvatarImage src={item.image ?? undefined} alt={item.name ?? ""} />
                                            <AvatarFallback>
                                                <UserCircleIcon size={24} className="text-slate-400" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <Link href={`/admin/kreator/${item.id}`} className="hover:text-cyan-600 transition-colors">
                                            {item.name || "-"}
                                        </Link>
                                    </div>
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                    <div className="flex items-center min-h-[48px] text-slate-600">
                                        {item.email || "-"}
                                    </div>
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                    <div className="flex items-center min-h-[48px] text-slate-600">
                                        {item.phoneNumber || "-"}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className="inline-flex items-center justify-center min-w-[2rem] text-cyan-700 text-sm font-semibold">
                                        {item._count.products}
                                    </span>
                                </TableCell>
                                <TableCell className="px-6 py-4 text-right">
                                    <div className="flex justify-start items-center gap-3">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button type="button" onClick={() => router.push(`/admin/kreator/${item.id}`)}>
                                                    <EyeIcon className="w-[24px] h-[24px] text-cyan-600 cursor-pointer hover:text-cyan-700" />
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent>Lihat Detail</TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button type="button" onClick={() => onDelete(item.id)}>
                                                    <TrashIcon className="w-[24px] h-[24px] text-red-600 cursor-pointer hover:text-red-700" />
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent>Hapus Kreator</TooltipContent>
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
