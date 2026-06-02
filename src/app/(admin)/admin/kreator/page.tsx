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
import { useAdminCreators } from "~/hooks/admin/use-admin-creators";

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
    TooltipProvider,
} from "~/components/ui/tooltip";
import SearchInput from "~/components/ui/search";
import ActionButton from "~/components/ui/button-add";
import DeleteConfirmDialog from "~/components/ui/delete-confirm-dialog";

export default function AdminCreatorsPage() {
    const router = useRouter();
    const {
        search,
        page,
        limit,
        sortBy,
        sortOrder,
        deleteId,
        setSearch,
        setPage,
        setLimit,
        setDeleteId,
        handleSort,
        creators,
        total,
        totalPages,
        isLoading,
        creatorToDelete,
        deleteCreator,
        debouncedSearch,
    } = useAdminCreators();

    return (
        <TooltipProvider>
            <div className="w-full max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-slate-50">
                    <div className="sticky top-[74px] bg-slate-50 z-40 -mx-4 sm:-mx-6 px-4 sm:px-6 mb-2">
                        <div className="text-2xl font-bold mb-2 text-cyan-600">Daftar Kreator</div>
                        <div className="text-sm font-regular text-slate-600">Pantau dan kelola semua data kreator di platform CuanIN.</div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <SearchInput
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari Nama, Email atau No. HP"
                        className="w-full sm:flex-1 min-w-[280px]"
                    />
                    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                        <ActionButton
                            href="/admin/kreator/create"
                            label="Tambah Kreator"
                            responsive
                        />
                    </div>
                </div>

                {/* Table (Desktop/Tablet) */}
                <div className="hidden sm:block w-full pb-2">
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
                                    className="w-[35%] cursor-pointer select-none hover:text-slate-900 transition-colors group"
                                    onClick={() => handleSort("name")}
                                >
                                    <div className="flex items-center gap-2">
                                        Nama Kreator
                                        <div className="flex flex-col h-4 justify-center">
                                            <CaretUpIcon
                                                weight={sortBy === "name" && sortOrder === "asc" ? "bold" : "regular"}
                                                className={cn("w-4 h-4 -mb-1", sortBy === "name" && sortOrder === "asc" ? "text-slate-800" : "text-slate-400 group-hover:text-slate-400")}
                                            />
                                            <CaretDownIcon
                                                weight={sortBy === "name" && sortOrder === "desc" ? "bold" : "regular"}
                                                className={cn("w-4 h-4", sortBy === "name" && sortOrder === "desc" ? "text-slate-800" : "text-slate-400 group-hover:text-slate-400")}
                                            />
                                        </div>
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="w-[30%] cursor-pointer select-none hover:text-slate-900 transition-colors group"
                                    onClick={() => handleSort("email")}
                                >
                                    <div className="flex items-center gap-2">
                                        Email
                                        <div className="flex flex-col h-4 justify-center">
                                            <CaretUpIcon
                                                weight={sortBy === "email" && sortOrder === "asc" ? "bold" : "regular"}
                                                className={cn("w-4 h-4 -mb-1", sortBy === "email" && sortOrder === "asc" ? "text-slate-800" : "text-slate-400 group-hover:text-slate-400")}
                                            />
                                            <CaretDownIcon
                                                weight={sortBy === "email" && sortOrder === "desc" ? "bold" : "regular"}
                                                className={cn("w-4 h-4", sortBy === "email" && sortOrder === "desc" ? "text-slate-800" : "text-slate-400 group-hover:text-slate-400")}
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
                                        <TableCell className="text-center font-medium whitespace-nowrap">
                                            <div className="flex items-center justify-center min-h-[48px]">
                                                <Skeleton className="h-4 w-4" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            <div className="flex items-center gap-3 min-h-[48px]">
                                                <Skeleton className="h-10 w-10 rounded-full" />
                                                <Skeleton className="h-4 w-32" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            <div className="flex items-center min-h-[48px]">
                                                <Skeleton className="h-4 w-40" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            <div className="flex items-center min-h-[48px]">
                                                <Skeleton className="h-4 w-24" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            <div className="flex items-center justify-center min-h-[48px]">
                                                <Skeleton className="h-4 w-8" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-right">
                                            <div className="flex justify-start items-center gap-3">
                                                <Skeleton className="w-[22px] h-[22px]" />
                                                <Skeleton className="w-[22px] h-[22px]" />
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
                                creators?.map((item: any, index: number) => {
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
                                                            <button onClick={() => router.push(`/admin/kreator/${item.id}`)}>
                                                                <EyeIcon className="w-[22px] h-[22px] text-cyan-600 cursor-pointer hover:text-cyan-700" />
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Lihat Detail</TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button onClick={() => setDeleteId(item.id)}>
                                                                <TrashIcon className="w-[22px] h-[22px] text-red-600 cursor-pointer hover:text-red-700" />
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
                </div>

                {/* Mobile Cards */}
                <div className="space-y-4 sm:hidden">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-white border border-slate-800 rounded-xl p-4 space-y-3 animate-pulse">
                                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                    <Skeleton className="h-4 w-8" />
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                </div>
                                <div className="flex gap-3">
                                    <Skeleton className="h-16 w-16 rounded-full shrink-0" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-1/2" />
                                        <Skeleton className="h-3 w-1/3" />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : creators?.length === 0 ? (
                        <div className="text-center py-8 bg-white border border-slate-800 rounded-xl p-4 text-slate-500">
                            {debouncedSearch ? (
                                "Hasil pencarian tidak ditemukan."
                            ) : (
                                <>
                                    <span>Belum ada kreator yang terdaftar.</span>
                                    <br />
                                    <Link href="/admin/kreator/create" className="text-cyan-600 font-medium hover:underline mt-1 inline-block">
                                        Daftarkan kreator pertama!
                                    </Link>
                                </>
                            )}
                        </div>
                    ) : (
                        creators?.map((item: any, index: number) => {
                            const rowNumber = (page - 1) * limit + index + 1;

                            return (
                                <div key={item.id} className="bg-white border border-slate-800 rounded-xl p-4 space-y-3">
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                        <span className="text-xs font-semibold text-slate-400"># {rowNumber}</span>
                                        <span className="px-3 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-700">
                                            {item._count.products} Produk
                                        </span>
                                    </div>

                                    <div className="flex gap-3 items-start">
                                        <Avatar className="w-16 h-16 shrink-0">
                                            <AvatarImage src={item.image ?? undefined} alt={item.name ?? ""} />
                                            <AvatarFallback>
                                                <UserCircleIcon size={32} className="text-slate-400" />
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="space-y-1.5 flex-1 min-w-0">
                                            <Link href={`/admin/kreator/${item.id}`} className="font-semibold text-slate-800 hover:text-cyan-600 break-words line-clamp-2">
                                                {item.name || "-"}
                                            </Link>

                                            <div className="text-xs text-slate-500">
                                                <span className="font-medium text-slate-400">Email: </span>
                                                {item.email || "-"}
                                            </div>

                                            <div className="text-xs text-slate-500">
                                                <span className="font-medium text-slate-400">No. HP: </span>
                                                {item.phoneNumber || "-"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 gap-2">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => router.push(`/admin/kreator/${item.id}`)}
                                                className="p-2 rounded-lg text-cyan-600 border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                                                title="Lihat Detail"
                                            >
                                                <EyeIcon className="w-5 h-5" />
                                            </button>

                                            <button
                                                onClick={() => setDeleteId(item.id)}
                                                className="p-2 rounded-lg text-red-600 border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                                                title="Hapus Kreator"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {creators && creators.length > 0 && (
                        <div className="bg-white border border-slate-800 rounded-xl p-4 shadow-[1.5px_1.5px_0px_rgba(29,41,61)]">
                            <TablePagination
                                page={page}
                                totalPages={totalPages}
                                limit={limit}
                                total={total}
                                onPageChange={setPage}
                                onLimitChange={setLimit}
                            />
                        </div>
                    )}
                </div>

                {/* Delete Dialog */}
                <DeleteConfirmDialog
                    open={!!deleteId}
                    onOpenChange={(open) => !open && setDeleteId(null)}
                    title="Hapus Kreator?"
                    itemName={`kreator ${creatorToDelete?.name || ""}`.trim()}
                    loading={deleteCreator.isPending}
                    onConfirm={() => {
                        if (deleteId) deleteCreator.mutate({ id: deleteId });
                    }}
                />
            </div>
        </TooltipProvider>
    );
}
