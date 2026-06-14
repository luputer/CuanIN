"use client";

// React
import { useState, type FormEvent } from "react";

// Third-party
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";

// Icons
import {
  EyeIcon,
} from "@phosphor-icons/react";

// Internal & Utils
import { api } from "~/trpc/react";
import { useDebounce } from "~/hooks/use-debounce";
import { type WithdrawalFormData } from "~/lib/validation";
import { formatCurrency } from "~/lib/utils";

// Components
import { Skeleton } from "~/components/ui/skeleton";
import SearchInput from "~/components/ui/search";
import { PageHeader } from "~/components/layout/page-header";
import { DataTableToolbar, SelectFilter } from "~/components/layout/data-table-toolbar";
import { DataTableBodySkeleton, DataTableMobileSkeleton } from "~/components/layout/table-skeleton";
import { TableEmptyState, MobileEmptyState } from "~/components/layout/empty-state";
import { MobilePaginationWrapper } from "~/components/layout/mobile-pagination-wrapper";
import { StatusBadge } from "~/components/ui/status-badge";
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
import {
  WithdrawalDialog,
  TransactionDetailDialog,
  getStatusLabel,
} from "~/components/layout/transaction-dialogs";
import { TransactionStatsCard } from "~/components/layout/transaction-stats-card";

