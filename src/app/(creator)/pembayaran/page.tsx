"use client";

import { useState } from "react";
import { ArrowUpRight, CreditCard, Wallet } from "lucide-react";
import { api } from "~/trpc/react";
import { useDebounce } from "~/hooks/use-debounce";
import { format } from "date-fns";
import { id } from "date-fns/locale";
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
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
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

export default function TransactionPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(7);
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
  const debouncedSearch = useDebounce(search, 500);
  const utils = api.useUtils();

  const { data, isLoading } = api.purchases.getAllForCreator.useQuery(
    {
      page,
      limit,
      search: debouncedSearch,
      status,
    },
    {
      placeholderData: (prev) => prev,
    },
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const transactions = data?.items ?? [];
  const stats = data?.stats ?? {
    totalIncome: 0,
    totalTransactions: 0,
    balance: 0,
  };
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
  const createWithdrawal = api.withdrawals.create.useMutation({
    onSuccess: async () => {
      toast.success("Permintaan penarikan saldo berhasil dibuat");
      setIsWithdrawOpen(false);
      setWithdrawForm({
        amount: "",
        bank: "",
        accountNumber: "",
        accountHolderName: "",
        email: "",
      });
      await utils.purchases.getAllForCreator.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

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
        return "Semua";
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
    <div className="space-y-8">
      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-cyan-600">Daftar Transaksi</h1>
          <p className="mt-1 text-sm text-slate-500">
            Lihat pemasukan, saldo tersedia, dan tarik dana kapan saja.
          </p>
        </div>

        {/* Stats Card */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-white p-0 shadow-[0px_1px_0px_rgba(30,27,75)] md:flex-row">
          {/* Balance Section */}
          <div className="flex flex-1 flex-col justify-between border-b border-slate-200 p-6 md:border-r md:border-b-0">
            <div className="mb-4 flex items-center gap-2 text-slate-500">
              <Wallet className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">Saldo saat ini</span>
            </div>
            <div className="flex items-end justify-between">
              <h2 className="text-2xl font-bold text-blue-600">
                {isLoading && !data ? (
                  <Skeleton className="h-8 w-40" />
                ) : (
                  formatCurrency(stats.balance)
                )}
              </h2>
              <DialogTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-600 shadow-sm transition-colors hover:bg-blue-50">
                  Tarik Saldo
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </DialogTrigger>
            </div>
          </div>

          {/* Total Income */}
          <div className="flex flex-col justify-center border-b border-slate-200 p-6 md:w-72 md:border-r md:border-b-0">
            <p className="mb-2 text-xs font-bold text-slate-700">
              Total Penghasilan
            </p>
            <h3 className="mb-2 text-xl font-bold text-blue-600">
              {isLoading && !data ? (
                <Skeleton className="h-7 w-32" />
              ) : (
                formatCurrency(stats.totalIncome)
              )}
            </h3>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Total akumulasi</span>
            </div>
          </div>

          {/* Total Transaction */}
          <div className="flex flex-col justify-center p-6 md:w-72">
            <p className="mb-2 text-xs font-bold text-slate-700">
              Total Transaksi
            </p>
            <h3 className="mb-2 text-xl font-bold text-blue-600">
              {isLoading && !data ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                stats.totalTransactions
              )}
            </h3>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Transaksi berhasil</span>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col justify-between gap-4 md:flex-row">
          {/* Search */}
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan ID, Produk, atau Nama Pembeli"
          />

          {/* Filter */}
          <div className="flex gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <ButtonFilter label={`Status: ${getStatusLabel(status)}`} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuRadioGroup
                  value={status}
                  onValueChange={setStatus}
                >
                  <DropdownMenuRadioItem value="ALL">
                    Semua Status
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="completed">
                    Sudah Bayar
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="pending">
                    Menunggu
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="failed">
                    Gagal
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="expired">
                    Kedaluwarsa
                  </DropdownMenuRadioItem>
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
              <TableHead>ID Transaksi</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Metode</TableHead>
              <TableHead>Nama Pembeli</TableHead>
              <TableHead>Produk</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && !data ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="mx-auto h-4 w-4" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-20 text-center text-slate-500"
                >
                  Tidak ada transaksi ditemukan
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-center font-medium">
                    {(page - 1) * limit + index + 1}
                  </TableCell>
                  <TableCell className="max-w-[100px] truncate text-xs font-medium text-slate-400">
                    {item.id}
                  </TableCell>
                  <TableCell className="font-medium whitespace-nowrap text-slate-800">
                    {formatCurrency(Number(item.amount))}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-slate-600">
                    {item.xenditPaymentMethod ?? "-"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-slate-600">
                    {item.buyerName}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-slate-600">
                    {item.product.name}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-slate-600">
                    {format(new Date(item.createdAt), "dd MMM yyyy HH:mm", {
                      locale: id,
                    })}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full px-4 py-1 text-[13px] leading-tight font-medium ${getStatusColor(item.status)}`}
                    >
                      {item.status === "completed"
                        ? "Sudah Bayar"
                        : item.status === "pending"
                          ? "Menunggu"
                          : item.status === "failed"
                            ? "Gagal"
                            : item.status === "expired"
                              ? "Kedaluwarsa"
                              : item.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <DialogContent
          showCloseButton={false}
          className="max-w-[554px] gap-0 overflow-hidden rounded-lg border-0 bg-white p-0 text-slate-800 shadow-2xl ring-0 sm:max-w-[554px]"
        >
          <div className="bg-blue-50 px-8 py-6">
            <DialogTitle className="flex items-center justify-center gap-4 text-2xl font-bold text-blue-500">
              <CreditCard className="h-6 w-6" />
              Penarikan Saldo
            </DialogTitle>
            <DialogDescription className="sr-only">
              Form penarikan saldo ke rekening bank.
            </DialogDescription>
          </div>

          <form
            className="space-y-4 px-10 py-8"
            onSubmit={(event) => {
              event.preventDefault();
              createWithdrawal.mutate({
                amount: Number(withdrawForm.amount),
                bank: withdrawForm.bank as
                  | "bca"
                  | "bni"
                  | "bri"
                  | "mandiri"
                  | "cimb"
                  | "bsi",
                accountNumber: withdrawForm.accountNumber,
                accountHolderName: withdrawForm.accountHolderName,
                email: withdrawForm.email,
              });
            }}
          >
            <div className="grid gap-3 md:grid-cols-[86px_1fr] md:items-center">
              <label
                htmlFor="withdraw-amount"
                className="text-sm font-medium text-slate-700"
              >
                Jumlah
              </label>
              <input
                id="withdraw-amount"
                type="number"
                min="0"
                value={withdrawForm.amount}
                onChange={(event) =>
                  setWithdrawForm((current) => ({
                    ...current,
                    amount: event.target.value,
                  }))
                }
                placeholder="Masukkan jumlah saldo yang ingin ditarik"
                className="h-12 w-full rounded-xl border border-blue-300 bg-white px-5 text-sm text-slate-700 transition outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="grid gap-3 md:grid-cols-[86px_1fr] md:items-center">
              <label className="text-sm font-medium text-slate-700">
                Pilih Bank
              </label>
              <Select
                value={withdrawForm.bank}
                onValueChange={(value) =>
                  setWithdrawForm((current) => ({ ...current, bank: value }))
                }
              >
                <SelectTrigger className="h-12 w-full rounded-xl border-blue-300 bg-white px-5 text-sm text-slate-700 focus-visible:border-blue-500 focus-visible:ring-blue-200 data-[size=default]:h-12">
                  <SelectValue placeholder="Pilih salah satu" />
                </SelectTrigger>
                <SelectContent className="rounded-lg border-blue-100">
                  {bankOptions.map((bank) => (
                    <SelectItem key={bank.value} value={bank.value}>
                      {bank.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3 md:grid-cols-[86px_1fr] md:items-center">
              <label
                htmlFor="withdraw-account-holder"
                className="text-sm font-medium text-slate-700"
              >
                Nama Pemilik
              </label>
              <input
                id="withdraw-account-holder"
                value={withdrawForm.accountHolderName}
                onChange={(event) =>
                  setWithdrawForm((current) => ({
                    ...current,
                    accountHolderName: event.target.value,
                  }))
                }
                placeholder="Masukkan nama pemilik rekening"
                className="h-12 w-full rounded-xl border border-blue-300 bg-white px-5 text-sm text-slate-700 transition outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="grid gap-3 md:grid-cols-[86px_1fr] md:items-center">
              <label
                htmlFor="withdraw-account"
                className="text-sm font-medium text-slate-700"
              >
                No Rekening
              </label>
              <input
                id="withdraw-account"
                inputMode="numeric"
                value={withdrawForm.accountNumber}
                onChange={(event) =>
                  setWithdrawForm((current) => ({
                    ...current,
                    accountNumber: event.target.value,
                  }))
                }
                placeholder="Masukkan nomor rekening anda"
                className="h-12 w-full rounded-xl border border-blue-300 bg-white px-5 text-sm text-slate-700 transition outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="grid gap-3 md:grid-cols-[86px_1fr] md:items-center">
              <label
                htmlFor="withdraw-email"
                className="text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="withdraw-email"
                type="email"
                value={withdrawForm.email}
                onChange={(event) =>
                  setWithdrawForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                placeholder="Masukkan email anda"
                className="h-12 w-full rounded-xl border border-blue-300 bg-white px-5 text-sm text-slate-700 transition outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="grid gap-2 pt-2 sm:grid-cols-2">
              <DialogClose asChild>
                <button
                  type="button"
                  className="h-9 rounded-lg bg-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-300"
                >
                  Batal
                </button>
              </DialogClose>
              <button
                type="submit"
                disabled={createWithdrawal.isPending}
                className="h-9 rounded-lg bg-blue-500 px-5 text-sm font-semibold text-white transition hover:bg-blue-600"
              >
                {createWithdrawal.isPending ? "Memproses..." : "Konfirmasi"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
