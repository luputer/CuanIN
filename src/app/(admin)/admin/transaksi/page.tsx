"use client";

import { useState, type FormEvent } from "react";
import { WalletIcon, ArrowUpRightIcon, CreditCardIcon } from "@phosphor-icons/react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { api } from "~/trpc/react";
import { useDebounce } from "~/hooks/use-debounce";
import { withdrawalSchema, type WithdrawalFormData } from "~/lib/validation";
import { toast } from "sonner";
import { Skeleton } from "~/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "~/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import ButtonFilter from "~/components/ui/filter";
import SearchInput from "~/components/ui/search";
import ActionButton from "~/components/ui/button-add";
import ButtonSave from "~/components/ui/button-save";
import ButtonCancel from "~/components/ui/button-cancel";
import { FormGroup, FormInput, FormSelect } from "~/components/ui/form-layout";
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
import { formatCurrency, formatNumberInput } from "~/lib/utils";

export default function AdminTransactionPage() {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("ALL");
    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
    const [withdrawForm, setWithdrawForm] = useState({
      amount: "",
      bank: "",
      accountNumber: "",
      accountHolderName: "",
      email: "",
    });
    const [withdrawErrors, setWithdrawErrors] = useState<Partial<Record<keyof WithdrawalFormData, string>>>({});
    
    const debouncedSearch = useDebounce(search, 500);
    const utils = api.useUtils();

    const { data, isLoading } = api.admin.getWithdrawals.useQuery({
        page,
        limit,
        search: debouncedSearch,
        status,
    }, {
        placeholderData: (prev) => prev,
    });

    const stats = {
        totalIncome: 0,
        totalTransactions: 0,
        balance: 0,
        incomeChange: 0,
        transactionsChange: 0,
        ...data?.stats,
    };

    const transactions = data?.items ?? [];
    const totalPages = data?.totalPages ?? 0;
    const totalItems = data?.total ?? 0;

    const bankOptions = [
      { value: "bca", label: "BCA" },
      { value: "bni", label: "BNI" },
      { value: "bri", label: "BRI" },
      { value: "mandiri", label: "Mandiri" },
      { value: "cimb", label: "CIMB Niaga" },
      { value: "bsi", label: "BSI" },
    ];
    const errorFieldClassName = "border-red-500 focus:ring-red-500/30 focus:border-red-500";
    
    const createWithdrawal = api.withdrawals.create.useMutation({
      onSuccess: async () => {
        toast.success("Penarikan saldo berhasil diproses");
        setIsWithdrawOpen(false);
        setWithdrawForm({ amount: "", bank: "", accountNumber: "", accountHolderName: "", email: "" });
        setWithdrawErrors({});
        await utils.admin.getWithdrawals.invalidate();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

    const updateWithdrawField = (field: keyof typeof withdrawForm, value: string) => {
      const nextValue = (field === "amount" || field === "accountNumber") ? value.replace(/\D/g, "") : value;
      setWithdrawForm((current) => ({ ...current, [field]: nextValue }));
      setWithdrawErrors((current) => {
        if (!current[field]) return current;
        const next = { ...current };
        delete next[field];
        return next;
      });
    };

    const handleWithdrawalSubmit = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const result = withdrawalSchema.safeParse(withdrawForm);
      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        setWithdrawErrors({
          amount: fieldErrors.amount?.[0],
          bank: fieldErrors.bank?.[0],
          accountNumber: fieldErrors.accountNumber?.[0],
          accountHolderName: fieldErrors.accountHolderName?.[0],
          email: fieldErrors.email?.[0],
        });
        return;
      }
      setWithdrawErrors({});
      createWithdrawal.mutate(result.data);
    };

    const handleWithdrawDialogOpenChange = (open: boolean) => {
      setIsWithdrawOpen(open);
      if (!open) setWithdrawErrors({});
    };

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case "SUCCEEDED":
            case "COMPLETED":
                return "bg-green-100 text-green-700";
            case "PENDING":
            case "REQUESTED":
            case "ACCEPTED":
                return "bg-yellow-100 text-yellow-700";
            case "FAILED":
            case "CANCELLED":
            case "REVERSED":
                return "bg-red-100 text-red-700";
            case "EXPIRED":
                return "bg-slate-200 text-slate-500";
            default:
                return "bg-slate-100 text-slate-600";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status.toUpperCase()) {
            case "ALL":
                return "Semua Status";
            case "SUCCEEDED":
            case "COMPLETED":
                return "Berhasil";
            case "PENDING":
            case "REQUESTED":
            case "ACCEPTED":
                return "Menunggu";
            case "FAILED":
            case "CANCELLED":
            case "REVERSED":
                return "Gagal";
            case "EXPIRED":
                return "Kedaluwarsa";
            default:
                return status;
        }
    };

    return (
        <TooltipProvider>
            <div className="w-full max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-slate-50">
                    <div className="sticky top-[74px] bg-slate-50 z-40 -mx-4 sm:-mx-6 px-4 sm:px-6 mb-2">
                        <div className="text-2xl font-bold mb-2 text-cyan-600">Daftar Transaksi</div>
                        <div className="text-sm font-regular text-slate-600">
                            Lihat riwayat penarikan kreator dan tarik total pendapatan admin.
                        </div>
                    </div>
                </div>

                {/* Stats Card */}
                <div className="flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-cyan-50 p-0 shadow-[0px_1px_0px_rgba(41,61,94)] md:flex-row">
                    {/* Balance Section */}
                    <div className="flex flex-1 flex-col justify-between border-b border-slate-200 p-6 md:border-r md:border-b-0">
                        <div className="mb-4 flex items-center gap-2 text-slate-800">
                            <WalletIcon className="h-5 w-5 text-cyan-600" weight="fill" />
                            <span className="text-sm font-medium">Saldo saat ini</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                            <h2 className="text-2xl font-semibold text-cyan-600">
                                {isLoading && !data ? (
                                    <Skeleton className="h-8 w-40" />
                                ) : (
                                    formatCurrency(stats.balance)
                                )}
                            </h2>
                            <Dialog open={isWithdrawOpen} onOpenChange={handleWithdrawDialogOpenChange}>
                                <DialogTrigger asChild>
                                    <ActionButton label="Tarik Saldo" icon={ArrowUpRightIcon} variant="secondary" />
                                </DialogTrigger>
                                <DialogContent size="2xl" showCloseButton={false}>
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center justify-center gap-4">
                                            <CreditCardIcon className="h-6 w-6" weight="fill" />
                                            Penarikan Saldo Admin
                                        </DialogTitle>
                                    </DialogHeader>

                                    <form className="space-y-0 px-10 py-8" onSubmit={handleWithdrawalSubmit}>
                                        <div className="space-y-0">
                                            <FormGroup label="Jumlah" labelWidth="md:w-[100px]" error={withdrawErrors.amount}>
                                                <FormInput
                                                    type="text"
                                                    inputMode="numeric"
                                                    prefix="Rp"
                                                    value={formatNumberInput(withdrawForm.amount)}
                                                    className={withdrawErrors.amount ? errorFieldClassName : ""}
                                                    onChange={(event) => updateWithdrawField("amount", event.target.value)}
                                                    placeholder="Contoh: 500000"
                                                />
                                            </FormGroup>

                                            <FormGroup label="Pilih Bank" labelWidth="md:w-[100px]" error={withdrawErrors.bank}>
                                                <FormSelect
                                                    value={withdrawForm.bank}
                                                    className={withdrawErrors.bank ? errorFieldClassName : ""}
                                                    onChange={(e) => updateWithdrawField("bank", e.target.value)}
                                                >
                                                    <option value="" disabled>Pilih salah satu</option>
                                                    {bankOptions.map((bank) => (
                                                        <option key={bank.value} value={bank.value}>{bank.label}</option>
                                                    ))}
                                                </FormSelect>
                                            </FormGroup>

                                            <FormGroup label="Nama Pemilik" labelWidth="md:w-[100px]" error={withdrawErrors.accountHolderName}>
                                                <FormInput
                                                    value={withdrawForm.accountHolderName}
                                                    className={withdrawErrors.accountHolderName ? errorFieldClassName : ""}
                                                    onChange={(event) => updateWithdrawField("accountHolderName", event.target.value)}
                                                    placeholder="Masukkan nama pemilik rekening"
                                                />
                                            </FormGroup>

                                            <FormGroup label="No Rekening" labelWidth="md:w-[100px]" error={withdrawErrors.accountNumber}>
                                                <FormInput
                                                    inputMode="numeric"
                                                    value={withdrawForm.accountNumber}
                                                    className={withdrawErrors.accountNumber ? errorFieldClassName : ""}
                                                    onChange={(event) => updateWithdrawField("accountNumber", event.target.value)}
                                                    placeholder="Masukkan nomor rekening anda"
                                                />
                                            </FormGroup>

                                            <FormGroup label="Email" labelWidth="md:w-[100px]" error={withdrawErrors.email}>
                                                <FormInput
                                                    type="email"
                                                    value={withdrawForm.email}
                                                    className={withdrawErrors.email ? errorFieldClassName : ""}
                                                    onChange={(event) => updateWithdrawField("email", event.target.value)}
                                                    placeholder="Masukkan email anda"
                                                />
                                            </FormGroup>
                                        </div>

                                        {Number(withdrawForm.amount) > 0 && (
                                            <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2.5">
                                                <div className="flex justify-between text-[13px] text-slate-600">
                                                    <span>Nominal Penarikan</span>
                                                    <span>Rp{formatNumberInput(withdrawForm.amount)}</span>
                                                </div>
                                                <div className="flex justify-between text-[13px] text-slate-600">
                                                    <span>Biaya Transfer Bank</span>
                                                    <span>- Rp4.000</span>
                                                </div>
                                                <div className="border-t border-slate-200 pt-2.5 mt-2.5 flex justify-between font-semibold text-[15px] text-slate-900">
                                                    <span>Total Diterima</span>
                                                    <span>
                                                        Rp{formatNumberInput(Math.max(0, Number(withdrawForm.amount) - 4000).toString())}
                                                    </span>
                                                </div>
                                                {Number(withdrawForm.amount) - 4000 < 10000 && (
                                                    <p className="text-red-500 text-xs mt-3 pt-2 border-t border-red-100 text-center font-medium">
                                                        Minimal saldo diterima harus Rp10.000 setelah dipotong fee.
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        <DialogFooter className="grid grid-cols-2 gap-4">
                                            <DialogClose asChild>
                                                <ButtonCancel label="Batal" className="text-md w-full sm:w-auto" />
                                            </DialogClose>
                                            <ButtonSave
                                                type="submit"
                                                isLoading={createWithdrawal.isPending}
                                                label="Konfirmasi"
                                                icon={null}
                                                className="text-md w-full sm:w-auto"
                                            />
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* Total Income */}
                    <div className="flex flex-col justify-center border-b border-slate-200 p-6 md:w-72 md:border-r md:border-b-0">
                        <p className="mb-2 text-xs font-bold text-slate-700">
                            Total Penghasilan
                        </p>
                        <h3 className="mb-2 text-xl font-semibold text-cyan-600">
                            {isLoading && !data ? (
                                <Skeleton className="h-7 w-32" />
                            ) : (
                                formatCurrency(stats.totalIncome)
                            )}
                        </h3>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">Total Akumulasi</span>
                        </div>
                    </div>

                    {/* Total Transaction */}
                    <div className="flex flex-col justify-center p-6 md:w-72">
                        <p className="mb-2 text-xs font-bold text-slate-700">
                            Total Penarikan
                        </p>
                        <h3 className="mb-2 text-xl font-semibold text-cyan-600">
                            {isLoading && !data ? (
                                <Skeleton className="h-7 w-12" />
                            ) : (
                                stats.totalTransactions
                            )}
                        </h3>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">Total Seluruhnya</span>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Search */}
                    <SearchInput
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari ID, Nama Kreator, atau Email"
                        className="w-full sm:flex-1 min-w-[280px]"
                    />

                    {/* Filter */}
                    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <ButtonFilter className="flex-1 lg:flex-none" label={`Status: ${getStatusLabel(status)}`} />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[180px]">
                                <DropdownMenuRadioGroup value={status} onValueChange={setStatus}>
                                    <DropdownMenuRadioItem value="ALL">Semua Status</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="SUCCEEDED">Berhasil</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="PENDING">Menunggu</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="FAILED">Gagal</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
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
                                total={totalItems}
                                onPageChange={setPage}
                                onLimitChange={setLimit}
                            />
                        }
                    >
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[5%] text-center">No</TableHead>
                                <TableHead className="w-[10%] whitespace-nowrap">ID</TableHead>
                                <TableHead className="w-[12%] whitespace-nowrap">Nominal</TableHead>
                                <TableHead className="w-[10%] whitespace-nowrap">Bank</TableHead>
                                <TableHead className="w-[18%] whitespace-nowrap">Kreator</TableHead>
                                <TableHead className="w-[20%] whitespace-nowrap">Rek Tujuan</TableHead>
                                <TableHead className="w-[15%] whitespace-nowrap">Tanggal</TableHead>
                                <TableHead className="w-[10%] text-center whitespace-nowrap">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && !data ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} data-type="body">
                                        <TableCell className="text-center font-medium whitespace-nowrap">
                                            <div className="flex items-center justify-center min-h-[48px]">
                                                <Skeleton className="h-4 w-4" />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center min-h-[48px]">
                                                <Skeleton className="h-4 w-16" />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center min-h-[48px]">
                                                <Skeleton className="h-4 w-24" />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center min-h-[48px]">
                                                <Skeleton className="h-4 w-20" />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center min-h-[48px]">
                                                <Skeleton className="h-4 w-32" />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center min-h-[48px]">
                                                <Skeleton className="h-4 w-40" />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center min-h-[48px]">
                                                <Skeleton className="h-4 w-32" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            <div className="flex items-center justify-center min-h-[48px]">
                                                <Skeleton className="h-6 w-20 rounded-full" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-20 text-center text-slate-500">
                                        Tidak ada data penarikan ditemukan
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transactions.map((item: any, index: number) => (
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
                                                {formatCurrency(Number(item.amount))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="flex min-h-[48px] max-w-[80px] items-center truncate text-slate-600">
                                                        {item.bankName ?? "-"}
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    {item.bankName ?? "-"}
                                                </TooltipContent>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell className="max-w-[140px] leading-normal">
                                            <div className="flex items-center min-h-[48px] py-1">
                                                <span className="text-slate-600 line-clamp-2 break-words">
                                                    {item.user?.name || item.user?.email || "-"}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="flex min-h-[48px] max-w-[180px] items-center truncate text-slate-600">
                                                        {item.accountNumber}
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>{item.accountNumber}</TooltipContent>
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
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile Cards (Only visible on mobile) */}
                <div className="space-y-4 sm:hidden">
                    {isLoading && !data ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-white border border-slate-800 rounded-xl p-4 space-y-3 animate-pulse">
                                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                    <Skeleton className="h-4 w-12" />
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                </div>
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                    <Skeleton className="h-3 w-1/3" />
                                </div>
                            </div>
                        ))
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-8 bg-white border border-slate-800 rounded-xl p-4 text-slate-500">
                            Tidak ada data penarikan ditemukan
                        </div>
                    ) : (
                        transactions.map((item: any, index: number) => {
                            const rowNumber = (page - 1) * limit + index + 1;
                            return (
                                <div key={item.id} className="bg-white border border-slate-800 rounded-xl p-4 space-y-3">
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                        <span className="text-xs font-semibold text-slate-400"># {rowNumber}</span>
                                        <span
                                            className={`rounded-full px-3 py-0.5 text-xs font-medium ${getStatusColor(item.status)}`}
                                        >
                                            {getStatusLabel(item.status)}
                                        </span>
                                    </div>

                                    <div className="space-y-2 flex-1 min-w-0">
                                        <div className="font-semibold text-slate-800 break-words leading-normal">
                                            {item.user?.name || item.user?.email || "-"}
                                        </div>

                                        <div className="text-xs text-slate-500">
                                            <span className="font-medium text-slate-400">ID Transaksi: </span>
                                            <span className="font-mono text-[11px] text-slate-600">{item.id}</span>
                                        </div>

                                        <div className="text-xs text-slate-500">
                                            <span className="font-medium text-slate-400">Bank: </span>
                                            <span className="font-medium text-slate-700">{item.bankName ?? "-"}</span>
                                        </div>

                                        <div className="text-xs text-slate-500">
                                            <span className="font-medium text-slate-400">Rek Tujuan: </span>
                                            <span className="font-medium text-slate-700">{item.accountNumber}</span>
                                        </div>

                                        <div className="text-xs text-slate-500">
                                            <span className="font-medium text-slate-400">Tanggal: </span>
                                            <span className="text-slate-600">
                                                {format(new Date(item.createdAt), "dd MMM yyyy HH:mm", {
                                                    locale: id,
                                                })}
                                            </span>
                                        </div>

                                        <div className="text-xs pt-1">
                                            <span className="font-medium text-slate-400">Nominal: </span>
                                            <span className="font-bold text-cyan-600 text-sm">
                                                {formatCurrency(Number(item.amount))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {/* Mobile Pagination */}
                    {transactions && transactions.length > 0 && (
                        <div className="bg-white border border-slate-800 rounded-xl p-4 shadow-[1.5px_1.5px_0px_rgba(29,41,61)]">
                            <TablePagination
                                page={page}
                                totalPages={totalPages}
                                limit={limit}
                                total={totalItems}
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
