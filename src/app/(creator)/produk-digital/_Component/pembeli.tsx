"use client";

import {
    EyeIcon,
    TrashIcon,
} from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import DetailPembeli from "./detail-pembeli";
import { api } from "~/trpc/react";
import {
    Table,
    TableHead,
    TableHeader,
    TableRow,
    TableBody,
    TableCell,
    TablePagination,
} from "~/components/ui/table";
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
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "~/components/ui/alert-dialog";
import { Skeleton } from "~/components/ui/skeleton";
import { toast } from "sonner";

export default function Pembeli({ productId }: { productId: string }) {
    const [view, setView] = useState<"list" | "detail">("list");
    const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    // ✅ delete state
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const utils = api.useUtils();

    const { data, isLoading } = api.purchases.getByProductId.useQuery(
        { productId, page, limit, search: debouncedSearch, status: statusFilter },
        { enabled: !!productId, placeholderData: (prev) => prev }
    );

    const deleteMutation = api.purchases.delete.useMutation({
        onSuccess: () => {
            toast.success("Data berhasil dihapus");
            void utils.purchases.getByProductId.invalidate();
        },
        onError: () => {
            toast.error("Gagal menghapus data");
        },
        onSettled: () => {
            setIsDeleting(false);
            setDeleteId(null);
        },
    });

    const handleDelete = () => {
        if (!deleteId) return;
        setIsDeleting(true);
        deleteMutation.mutate({ id: deleteId });
    };

    const items = data?.items ?? [];
    const total = data?.total ?? 0;
    const totalPages = data?.totalPages ?? 1;

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "completed": return "bg-green-100 text-green-700";
            case "pending": return "bg-yellow-100 text-yellow-600";
            default: return "bg-slate-100 text-slate-600";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status.toLowerCase()) {
            case "completed": return "Sudah Bayar";
            case "pending": return "Pending";
            default: return status;
        }
    };

    if (view === "detail" && selectedPurchaseId) {
        return (
            <DetailPembeli
                purchaseId={selectedPurchaseId}
                onBack={() => {
                    setView("list");
                    setSelectedPurchaseId(null);
                }}
            />
        );
    }

    return (
        <TooltipProvider>
            <div className="bg-white space-y-6 p-6">

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <SearchInput
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari berdasarkan Nama Pembeli"
                    />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <ButtonFilter label={`Status: ${statusFilter === "ALL" ? "Semua" : statusFilter === "completed" ? "Sudah Bayar" : statusFilter === "pending" ? "Pending" : statusFilter}`} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                            <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                                <DropdownMenuRadioItem value="ALL">Semua Status</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="completed">Sudah Bayar</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="pending">Pending</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Table */}
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
                            <TableHead className="text-center">No</TableHead>
                            <TableHead>Nama</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Nomor Hp</TableHead>
                            <TableHead>Tanggal Beli</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-center">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-5 mx-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center">
                                    Belum ada pembeli untuk produk ini.
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item, index) => {
                                const rowNumber = (page - 1) * limit + index + 1;
                                return (
                                    <TableRow key={item.id}>
                                        <TableCell className="text-center">{rowNumber}</TableCell>

                                        <TableCell>
                                            <button
                                                onClick={() => {
                                                    setSelectedPurchaseId(item.id);
                                                    setView("detail");
                                                }}
                                                className="hover:text-cyan-600"
                                            >
                                                {item.buyerName}
                                            </button>
                                        </TableCell>

                                        <TableCell>{item.buyerEmail}</TableCell>
                                        <TableCell>{item.buyerPhone}</TableCell>

                                        <TableCell>
                                            {format(new Date(item.createdAt), "d MMM yyyy", { locale: idLocale })}
                                        </TableCell>

                                        <TableCell>
                                            <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                                                {getStatusLabel(item.status)}
                                            </span>
                                        </TableCell>

                                        <TableCell className="text-center">
                                            <div className="flex justify-center gap-2">

                                                {/* detail */}
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <button onClick={() => {
                                                            setSelectedPurchaseId(item.id);
                                                            setView("detail");
                                                        }}>
                                                            <EyeIcon size={20} />
                                                        </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Detail</TooltipContent>
                                                </Tooltip>

                                                {/* delete */}
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <button onClick={() => setDeleteId(item.id)}>
                                                            <TrashIcon size={20} className="text-red-500" />
                                                        </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Hapus</TooltipContent>
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

            {/* ALERT DELETE */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Data?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Data yang sudah dihapus tidak bisa dikembalikan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            {isDeleting ? "Menghapus..." : "Hapus"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </TooltipProvider>
    );
}