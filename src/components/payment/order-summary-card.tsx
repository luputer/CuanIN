// src/components/payment/order-summary-card.tsx
import React from "react";
import { ShieldCheckIcon } from "@phosphor-icons/react";
import { CardContainer } from "~/components/ui/card-container";

interface OrderSummaryCardProps {
  price: number;
  fee: number;
  handlePay: () => void;
  isPending: boolean;
}

export function OrderSummaryCard({
  price,
  fee,
  handlePay,
  isPending,
}: OrderSummaryCardProps) {
  const finalPrice = price + fee;

  return (
    <CardContainer shadow={false}>
      <h3 className="mb-4 font-semibold text-slate-800">
        Detail Pembayaran
      </h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-slate-600">Harga Produk</span>
          <span className="font-medium text-slate-700">
            Rp {price.toLocaleString("id-ID")}
          </span>
        </div>

        {fee > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Biaya Layanan</span>
            <span className="font-medium text-slate-700">
              Rp {fee.toLocaleString("id-ID")}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center border-t border-slate-200 pt-2">
          <span className="font-semibold text-slate-800">Total Bayar</span>
          <span className="font-bold text-cyan-600">
            Rp {finalPrice.toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={handlePay}
        disabled={isPending}
        className="mt-6 w-full cursor-pointer rounded-xl bg-cyan-600 py-3 text-lg font-semibold text-white shadow-sm hover:bg-cyan-700 transition disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Memproses..." : "Bayar Sekarang"}
      </button>

      <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
        <ShieldCheckIcon className="h-4 w-4" />
        Aman & terenkripsi
      </div>
    </CardContainer>
  );
}
