"use client";

import { Eye, Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Loader2, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import DetailPurchase from "./PurchaseDetail";
import { api } from "~/trpc/react";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
} from "~/components/ui/pagination";
import { Skeleton } from "~/components/ui/skeleton";
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

export default function PurchaseList({ 
    productId, 
    label = "Peserta" 
}: { 
    productId: string;
    label?: string;
}) {
    const [view, setView] = useState<"list" | "detail">("list");
    const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data, isLoading } = api.purchases.getByProductId.useQuery(
        { productId, page, limit, search: debouncedSearch },
        { enabled: !!productId }
    );


    const [deleteId, setDeleteId] = useState<string | null>(null);
    const utils = api.useUtils();

    const deletePurchase = api.purchases.delete.useMutation({
        onSuccess: () => {
            void utils.purchases.getByProductId.invalidate({ productId });
            toast.success(`${label} berhasil dihapus`);
            setDeleteId(null);
        },
        onError: (error: { message: string }) => {
            toast.error(`Gagal menghapus data ${label.toLowerCase()}: ${error.message}`);
            setDeleteId(null);
        },
    });

    const purchaseToDelete = data?.items?.find((p) => p.id === deleteId);

    const items = data?.items ?? [];
    const total = data?.total ?? 0;
    const totalPages = data?.totalPages ?? 1;

    if (view === "detail" && selectedPurchaseId) {
        return (
            <DetailPurchase
                purchaseId={selectedPurchaseId}
                onBack={() => {
                    setView("list");
                    setSelectedPurchaseId(null);
                }}
            />
        );
    }

    return (
        <div className="bg-[#f0f9fa] p-4 md:p-6 rounded-b-xl border border-slate-200">
            {/* Search and Filter */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-center mb-6">
                <div className="relative w-full lg:w-[400px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-[18px] h-[18px]" />
                    <input
                        type="text"
                        placeholder="Cari berdasarkan Nama"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-700 rounded-lg text-[15px] text-slate-700 focus:outline-none focus:border-[#00B4D8] bg-white font-medium"
                    />
                </div>
                <div className="relative w-full lg:w-auto">
                    <select className="w-full lg:w-auto appearance-none bg-white border border-slate-700 text-slate-600 text-[15px] rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:border-[#00B4D8] font-medium min-w-[150px]">
                        <option>Status: Semua</option>
                        <option>Status: Sudah Bayar</option>
                        <option>Status: Pending</option>
                        <option>Status: Ditolak</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-[18px] h-[18px] pointer-events-none" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-t-lg border-t border-l border-r border-slate-300 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-[15px] text-left">
                        <thead className="bg-[#f0f9fa]/50 text-slate-700 border-b border-slate-300">
                            <tr>
                                <th className="px-6 py-4 font-bold">
                                    <div className="flex items-center gap-2 cursor-pointer select-none relative w-fit group">
                                        Nama
                                        <div className="flex flex-col opacity-60">
                                            <ChevronUp className="w-[14px] h-[14px] -mb-1.5" strokeWidth={3} />
                                            <ChevronDown className="w-[14px] h-[14px]" strokeWidth={3} />
                                        </div>
                                    </div>
                                </th>
                                <th className="px-6 py-4 font-bold">Email</th>
                                <th className="px-6 py-4 font-bold">Nomor Hp</th>
                                <th className="px-6 py-4 font-bold whitespace-nowrap">Tanggal Join</th>
                                <th className="px-6 py-4 font-bold whitespace-nowrap">Status</th>
                                <th className="px-6 py-4 font-bold text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="border-b border-slate-200">
                                        <td className="px-6 py-5"><Skeleton className="h-4 w-32" /></td>
                                        <td className="px-6 py-5"><Skeleton className="h-4 w-40" /></td>
                                        <td className="px-6 py-5"><Skeleton className="h-4 w-32" /></td>
                                        <td className="px-6 py-5"><Skeleton className="h-4 w-32" /></td>
                                        <td className="px-6 py-5"><Skeleton className="h-6 w-24 rounded-full" /></td>
                                        <td className="px-6 py-5"><div className="flex justify-center"><Skeleton className="h-5 w-5" /></div></td>
                                    </tr>
                                ))
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-10 text-center text-slate-500">
                                        Belum ada {label.toLowerCase()}.
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50 text-slate-600 font-medium">
                                        <td
                                            onClick={() => {
                                                setSelectedPurchaseId(item.id);
                                                setView("detail");
                                            }}
                                            className="px-6 py-5 hover:underline cursor-pointer">
                                            {item.buyerName}
                                        </td>
                                        <td className="px-6 py-5">{item.buyerEmail}</td>
                                        <td className="px-6 py-5">{item.buyerPhone}</td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            {format(new Date(item.createdAt), "d MMMM yyyy HH:mm", { locale: idLocale })}
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.status === "completed"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-yellow-100 text-yellow-700"
                                                }`}>
                                                {item.status === "completed" ? "Sudah Bayar" : "Pending"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => {
                                                        setSelectedPurchaseId(item.id);
                                                        setView("detail");
                                                    }}
                                                    className="text-[#00B4D8] hover:text-[#009bc2] transition-colors p-1"
                                                    title="Lihat Detail"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteId(item.id)}
                                                    className="text-rose-400 cursor-pointer hover:text-rose-600 transition-colors"
                                                    title={`Hapus ${label}`}
                                                >
                                                    <Trash2 className="w-[18px] h-[18px]" strokeWidth={2} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {total > 0 && (
                <div className="bg-white border-b border-l border-r border-[#00B4D8] rounded-b-lg p-5">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-slate-500 w-full">
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
                                <AlertDialogTitle>Hapus Data {label}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Kamu yakin ingin menghapus data partisipan/{label.toLowerCase()} bernama{" "}
                                    <span className="font-semibold text-slate-800">&quot;{purchaseToDelete?.buyerName}&quot;</span>?
                                    <br />
                                    Tindakan ini tidak bisa dibatalkan.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                    className="bg-rose-600 hover:bg-rose-700 text-white"
                                    onClick={() => {
                                        if (deleteId) deletePurchase.mutate({ id: deleteId });
                                    }}
                                    disabled={deletePurchase.isPending}
                                >
                                    {deletePurchase.isPending ? (
                                        <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Menghapus...</>
                                    ) : "Ya, Hapus"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

            )}
        </div>

    );
}
