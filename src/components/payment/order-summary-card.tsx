// src/components/payment/order-summary-card.tsx
import React from "react";
import { ShieldCheckIcon } from "@phosphor-icons/react";
import { CardContainer } from "~/components/ui/card-container";
import { DataList } from "~/components/ui/data-list";

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
  return (
    <CardContainer>
      <h3 className="mb-4 border-b border-slate-300 pb-3 font-semibold text-slate-800">
        Detail Pembayaran
      </h3>

      <DataList
        items={[
          {
            label: "Harga Produk",
            value: `Rp ${price.toLocaleString("id-ID")}`,
          },
          ...(fee > 0
            ? [{ label: "Biaya Layanan", value: `Rp ${fee.toLocaleString("id-ID")}` }]
            : []),
          {
            label: "Total Bayar",
            value: (
              <span className="font-bold text-cyan-600">
                Rp {(price + fee).toLocaleString("id-ID")}
              </span>
            ),
          },
        ]}
      />

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
