"use client";

import { useState, type FormEvent } from "react";
import {
  ArrowUpRightIcon,
  CreditCardIcon,
  WalletIcon,
} from "@phosphor-icons/react";
import { api } from "~/trpc/react";
import { useDebounce } from "~/hooks/use-debounce";
import { withdrawalSchema, type WithdrawalFormData } from "~/lib/validation";
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
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
  TablePagination,
} from "~/components/ui/table";
import { FormGroup, FormInput, FormSelect } from "~/components/ui/form-layout";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { formatCurrency, formatNumberInput } from "~/lib/utils";

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
  const [withdrawErrors, setWithdrawErrors] = useState<
    Partial<Record<keyof WithdrawalFormData, string>>
  >({});
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



  const transactions = data?.items ?? [];
  const stats = {
    totalIncome: 0,
    totalTransactions: 0,
    balance: 0,
    incomeChange: 0,
    transactionsChange: 0,
    ...data?.stats,
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
  const errorFieldClassName =
    "border-red-500 focus:ring-red-500/30 focus:border-red-500";
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
      setWithdrawErrors({});
      await utils.purchases.getAllForCreator.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateWithdrawField = (
    field: keyof typeof withdrawForm,
    value: string,
  ) => {
    const nextValue =
      field === "amount" || field === "accountNumber"
        ? value.replace(/\D/g, "")
        : value;

    setWithdrawForm((current) => ({
      ...current,
      [field]: nextValue,
    }));
    setWithdrawErrors((current) => {
      if (!current[field]) {
        return current;
      }

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

    if (!open) {
      setWithdrawErrors({});
    }
  };

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
                {isLoading && !data ? (
                  <Skeleton className="h-8 w-40" />
                ) : (
                  formatCurrency(stats.balance)
                )}
              </h2>
              <Dialog
                open={isWithdrawOpen}
                onOpenChange={handleWithdrawDialogOpenChange}
              >
                <DialogTrigger asChild>
                  <ActionButton
                    label="Tarik Saldo"
                    icon={ArrowUpRightIcon}
                    variant="secondary"
                  />
                </DialogTrigger>
                <DialogContent size="2xl" showCloseButton={false}>
                  <DialogHeader>
                    <DialogTitle className="flex items-center justify-center gap-4">
                      <CreditCardIcon className="h-6 w-6" weight="fill" />
                      Penarikan Saldo
                    </DialogTitle>
                  </DialogHeader>

                  <form
                    className="space-y-0 px-10 py-8"
                    onSubmit={handleWithdrawalSubmit}
                  >
                    <div className="space-y-0">
                      <FormGroup
                        label="Jumlah"
                        labelWidth="md:w-[100px]"
                        error={withdrawErrors.amount}
                      >
                        <FormInput
                          type="text"
                          inputMode="numeric"
                          prefix="Rp"
                          value={formatNumberInput(withdrawForm.amount)}
                          className={
                            withdrawErrors.amount ? errorFieldClassName : ""
                          }
                          onChange={(event) =>
                            updateWithdrawField("amount", event.target.value)
                          }
                          placeholder="Contoh: 500000"
                        />
                      </FormGroup>

                      <FormGroup
                        label="Pilih Bank"
                        labelWidth="md:w-[100px]"
                        error={withdrawErrors.bank}
                      >
                        <FormSelect
                          value={withdrawForm.bank}
                          className={
                            withdrawErrors.bank ? errorFieldClassName : ""
                          }
                          onChange={(e) =>
                            updateWithdrawField("bank", e.target.value)
                          }
                        >
                          <option value="" disabled>
                            Pilih salah satu
                          </option>
                          {bankOptions.map((bank) => (
                            <option key={bank.value} value={bank.value}>
                              {bank.label}
                            </option>
                          ))}
                        </FormSelect>
                      </FormGroup>

                      <FormGroup
                        label="Nama Pemilik"
                        labelWidth="md:w-[100px]"
                        error={withdrawErrors.accountHolderName}
                      >
                        <FormInput
                          value={withdrawForm.accountHolderName}
                          className={
                            withdrawErrors.accountHolderName
                              ? errorFieldClassName
                              : ""
                          }
                          onChange={(event) =>
                            updateWithdrawField(
                              "accountHolderName",
                              event.target.value,
                            )
                          }
                          placeholder="Masukkan nama pemilik rekening"
                        />
                      </FormGroup>

                      <FormGroup
                        label="No Rekening"
                        labelWidth="md:w-[100px]"
                        error={withdrawErrors.accountNumber}
                      >
                        <FormInput
                          inputMode="numeric"
                          value={withdrawForm.accountNumber}
                          className={
                            withdrawErrors.accountNumber
                              ? errorFieldClassName
                              : ""
                          }
                          onChange={(event) =>
                            updateWithdrawField(
                              "accountNumber",
                              event.target.value,
                            )
                          }
                          placeholder="Masukkan nomor rekening anda"
                        />
                      </FormGroup>

                      <FormGroup
                        label="Email"
                        labelWidth="md:w-[100px]"
                        error={withdrawErrors.email}
                      >
                        <FormInput
                          type="email"
                          value={withdrawForm.email}
                          className={
                            withdrawErrors.email ? errorFieldClassName : ""
                          }
                          onChange={(event) =>
                            updateWithdrawField("email", event.target.value)
                          }
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
                          <span>Biaya Aplikasi (2%)</span>
                          <span>- Rp{formatNumberInput(Math.round(Number(withdrawForm.amount) * 0.02).toString())}</span>
                        </div>
                        <div className="flex justify-between text-[13px] text-slate-600">
                          <span>Biaya Transfer Bank</span>
                          <span>- Rp4.000</span>
                        </div>
                        <div className="border-t border-slate-200 pt-2.5 mt-2.5 flex justify-between font-semibold text-[15px] text-slate-900">
                          <span>Total Diterima</span>
                          <span>
                            Rp{formatNumberInput(Math.max(0, Number(withdrawForm.amount) - Math.round(Number(withdrawForm.amount) * 0.02) - 4000).toString())}
                          </span>
                        </div>
                        {Number(withdrawForm.amount) - Math.round(Number(withdrawForm.amount) * 0.02) - 4000 < 10000 && (
                          <p className="text-red-500 text-xs mt-3 pt-2 border-t border-red-100 text-center font-medium">
                            Minimal saldo diterima harus Rp10.000 setelah dipotong fee.
                          </p>
                        )}
                      </div>
                    )}

                    <DialogFooter className="grid grid-cols-2 gap-4">
                      <DialogClose asChild>
                        <ButtonCancel
                          label="Batal"
                          className="text-md w-full sm:w-auto"
                        />
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
              <span className="text-slate-400">30 hari terakhir</span>
              <span
                className={`rounded-full px-2 py-1 font-medium ${stats.incomeChange >= 0
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
                  }`}
              >
                {stats.incomeChange >= 0 ? "+" : ""}
                {stats.incomeChange.toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Total Transaction */}
          <div className="flex flex-col justify-center p-6 md:w-72">
            <p className="mb-2 text-xs font-bold text-slate-700">
              Total Transaksi
            </p>
            <h3 className="mb-2 text-xl font-semibold text-cyan-600">
              {isLoading && !data ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                stats.totalTransactions
              )}
            </h3>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">30 hari terakhir</span>
              <span
                className={`rounded-full px-2 py-1 font-medium ${stats.transactionsChange >= 0
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
                  }`}
              >
                {stats.transactionsChange >= 0 ? "+" : ""}
                {stats.transactionsChange.toFixed(0)}%
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
            {isLoading && !data ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} data-type="body">
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
                  <TableCell className="whitespace-nowrap">
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
                          {item.product.name}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>{item.product.name}</TooltipContent>
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
    </TooltipProvider>
  );
}
