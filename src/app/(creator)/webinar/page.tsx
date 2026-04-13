"use client";

import Link from "next/link";
import {
    Search,
    ChevronDown,
    Plus,
    Eye,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Loader2,
} from "lucide-react";

import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useState } from "react";

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

export default function WebinarPage() {
    const utils = api.useUtils();

    const { data: webinars, isLoading } = api.products.getAll.useQuery({ type: "WEBINAR" });

    const [deleteId, setDeleteId] = useState<string | null>(null);

    const deleteWebinar = api.products.delete.useMutation({
        onSuccess: () => {
            void utils.products.getAll.invalidate();
            toast.success("Webinar berhasil dihapus");
            setDeleteId(null);
        },
        onError: (error) => {
            toast.error(`Gagal menghapus webinar: ${error.message}`);
            setDeleteId(null);
        },
    });

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "selesai": return "bg-green-100 text-green-600 border border-green-200";
            case "published": return "bg-amber-100 text-amber-600 border border-amber-200";
            case "draft": return "bg-slate-200 text-slate-600 border border-slate-300";
            case "archived": return "bg-slate-200 text-slate-600 border border-slate-300";
            default: return "bg-slate-100 text-slate-600";
        }
    };

    const webinarToDelete = webinars?.find((w) => w.id === deleteId);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-blue-600">Daftar Webinar</h1>
                <p className="text-slate-500 mt-1 text-sm">
                    Pantau dan kelola semua webinar yang kamu buat.
                </p>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
                {/* Search */}
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Cari berdasarkan Nama Webinar"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white hover:bg-slate-50">
                        <span>Tipe: Semua</span>
                        <ChevronDown className="w-4 h-4" />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white hover:bg-slate-50">
                        <span>Status: Semua</span>
                        <ChevronDown className="w-4 h-4" />
                    </button>
                    <Link href="/webinar/create" className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm shadow-blue-200">
                        <span>Tambah Webinar</span>
                        <Plus className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 ">
                <table className="w-full text-sm text-left">
                    <thead className="bg-[#EBF5FF] text-slate-700 font-bold border-b border-blue-100">
                        <tr>
                            <th className="px-6 py-4 flex items-center gap-1 cursor-pointer hover:text-blue-600">
                                Nama
                                <div className="flex flex-col">
                                    <ChevronDown className="w-3 h-3 rotate-180 -mb-1" />
                                    <ChevronDown className="w-3 h-3" />
                                </div>
                            </th>
                            <th className="px-6 py-4">Waktu</th>
                            <th className="px-6 py-4">Tipe</th>
                            <th className="px-6 py-4">Harga</th>
                            <th className="px-6 py-4">Pembeli</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={7} className="text-center py-12 text-slate-500">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-400" />
                                    Memuat data...
                                </td>
                            </tr>
                        ) : webinars?.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-12 text-slate-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-4xl">📭</span>
                                        <span>Belum ada webinar.</span>
                                        <Link href="/webinar/create" className="text-blue-500 hover:underline text-sm">
                                            Tambah webinar pertamamu →
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            webinars?.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-800">
                                        <Link href={`/webinar/${item.id}`} className="hover:text-blue-600 hover:underline">
                                            {item.name}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-700">
                                            {item.startDate ? format(new Date(item.startDate), "d MMMM yyyy", { locale: idLocale }) : "-"}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            {item.startDate ? format(new Date(item.startDate), "HH:mm") : ""}
                                            {item.startDate && item.endDate ? " - " : ""}
                                            {item.endDate ? format(new Date(item.endDate), "HH:mm") : ""}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {Number(item.price) === 0 ? "Gratis" : "Berbayar"}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-800">
                                        {Number(item.price) === 0 ? "Rp 0" : `Rp ${Number(item.price).toLocaleString("id-ID")}`}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-800">0</span>
                                            <button className="text-[10px] px-2 py-0.5 rounded-full border border-blue-200 text-blue-600 hover:bg-blue-50">Lihat</button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`px-3 py-1 rounded-full text-xs font-semibold w-fit ${getStatusColor(item.status || "draft")}`}>
                                            {item.status || "Draft"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-3">
                                            {/* View / Edit */}
                                            <Link
                                                href={`/webinar/edit/${item.id}`}
                                                className="text-blue-500 hover:text-blue-700 transition-colors"
                                                title="Lihat Detail"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </Link>
                                            {/* Delete */}
                                            <button
                                                onClick={() => setDeleteId(item.id)}
                                                className="text-rose-400 hover:text-rose-600 transition-colors"
                                                title="Hapus Webinar"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-sm text-slate-500 pt-2">
                <div className="flex items-center gap-3">
                    <button className="flex items-center justify-between px-3 py-2 border border-slate-200 rounded-lg bg-white w-16">
                        7 <ChevronDown className="w-3 h-3" />
                    </button>
                    <span className="text-slate-400">Hasil: {webinars?.length ?? 0} webinar</span>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg font-medium shadow-sm shadow-blue-200">1</button>
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Webinar?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Kamu yakin ingin menghapus webinar{" "}
                            <span className="font-semibold text-slate-800">&quot;{webinarToDelete?.name}&quot;</span>?
                            <br />
                            Tindakan ini tidak bisa dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-rose-600 hover:bg-rose-700 text-white"
                            onClick={() => {
                                if (deleteId) deleteWebinar.mutate({ id: deleteId });
                            }}
                            disabled={deleteWebinar.isPending}
                        >
                            {deleteWebinar.isPending ? (
                                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Menghapus...</>
                            ) : "Ya, Hapus"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
