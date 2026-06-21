// src/components/payment/transaction-details-card.tsx
import React from "react";
import Image from "next/image";

import { Decimal } from "@prisma/client/runtime/library"; // Assuming this path

interface TransactionDetailsCardProps {
  purchase: {
    id: string;
    amount: Decimal; // Changed to Decimal
    buyerName: string;
    buyerEmail: string;
    buyerPhone: string;
    product: {
      name: string;
      image?: string | null;
      type: string;
    };
  };
  TYPE_MAP: Record<string, string>;
  isFree?: boolean; // Optional, for conditional rendering in success page
  statusMessage: React.ReactNode; // For "✓ Sukses" / "✗ Gagal"
}

export function TransactionDetailsCard({
  purchase,
  TYPE_MAP,
  isFree = false,
  statusMessage,
}: TransactionDetailsCardProps) {
  return (
    <div className="rounded-xl border border-slate-300 bg-white p-6">
      <h3 className="mb-4 pb-3 font-semibold text-slate-800">
        Detail Transaksi
      </h3>

      {/* Product */}
      <div className="flex gap-3 items-center mb-4">
        <div className="w-12 h-12 relative bg-slate-100 rounded-lg overflow-hidden shrink-0">
          {purchase.product.image ? (
            <Image
              src={purchase.product.image}
              alt={purchase.product.name}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
              No Image
            </div>
          )}
        </div>
        <div>
          <p className="font-semibold text-slate-800 text-sm">{purchase.product.name}</p>
          <p className="text-xs text-slate-500">
            {TYPE_MAP[purchase.product.type] ?? purchase.product.type}
          </p>
        </div>
      </div>

      <div className="space-y-2 text-sm border-t border-slate-200 pt-4">
        {/* Only show buyer details if not free/registration success scenario where it might not be relevant */}
        {!isFree && (
          <>
            <div className="flex justify-between items-center text-slate-600">
              <span>Nama</span>
              <span className="font-medium text-slate-700">{purchase.buyerName}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Email</span>
              <span className="font-medium text-slate-700 break-all text-right max-w-[60%]">{purchase.buyerEmail}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>No. HP</span>
              <span className="font-medium text-slate-700">{purchase.buyerPhone}</span>
            </div>
          </>
        )}
        <div className="flex justify-between items-center text-slate-600">
          <span>Status</span>
          {statusMessage}
        </div>
        <div className="flex justify-between items-center text-slate-600">
          <span>ID Transaksi</span>
          <span className="font-mono text-xs text-slate-400">{purchase.id.slice(0, 12)}...</span>
        </div>
        <div className="flex justify-between items-center border-t border-slate-200 pt-2 mt-2">
          <span className="font-semibold text-slate-800">Total Bayar</span>
          <span className="font-bold text-cuan-cyan">
            {isFree ? "Gratis" : `Rp ${Number(purchase.amount).toLocaleString("id-ID")}`}
          </span>
        </div>
      </div>
    </div>
  );
}
