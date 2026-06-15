"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    TrashIcon,
    EyeIcon,
    UserCircleIcon,
} from "@phosphor-icons/react";
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
    SortableTableHead,
} from "~/components/ui/table";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
} from "~/components/ui/tooltip";
import SearchInput from "~/components/ui/search";
import ActionButton from "~/components/shared/button-add";
import DeleteConfirmDialog from "~/components/shared/delete-confirm-dialog";
import { PageHeader } from "~/components/shared/page-header";
import { DataTableToolbar } from "~/components/table/toolbar";
import { DataTableBodySkeleton, DataTableMobileSkeleton } from "~/components/table/skeleton";
import { TableEmptyState, MobileEmptyState } from "~/components/shared/empty-state";

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
                <PageHeader
                    title="Daftar Kreator"
                    description="Pantau dan kelola semua data kreator di platform CuanIN."
                />

                {/* Toolbar */}
                <DataTableToolbar
                    search={
                        <SearchInput
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari Nama, Email atau No. HP"
                            className="w-full"
                        />
                    }
                    actions={
                        <ActionButton
                            href="/admin/kreator/create"
                            label="Tambah Kreator"
                            responsive
                        />
                    }
                />

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
                                <SortableTableHead
                                    className="w-[35%]"
                                    label="Nama Kreator"
                                    field="name"
                                    currentSortBy={sortBy}
                                    currentSortOrder={sortOrder}
                                    onSort={handleSort}
                                />
                                <SortableTableHead
                                    className="w-[30%]"
                                    label="Email"
                                    field="email"
                                    currentSortBy={sortBy}
                                    currentSortOrder={sortOrder}
                                    onSort={handleSort}
                                />
                                <TableHead className="w-[15%]">Nomor Hp</TableHead>
                                <TableHead className="w-[15%] text-center">Total Produk</TableHead>
                                <TableHead className="text-left w-[10%]">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {isLoading ? (
                                <DataTableBodySkeleton columns={6} rows={5} />
                            ) : creators?.length === 0 ? (
                                <TableEmptyState
                                    colSpan={6}
                                    title={debouncedSearch ? "Hasil pencarian tidak ditemukan." : "Belum ada kreator yang terdaftar."}
                                    action={
                                        !debouncedSearch ? (
                                            <Link href="/admin/kreator/create" className="text-cyan-600 font-medium hover:underline">
                                                Daftarkan kreator pertama!
                                            </Link>
                                        ) : undefined
                                    }
                                />
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
                        <DataTableMobileSkeleton rows={3} />
                    ) : creators?.length === 0 ? (
                        <MobileEmptyState
                            title={debouncedSearch ? "Hasil pencarian tidak ditemukan." : "Belum ada kreator yang terdaftar."}
                            action={
                                !debouncedSearch ? (
                                    <Link href="/admin/kreator/create" className="text-cyan-600 font-medium hover:underline mt-1 inline-block">
                                        Daftarkan kreator pertama!
                                    </Link>
                                ) : undefined
                            }
                        />
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
