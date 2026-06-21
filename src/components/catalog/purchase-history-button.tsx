"use client";

import React from "react";
import { ReceiptIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function PurchaseHistoryButton() {
  const pathname = usePathname();
  console.log("Current pathname:", pathname);

  // Hide button on Purchase History page or Checkout pages
  if (pathname.includes("/riwayat-pembelian") || pathname.includes("/checkout")) {
    return null;
  }

  return (
    <Link
      href="/riwayat-pembelian"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-400 text-slate-800 shadow-xl border-2 border-slate-800 transition-all duration-300 hover:scale-110 hover:bg-yellow-300 active:scale-95 group"
      title="Riwayat Pembelian"
    >
      <ReceiptIcon size={28} weight="bold" className="group-hover:rotate-12 transition-transform" />
      <span className="absolute right-full mr-3 whitespace-nowrap rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100 hidden md:block border border-slate-700">
        Riwayat Pembelian
      </span>
    </Link>
  );
}
