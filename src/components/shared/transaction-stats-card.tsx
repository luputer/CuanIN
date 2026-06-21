import { WalletIcon, ArrowUpRightIcon, TrendUpIcon, ReceiptIcon } from "@phosphor-icons/react";
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
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-white shadow-[0px_1px_0px_#000] md:flex-row">
      {/* Balance Section */}
      <div className="flex flex-1 flex-col justify-between border-b border-slate-200 p-5 md:border-r md:border-b-0">
        <div className="mb-3 flex items-center gap-2">
          <WalletIcon className="h-5 w-5 text-cuan-blue" weight="fill" />
          <span className="text-sm font-semibold text-slate-800">Saldo saat ini</span>
        </div>
        <div className="flex flex-col gap-1 mb-2">
          <h2 className="text-2xl font-semibold text-cuan-blue">
            {isLoading && !data ? (
              <Skeleton className="h-8 w-40" />
            ) : (
              formatCurrency(stats.balance)
            )}
          </h2>
        </div>
        <div className="flex items-center justify-between text-xs font-medium text-slate-700">
          {isAdmin && <span>(Saldo yang dapat ditarik)</span>}
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
      <div className="flex flex-1 flex-col justify-between border-b border-slate-200 p-5 md:border-r md:border-b-0">
        <div className="mb-3 flex items-center gap-2">
          <TrendUpIcon className="h-5 w-5 text-cuan-blue" weight="fill" />
          <span className="text-sm font-semibold text-slate-800">Total Penghasilan</span>
        </div>
        <div className="flex flex-col gap-1 mb-2">
          <h3 className="text-2xl font-semibold text-cuan-blue">
            {isLoading && !data ? (
              <Skeleton className="h-7 w-32" />
            ) : (
              formatCurrency(stats.totalIncome)
            )}
          </h3>
        </div>
        <div className="flex items-center justify-between text-xs font-medium text-slate-700">
          <span>30 hari terakhir</span>
          <span
            className={`rounded-md px-3 py-1 text-sm font-medium border border-slate-800 ${stats.incomeChange >= 0
              ? "bg-green-200 text-slate-800"
              : "bg-red-100 text-slate-800"
              }`}
          >
            {stats.incomeChange >= 0 ? "+" : "-"}
            {Math.min(100, Math.abs(stats.incomeChange)).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Total Transaction */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div className="mb-3 flex items-center gap-2">
          <ReceiptIcon className="h-5 w-5 text-cuan-blue" weight="fill" />
          <span className="text-sm font-semibold text-slate-800">
            {isAdmin ? "Total Penarikan" : "Total Transaksi"}
          </span>
        </div>
        <div className="flex flex-col gap-1 mb-2">
          <h3 className="text-2xl font-semibold text-cuan-blue">
            {isLoading && !data ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              stats.totalTransactions
            )}
          </h3>
        </div>
        <div className="flex items-center justify-between text-xs font-medium text-slate-700">
          <span>30 hari terakhir</span>
          <span
            className={`rounded-md px-3 py-1 text-sm font-medium border border-slate-800 ${stats.transactionsChange >= 0
              ? "bg-green-200 text-slate-800"
              : "bg-red-100 text-slate-800"
              }`}
          >
            {stats.transactionsChange >= 0 ? "+" : "-"}
            {Math.min(100, Math.abs(stats.transactionsChange)).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}
