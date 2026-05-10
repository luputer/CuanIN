"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    TrashIcon,
    EyeIcon,
    UserCircleIcon,
    CaretUpIcon,
    CaretDownIcon,
} from "@phosphor-icons/react";

import { api } from "~/trpc/react";
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
import { TableSkeleton } from "~/components/layout/table-skeleton";
import SearchInput from "~/components/ui/search";
import ActionButton from "~/components/ui/button-add";
import ConfirmDialog from "~/components/ui/confirm-dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "~/components/ui/tooltip";

export default function AdminCreatorsPage() {
    // ─── States & Hooks ──────────────────────────────────────────────────────
    const utils = api.useUtils();
    const router = useRouter();

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [sortBy, setSortBy] = useState<"name" | "email" | "createdAt">("createdAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset to page 1 on search
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data: creators, isLoading } = api.creators.getAll.useQuery();

    const [deleteId, setDeleteId] = useState<string | null>(null);

    const deleteCreator = api.creators.delete.useMutation({
        onSuccess: () => {
            void utils.creators.getAll.invalidate();
            toast.success("Kreator berhasil dihapus");
            setDeleteId(null);
        },
        onError: (error) => {
            toast.error(`Gagal menghapus kreator: ${error.message}`);
            setDeleteId(null);
        },
    });

    const creatorToDelete = creators?.find((c) => c.id === deleteId);

    // Filter creators based on search
    const filteredCreators = creators?.filter((c) =>
    (c.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        c.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        c.phoneNumber?.includes(debouncedSearch))
    );

    const total = filteredCreators?.length ?? 0;
    const totalPages = Math.ceil(total / limit);
    const paginatedCreators = filteredCreators?.slice((page - 1) * limit, page * limit);

    if (isLoading && !creators) {
        return <TableSkeleton columns={5} />;
    }

    return (
        <TooltipProvider>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-slate-50">
                    <div className="sticky top-[74px] bg-slate-50 z-40 -mx-4 px-4 mb-2">
                        <div className="text-2xl font-bold mb-2 text-cyan-600">Daftar Kreator</div>
                        <div className="text-sm font-regular text-slate-600">Pantau dan kelola semua data kreator di platform CuanIN.</div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <SearchInput
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari Nama, Email atau No. HP"
                    />

                    <div className="flex gap-3">
                        <ActionButton
                            href="/admin/kreator/create"
                            label="Tambah Kreator"
                        />
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
                                    className="w-[35%] cursor-pointer select-none hover:text-slate-900 transition-colors group"
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
                                    onClick={() => {
                                        if (sortBy === "email") {
                                            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                                        } else {
                                            setSortBy("email");
                                            setSortOrder("asc");
                                        }
                                    }}
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
                                        <TableCell><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Skeleton className="h-10 w-10 rounded-full" />
                                                <Skeleton className="h-4 w-32" />
                                            </div>
                                        </TableCell>
                                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                                        <TableCell>
                                            <div className="flex justify-start gap-3">
                                                <Skeleton className="h-5 w-5" />
                                                <Skeleton className="h-5 w-5" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : filteredCreators?.length === 0 ? (
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
                                paginatedCreators?.map((item, index) => {
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
                                                                <EyeIcon className="w-[24px] h-[24px] text-cyan-600 cursor-pointer hover:text-cyan-700" />
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Lihat Detail</TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button onClick={() => setDeleteId(item.id)}>
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
                </div>

                <ConfirmDialog
                    open={!!deleteId}
                    onOpenChange={(open) => !open && setDeleteId(null)}
                    icon={<TrashIcon size={52} className="bg-red-100 rounded-full p-3 text-red-500" weight="regular" />}
                    title="Hapus Kreator?"
                    description={
                        <>
                            Kamu yakin ingin menghapus kreator {" "}
                            <span className="font-semibold text-slate-800">&quot;{creatorToDelete?.name}&quot;</span>?
                            <br />
                            Tindakan ini tidak bisa dibatalkan.
                        </>
                    }
                    confirmText="Ya, Hapus"
                    confirmClassName="bg-red-500 hover:bg-red-600 text-white"
                    loading={deleteCreator.isPending}
                    onConfirm={() => {
                        if (deleteId) deleteCreator.mutate({ id: deleteId });
                    }}
                />
            </div>
        </TooltipProvider>
    );
}
