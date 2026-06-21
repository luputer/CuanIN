// src/components/payment/payment-action-and-security.tsx
import React from "react";
import { ArrowCounterClockwiseIcon, ShieldCheckIcon } from "@phosphor-icons/react";

interface PaymentActionAndSecurityProps {
  xenditInvoiceUrl?: string | null;
  isFree?: boolean;
  hasFailed?: boolean;
}

export function PaymentActionAndSecurity({
  xenditInvoiceUrl,
  isFree = false,
  hasFailed = false,
}: PaymentActionAndSecurityProps) {
  return (
    <>
      {/* RETRY BUTTON (only for failed payments with invoice URL) */}
      {xenditInvoiceUrl && hasFailed && (
        <a
          href={xenditInvoiceUrl}
          className="w-full py-3.5 bg-cuan-cyan hover:bg-007EA5 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition"
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
