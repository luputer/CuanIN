"use client";

import React from "react";
import { ShoppingBagIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function PurchaseHistoryButton() {
  const pathname = usePathname();
  // console.log("Current pathname:", pathname);

  // Hide button on Portal page, Checkout pages, or Setup page
  if (pathname === "/portal/dashboard" || pathname.startsWith("/portal/") || pathname.includes("/checkout") || pathname === "/setup") {
    return null;
  }

  return (
    <Link
      href={`/portal/login?ref=${encodeURIComponent(pathname)}`}
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-white shadow-xl border-2 border-slate-300 transition-all duration-300 hover:scale-110 active:scale-95 group"
      title="Portal Pelanggan"
    >
      <ShoppingBagIcon size={28} weight="fill" className="group-hover:rotate-12 transition-transform" />
      <span className="absolute right-full mr-3 whitespace-nowrap rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 shadow-sm opacity-0 transition-opacity group-hover:opacity-100 hidden md:block">
        Portal Pelanggan
      </span>
    </Link>
  );
}
