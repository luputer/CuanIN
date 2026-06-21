// src/components/payment/payment-action-and-security.tsx
import React from "react";
import { ArrowCounterClockwiseIcon, ShieldCheckIcon } from "@phosphor-icons/react";

interface PaymentActionAndSecurityProps {
  purchaseId?: string | null;
  isFree?: boolean;
  hasFailed?: boolean;
}

export function PaymentActionAndSecurity({
  purchaseId,
  isFree = false,
  hasFailed = false,
}: PaymentActionAndSecurityProps) {
  return (
    <>
      {purchaseId && hasFailed && (
        <a
          href={`/payment/${purchaseId}`}
          className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition"
        >
          <ArrowCounterClockwiseIcon className="w-4 h-4" />
          Coba Bayar Lagi
        </a>
      )}

      <div className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
        <ShieldCheckIcon className="w-3.5 h-3.5" />
        {isFree ? "Pendaftaran aman & terverifikasi" : "Transaksi aman & terenkripsi"}
      </div>
    </>
  );
}
