"use client";

import {
    EyeIcon,
    FileXls,
    CircleNotch,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import ExcelJS from "exceljs";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { cn } from "~/lib/utils";
import DetailPembeli from "./detail";
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
import ButtonFilter from "~/components/shared/filter";
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
import { Skeleton } from "~/components/ui/skeleton";

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

export default function Pembeli({ productId }: { productId: string }) {
    const utils = api.useUtils();
    const [view, setView] = useState<"list" | "detail">("list");
    const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data, isLoading } = api.purchases.getByProductId.useQuery(
        { productId, page, limit, search: debouncedSearch, status: statusFilter },
        { enabled: !!productId, placeholderData: (prev) => prev }
    );

    const items = data?.items ?? [];
    const total = data?.total ?? 0;
    const totalPages = data?.totalPages ?? 1;

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

    const handleExportExcel = async () => {
        try {
            setIsExporting(true);
            const data = await utils.purchases.exportBuyers.fetch({
                productId,
                search: debouncedSearch,
                status: statusFilter
            });

            if (!data || data.items.length === 0) {
                toast.error("Tidak ada data pembeli untuk diekspor");
                return;
            }

            // Create Excel workbook and worksheet
            const formFields = data.formFields || [];
            const headers = ["Nama Pembeli", "Email", "Nomor Hp", ...formFields.map(f => f.label)];

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Data Pembeli");

            // Add Header Row
            const headerRow = worksheet.addRow(headers);
            headerRow.font = { bold: true };
            headerRow.eachCell((cell) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFF3F4F6' } // Light gray background
                };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });

            // Add Data Rows
            for (const item of data.items) {
                const rowData = [
                    item.buyerName,
                    item.buyerEmail,
                    item.buyerPhone || "-",
                    ...formFields.map(field => {
                        return item.answers?.find((a: any) => a.formFieldId === field.id)?.answer || "-";
                    })
                ];
                worksheet.addRow(rowData);
            }

            // Adjust column widths
            worksheet.columns.forEach(column => {
                if (column) column.width = 25;
            });

            // Generate buffer and download
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `Data_Pembeli_${data.productName.replace(/\s+/g, '_')}_${format(new Date(), "yyyyMMdd")}.xlsx`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("Berhasil mengekspor data pembeli");
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Gagal mengekspor data pembeli");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <TooltipProvider>
            <div className="bg-white space-y-6 p-4 sm:p-6">

                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <SearchInput
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari berdasarkan Nama Pembeli"
                        className="w-full sm:flex-1 min-w-[280px]"
                    />

                    <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <ButtonFilter
                                    label={`Status: ${statusFilter === "ALL" ? "Semua" : statusFilter === "completed" ? "Sudah Bayar" : statusFilter === "pending" ? "Pending" : statusFilter}`}
                                    className="w-full sm:w-auto flex-none"
                                />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                                    <DropdownMenuRadioItem value="ALL">Semua Status</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="completed">Sudah Bayar</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="pending">Pending</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <button
                            onClick={handleExportExcel}
                            disabled={isExporting}
                            className={cn(
                                "w-full sm:w-fit h-10 flex items-center justify-center gap-2 whitespace-nowrap",
                                "px-3 sm:px-6 border rounded-lg transition-all duration-200 ease-out",
                                "text-sm font-semibold text-white bg-emerald-500 border-slate-800 shadow-[1.5px_1.5px_0px_#000]",
                                "hover:translate-x-px hover:translate-y-px hover:shadow-none",
                                "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 cursor-pointer"
                            )}
                        >
                            {isExporting ? <CircleNotch className="size-5 animate-spin" /> : <FileXls className="size-5" weight="fill" />}
                            <span className="hidden sm:inline">Export Excel</span>
                            <span className="sm:hidden">Export</span>
                        </button>
                    </div>
                </div>

                {/* Table (Desktop/Tablet) */}
                <div className="hidden sm:block">
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
                                <TableHead className="w-[20%]">Nama</TableHead>
                                <TableHead className="w-[20%]">Email</TableHead>
                                <TableHead className="w-[15%]">Nomor Hp</TableHead>
                                <TableHead className="w-[15%]">Tanggal Beli</TableHead>
                                <TableHead className="w-[15%]">Status</TableHead>
                                <TableHead className="text-left w-[10%]">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow data-type="body" key={i}>
                                        <TableCell className="text-center font-medium whitespace-nowrap">
                                            <div className="flex items-center justify-center min-h-12">
                                                <Skeleton className="size-4" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            <div className="flex items-center min-h-12">
                                                <Skeleton className="h-4 w-32" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            <div className="flex items-center min-h-12">
                                                <Skeleton className="h-4 w-40" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            <div className="flex items-center min-h-12">
                                                <Skeleton className="h-4 w-24" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            <div className="flex items-center min-h-12">
                                                <Skeleton className="h-4 w-28" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            <div className="flex items-center min-h-12">
                                                <Skeleton className="h-[26px] w-[90px] rounded-full" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-right">
                                            <div className="flex items-center gap-3">
                                                <Skeleton className="size-6 rounded-md" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : items.length === 0 ? (
                                <TableRow className="text-center">
                                    <TableCell colSpan={7} className="py-8">
                                        Belum ada pembeli untuk produk ini.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.map((item, index) => {
                                    const rowNumber = (page - 1) * limit + index + 1;
                                    return (
                                        <TableRow key={item.id} data-type="body">
                                            <TableCell className="text-center font-medium whitespace-nowrap">
                                                {rowNumber}
                                            </TableCell>

                                            <TableCell className="whitespace-nowrap">
                                                <button type="button"
                                                    onClick={() => {
                                                        setSelectedPurchaseId(item.id);
                                                        setView("detail");
                                                    }}
                                                    className="hover:text-cuan-cyan transition-colors"
                                                >
                                                    <div className="flex items-center min-h-12">
                                                        {item.buyerName}
                                                    </div>
                                                </button>
                                            </TableCell>

                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex items-center min-h-12">
                                                    {item.buyerEmail}
                                                </div>
                                            </TableCell>

                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex items-center min-h-12">
                                                    {item.buyerPhone}
                                                </div>
                                            </TableCell>

                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex items-center min-h-12">
                                                    {format(new Date(item.createdAt), "d MMM yyyy", { locale: idLocale })}
                                                </div>
                                            </TableCell>

                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex items-center min-h-12">
                                                    <span className={`px-4 py-1 rounded-full text-[13px] font-medium leading-tight ${getStatusColor(item.status)}`}>
                                                        {getStatusLabel(item.status)}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="px-6 py-4 text-right">
                                                <div className="flex items-center gap-3">
                                                    {/* detail */}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button type="button" onClick={() => {
                                                                setSelectedPurchaseId(item.id);
                                                                setView("detail");
                                                            }}>
                                                                <EyeIcon className="size-6 text-cuan-cyan cursor-pointer hover:text-007EA5" />
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Detail</TooltipContent>
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

                {/* Mobile Cards (Only visible on mobile) */}
                <div className="space-y-4 sm:hidden">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-white border border-slate-800 rounded-xl p-4 space-y-3 animate-pulse">
                                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                    <Skeleton className="h-4 w-8" />
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-28" />
                                </div>
                            </div>
                        ))
                    ) : items.length === 0 ? (
                        <div className="text-center py-8 bg-white border border-slate-800 rounded-xl p-4 text-slate-500">
                            Belum ada pembeli untuk produk ini.
                        </div>
                    ) : (
                        items.map((item, index) => {
                            const rowNumber = (page - 1) * limit + index + 1;
                            return (
                                <div key={item.id} className="bg-white border border-slate-800 rounded-xl p-4 space-y-3">
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                        <span className="text-xs font-semibold text-slate-400"># {rowNumber}</span>
                                        <span className={`px-3 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                            {getStatusLabel(item.status)}
                                        </span>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-slate-400 font-medium min-w-[70px]">Nama:</span>
                                            <button type="button"
                                                onClick={() => {
                                                    setSelectedPurchaseId(item.id);
                                                    setView("detail");
                                                }}
                                                className="font-semibold text-cuan-cyan hover:text-007EA5 text-right hover:underline"
                                            >
                                                {item.buyerName}
                                            </button>
                                        </div>
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-slate-400 font-medium min-w-[70px]">Email:</span>
                                            <span className="text-slate-700 text-right break-all">{item.buyerEmail}</span>
                                        </div>
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-slate-400 font-medium min-w-[70px]">No Hp:</span>
                                            <span className="text-slate-700 text-right">{item.buyerPhone || "-"}</span>
                                        </div>
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-slate-400 font-medium min-w-[70px]">Tanggal:</span>
                                            <span className="text-slate-700 text-right">
                                                {format(new Date(item.createdAt), "d MMM yyyy", { locale: idLocale })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-2 border-t border-slate-100">
                                        <button type="button"
                                            onClick={() => {
                                                setSelectedPurchaseId(item.id);
                                                setView("detail");
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cuan-cyan border border-cuan-cyan rounded-md hover:bg-cuan-cyan/10 transition-colors"
                                        >
                                            <EyeIcon className="size-4" />
                                            Detail Pembeli
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {/* Mobile Pagination */}
                    {items.length > 0 && (
                        <div className="bg-white border border-slate-800 rounded-xl p-4 shadow-[0px_1.5px_0px_#000]">
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
            </div>
        </TooltipProvider>
    );
}
