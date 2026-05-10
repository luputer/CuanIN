"use client";

import { useState } from "react";
import { WalletIcon } from "@phosphor-icons/react";
import { Skeleton } from "~/components/ui/skeleton";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "~/components/ui/dropdown-menu";
import ButtonFilter from "~/components/ui/filter";
import SearchInput from "~/components/ui/search";
import {
    Table,
    TableHead,
    TableHeader,
    TableRow,
    TableBody,
    TableCell,
    TablePagination,
} from "~/components/ui/table";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "~/components/ui/tooltip";
import { formatCurrency } from "~/lib/utils";

export default function AdminTransactionPage() {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("ALL");

    // Dummy Data for UI
    const stats = {
        totalIncome: 125400000,
        totalTransactions: 1240,
        balance: 45000000,
        incomeChange: 12.5,
        transactionsChange: 8.2,
    };

    const dummyTransactions = [
        {
            id: "TRX-992834",
            amount: 150000,
            xenditPaymentMethod: "BCA Virtual Account",
            buyerName: "Budi Santoso",
            productName: "Mastering UI/UX Design",
            createdAt: new Date(),
            status: "completed",
        },
        {
            id: "TRX-992835",
            amount: 250000,
            xenditPaymentMethod: "GoPay",
            buyerName: "Siti Aminah",
            productName: "Webinar Bisnis Digital",
            createdAt: new Date(),
            status: "pending",
        },
        {
            id: "TRX-992836",
            amount: 500000,
            xenditPaymentMethod: "ShopeePay",
            buyerName: "Andi Wijaya",
            productName: "Panduan Saham 101",
            createdAt: new Date(),
            status: "failed",
        },
        {
            id: "TRX-992837",
            amount: 120000,
            xenditPaymentMethod: "Mandiri VA",
            buyerName: "Dewi Lestari",
            productName: "Ebook Resep Masakan",
            createdAt: new Date(),
            status: "completed",
        },
        {
            id: "TRX-992838",
            amount: 75000,
            xenditPaymentMethod: "QRIS",
            buyerName: "Rizky Pratama",
            productName: "Preset Lightroom Pro",
            createdAt: new Date(),
            status: "expired",
        },
    ];

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "completed":
                return "bg-green-100 text-green-700";
            case "pending":
                return "bg-yellow-100 text-yellow-700";
            case "failed":
                return "bg-red-100 text-red-700";
            case "expired":
                return "bg-slate-200 text-slate-500";
            default:
                return "bg-slate-100 text-slate-600";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "ALL":
                return "Semua Status";
            case "completed":
                return "Sudah Bayar";
            case "pending":
                return "Menunggu";
            case "failed":
                return "Gagal";
            case "expired":
                return "Kedaluwarsa";
            default:
                return status;
        }
    };

    return (
        <TooltipProvider>
            <div className="space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-cyan-600">Daftar Transaksi</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Lihat pemasukan, saldo tersedia, dan tarik dana kapan saja.
                    </p>
                </div>

                {/* Stats Card */}
                <div className="flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-cyan-50 p-0 shadow-[0px_1px_0px_rgba(41,61,94)] md:flex-row">
                    {/* Balance Section */}
                    <div className="flex flex-1 flex-col justify-between border-b border-slate-200 p-6 md:border-r md:border-b-0">
                        <div className="mb-4 flex items-center gap-2 text-slate-800">
                            <WalletIcon className="h-5 w-5 text-cyan-600" weight="fill" />
                            <span className="text-sm font-medium">Saldo saat ini</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <h2 className="text-2xl font-semibold text-cyan-600">
                                {formatCurrency(stats.balance)}
                            </h2>
                        </div>
                    </div>

                    {/* Total Income */}
                    <div className="flex flex-col justify-center border-b border-slate-200 p-6 md:w-72 md:border-r md:border-b-0">
                        <p className="mb-2 text-xs font-bold text-slate-700">
                            Total Penghasilan
                        </p>
                        <h3 className="mb-2 text-xl font-semibold text-cyan-600">
                            {formatCurrency(stats.totalIncome)}
                        </h3>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">30 hari terakhir</span>
                            <span className="rounded-full bg-green-100 px-2 py-1 font-medium text-green-800">
                                +{stats.incomeChange}%
                            </span>
                        </div>
                    </div>

                    {/* Total Transaction */}
                    <div className="flex flex-col justify-center p-6 md:w-72">
                        <p className="mb-2 text-xs font-bold text-slate-700">
                            Total Transaksi
                        </p>
                        <h3 className="mb-2 text-xl font-semibold text-cyan-600">
                            {stats.totalTransactions}
                        </h3>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">30 hari terakhir</span>
                            <span className="rounded-full bg-cyan-100 px-2 py-1 font-medium text-cyan-800">
                                +{stats.transactionsChange}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col justify-between gap-4 md:flex-row">
                    {/* Search */}
                    <SearchInput
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari ID, Produk, atau Nama Pembeli"
                    />

                    {/* Filter */}
                    <div className="flex gap-3">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <ButtonFilter label={`Status: ${getStatusLabel(status)}`} />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[180px]">
                                <DropdownMenuRadioGroup value={status} onValueChange={setStatus}>
                                    <DropdownMenuRadioItem value="ALL">Semua Status</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="completed">Sudah Bayar</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="pending">Menunggu</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="failed">Gagal</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="expired">Kedaluwarsa</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Table */}
                <Table
                    pagination={
                        <TablePagination
                            page={page}
                            totalPages={10}
                            limit={limit}
                            total={100}
                            onPageChange={setPage}
                            onLimitChange={setLimit}
                        />
                    }
                >
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[5%] text-center">No</TableHead>
                            <TableHead className="w-[10%] whitespace-nowrap">ID</TableHead>
                            <TableHead className="w-[12%] whitespace-nowrap">Total</TableHead>
                            <TableHead className="w-[10%] whitespace-nowrap">
                                Metode
                            </TableHead>
                            <TableHead className="w-[18%] whitespace-nowrap">
                                Pembeli
                            </TableHead>
                            <TableHead className="w-[20%] whitespace-nowrap">
                                Produk
                            </TableHead>
                            <TableHead className="w-[15%] whitespace-nowrap">
                                Tanggal
                            </TableHead>
                            <TableHead className="w-[10%] text-center whitespace-nowrap">
                                Status
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {dummyTransactions.map((item, index) => (
                            <TableRow key={item.id} data-type="body">
                                <TableCell className="text-center font-medium">
                                    <div className="flex min-h-[48px] items-center justify-center">
                                        {(page - 1) * limit + index + 1}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex min-h-[48px] max-w-[80px] items-center truncate text-xs font-medium text-slate-400">
                                                {item.id}
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>ID: {item.id}</TooltipContent>
                                    </Tooltip>
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                    <div className="flex min-h-[48px] items-center font-medium text-slate-800">
                                        {formatCurrency(item.amount)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex min-h-[48px] max-w-[80px] items-center truncate text-slate-600">
                                                {item.xenditPaymentMethod ?? "-"}
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            {item.xenditPaymentMethod ?? "-"}
                                        </TooltipContent>
                                    </Tooltip>
                                </TableCell>
                                <TableCell>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex min-h-[48px] max-w-[140px] items-center truncate text-slate-600">
                                                {item.buyerName}
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>{item.buyerName}</TooltipContent>
                                    </Tooltip>
                                </TableCell>
                                <TableCell>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex min-h-[48px] max-w-[180px] items-center truncate text-slate-600">
                                                {item.productName}
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>{item.productName}</TooltipContent>
                                    </Tooltip>
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                    <div className="flex min-h-[48px] items-center text-slate-600">
                                        {format(new Date(item.createdAt), "dd MMM yyyy HH:mm", {
                                            locale: id,
                                        })}
                                    </div>
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                    <div className="flex min-h-[48px] items-center justify-center">
                                        <span
                                            className={`rounded-full px-4 py-1 text-[13px] leading-tight font-medium ${getStatusColor(item.status)}`}
                                        >
                                            {getStatusLabel(item.status)}
                                        </span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </TooltipProvider>
    );
}