export default function TransactionPage() {
  // ─── States & Hooks ──────────────────────────────────────────────────────

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(7);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const debouncedSearch = useDebounce(search, 500);
  const utils = api.useUtils();

  // ─── API ─────────────────────────────────────────────────────────────────

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



  const transactions = (data?.items ?? []).map((item: any) => ({
    ...item,
    amount: Number(item.amount),
    feeAmount: item.type === "WITHDRAWAL" ? Number(item.feeAmount ?? 0) : null
  })) as unknown as Array<
    ({ type: "INCOME" } & { id: string; amount: number; buyerName: string; createdAt: Date; status: string; product: { name: string }; xenditPaymentMethod?: string | null }) |
    ({ type: "WITHDRAWAL" } & { id: string; amount: number; bankName: string; accountNumber: string; createdAt: Date; status: string; feeAmount?: number | null })
  >;

  const stats = {
    totalIncome: data?.stats.totalIncome ?? 0,
    totalTransactions: data?.stats.totalTransactions ?? 0,
    balance: data?.stats.balance ?? 0,
    incomeChange: data?.stats.incomeChange ?? 0,
    transactionsChange: data?.stats.transactionsChange ?? 0,
  };
  const totalPages = data?.totalPages ?? 0;
  const totalItems = data?.total ?? 0;

  const createWithdrawal = api.withdrawals.create.useMutation({
    onSuccess: async () => {
      toast.success("Permintaan penarikan saldo berhasil dibuat");
      setIsWithdrawOpen(false);
      await utils.purchases.getAllForCreator.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleWithdrawalSubmit = (data: WithdrawalFormData) => {
    createWithdrawal.mutate(data);
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <TooltipProvider>
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <PageHeader
          title="Daftar Transaksi"
          description="Lihat pemasukan, saldo tersedia, dan tarik dana kapan saja."
        />

        {/* Stats Card */}
        <TransactionStatsCard
          isLoading={isLoading}
          data={data}
          stats={stats}
          onWithdraw={() => setIsWithdrawOpen(true)}
          isAdmin={false}
        />

        {/* Toolbar */}
        <DataTableToolbar
          search={
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari ID, Email, Rekening, dll"
              className="w-full"
            />
          }
          actions={
            <SelectFilter
              label={`Status: ${getStatusLabel(status)}`}
              value={status}
              onValueChange={setStatus}
              options={[
                { value: "ALL", label: "Semua Status" },
                { value: "SUCCEEDED", label: "Berhasil" },
                { value: "PENDING", label: "Menunggu" },
                { value: "FAILED", label: "Gagal" },
                { value: "EXPIRED", label: "Kedaluwarsa" },
              ]}
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
                total={totalItems}
                onPageChange={setPage}
                onLimitChange={setLimit}
              />
            }
          >
            <TableHeader>
              <TableRow>
                <TableHead className="w-[5%] text-center">No</TableHead>
                <TableHead className="w-[8%] whitespace-nowrap">ID</TableHead>
                <TableHead className="w-[14%] whitespace-nowrap">Akun</TableHead>
                <TableHead className="w-[14%] whitespace-nowrap">Nominal</TableHead>
                <TableHead className="w-[8%] whitespace-nowrap">Tipe</TableHead>
                <TableHead className="w-[12%] whitespace-nowrap">Metode</TableHead>
                <TableHead className="w-[15%] whitespace-nowrap">Tanggal</TableHead>
                <TableHead className="w-[12%] text-center whitespace-nowrap">Status</TableHead>
                <TableHead className="w-[6%] text-right whitespace-nowrap">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && !data ? (
                <DataTableBodySkeleton columns={9} rows={5} />
              ) : transactions.length === 0 ? (
                <TableEmptyState
                  colSpan={9}
                  description="Tidak ada transaksi ditemukan"
                />
              ) : (
                transactions.map((item: any, index: number) => {
                  const typeLabel = item.type === "INCOME" ? "Masuk" : "Tarik";
                  const nominal = item.type === "INCOME" ? Number(item.amount) : (Number(item.amount) - Number(item.feeAmount ?? 0) - 4000);

                  return (
                    <TableRow key={item.id} data-type="body">
                      <TableCell className="text-center font-medium">
                        <div className="flex min-h-[48px] items-center justify-center">
                          {(page - 1) * limit + index + 1}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex min-h-[48px] max-w-[80px] items-center truncate text-slate-400">
                              {item.id}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>ID: {item.id}</TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="max-w-[120px]">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center min-h-[48px]">
                              <span className="font-medium truncate block w-full">
                                {item.type === "INCOME" ? item.buyerName : (item.accountHolderName ?? "-")}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {item.type === "INCOME" ? item.buyerName : (item.accountHolderName ?? "-")}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex min-h-[48px] items-center">
                          <span className={`font-semibold ${item.type === "INCOME" ? "text-green-600" : "text-slate-900"}`}>
                            {item.type === "INCOME" ? "+" : ""} {formatCurrency(nominal)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex min-h-[48px] items-center">
                          {typeLabel}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center min-h-[48px]">
                          {item.type === "INCOME" ? (item.xenditPaymentMethod ?? "-") : (item.bankName ?? "-")}
                        </div>
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
                          <StatusBadge status={item.status} className="px-4 py-1" />
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-3">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button onClick={() => {
                                setSelectedTx(item);
                                setIsDetailOpen(true);
                              }}>
                                <EyeIcon className="w-[22px] h-[22px] text-cyan-600 cursor-pointer hover:text-cyan-700" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Lihat Detail</TooltipContent>
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
          {isLoading && !data ? (
            <DataTableMobileSkeleton rows={3} />
          ) : transactions.length === 0 ? (
            <MobileEmptyState description="Tidak ada transaksi ditemukan" />
          ) : (
            transactions.map((item: any, index: number) => {
              const rowNumber = (page - 1) * limit + index + 1;
              const typeLabel = item.type === "INCOME" ? "Masuk" : "Tarik";
              const nominal = item.type === "INCOME" ? Number(item.amount) : (Number(item.amount) - Number(item.feeAmount ?? 0) - 4000);

              return (
                <div key={item.id} className="bg-white border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-xs font-semibold text-slate-400"># {rowNumber}</span>
                    <StatusBadge status={item.status} />
                  </div>

                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="font-semibold text-slate-800 break-words leading-normal flex items-center justify-between">
                      <span className="truncate pr-2">
                        {item.type === "INCOME" ? item.buyerName : (item.accountHolderName ?? "-")}
                      </span>
                      <span className={`text-[12px] font-medium whitespace-nowrap ${item.type === "INCOME" ? "text-green-600" : "text-slate-900"}`}>
                        {typeLabel}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500">
                      <span className="font-medium text-slate-400">ID Transaksi: </span>
                      <span className="font-mono text-[11px] text-slate-600">{item.id}</span>
                    </div>

                    <div className="text-xs text-slate-500">
                      <span className="font-medium text-slate-400">Metode: </span>
                      <span className="font-medium text-slate-700">{item.type === "INCOME" ? (item.xenditPaymentMethod ?? "-") : item.bankName}</span>
                    </div>


                    <div className="text-xs text-slate-500">
                      <span className="font-medium text-slate-400">Tanggal: </span>
                      <span className="text-slate-600">
                        {format(new Date(item.createdAt), "dd MMM yyyy HH:mm", {
                          locale: id,
                        })}
                      </span>
                    </div>

                    {item.type === "WITHDRAWAL" && (
                      <div className="text-xs text-slate-500">
                        <span className="font-medium text-slate-400">Biaya: </span>
                        <span className="font-medium text-red-500">{formatCurrency(Number(item.feeAmount ?? 0) + 4000)}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-slate-50 mt-2">
                      <div>
                        <span className="font-medium text-slate-400">Nominal: </span>
                        <span className={`font-bold text-sm ${item.type === "INCOME" ? "text-green-600" : "text-slate-900"}`}>
                          {item.type === "INCOME" ? "+" : ""} {formatCurrency(nominal)}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedTx(item);
                          setIsDetailOpen(true);
                        }}
                        className="p-1.5 rounded-md text-cyan-600 border border-slate-200 hover:bg-slate-50 transition"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Mobile Pagination */}
          {transactions && transactions.length > 0 && (
            <MobilePaginationWrapper>
              <TablePagination
                page={page}
                totalPages={totalPages}
                limit={limit}
                total={totalItems}
                onPageChange={setPage}
                onLimitChange={setLimit}
              />
            </MobilePaginationWrapper>
          )}
        </div>
      </div>

      <WithdrawalDialog
        open={isWithdrawOpen}
        onOpenChange={setIsWithdrawOpen}
        onSubmit={handleWithdrawalSubmit}
        isPending={createWithdrawal.isPending}
        isAdmin={false}
      />

      <TransactionDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        selectedTx={selectedTx}
        viewMode="creator"
      />
    </TooltipProvider>
  );
}
