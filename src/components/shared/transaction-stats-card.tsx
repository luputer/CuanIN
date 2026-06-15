import { WalletIcon, ArrowUpRightIcon } from "@phosphor-icons/react";
import { Skeleton } from "~/components/ui/skeleton";
import ActionButton from "~/components/shared/button-add";
import { formatCurrency } from "~/lib/utils";

interface TransactionStatsCardProps {
  isLoading: boolean;
  data: any;
  stats: {
    balance: number;
    totalIncome: number;
    incomeChange: number;
    totalTransactions: number;
    transactionsChange: number;
  };
  onWithdraw?: () => void;
  isAdmin?: boolean;
}

export function TransactionStatsCard({
  isLoading,
  data,
  stats,
  onWithdraw,
  isAdmin = false,
}: TransactionStatsCardProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-cyan-50 p-0 shadow-[0px_1px_0px_rgba(29,41,61)] md:flex-row">
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
          {onWithdraw && (
            <ActionButton
              label="Tarik Saldo"
              icon={ArrowUpRightIcon}
              variant="secondary"
              onClick={onWithdraw}
            />
          )}
        </div>
      </div>

      {/* Total Income */}
      <div className="flex flex-col justify-center border-b border-slate-200 p-6 md:w-72 md:border-r md:border-b-0">
        <p className="mb-2 text-xs font-bold text-slate-700">Total Penghasilan</p>
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
            className={`rounded-full px-2 py-1 font-medium ${
              stats.incomeChange >= 0
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {stats.incomeChange >= 0 ? "+" : ""}
            {Math.min(100, Math.abs(stats.incomeChange)).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Total Transaction */}
      <div className="flex flex-col justify-center p-6 md:w-72">
        <p className="mb-2 text-xs font-bold text-slate-700">
          {isAdmin ? "Total Penarikan" : "Total Transaksi"}
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
            className={`rounded-full px-2 py-1 font-medium ${
              stats.transactionsChange >= 0
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {stats.transactionsChange >= 0 ? "+" : ""}
            {Math.min(100, Math.abs(stats.transactionsChange)).toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}
