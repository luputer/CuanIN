"use client";

import React from "react";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { ImagesIcon, ShoppingBagIcon } from "@phosphor-icons/react";
import { Star15 } from "~/components/stars/s15";
import Star8 from "~/components/stars/s8";

// ─── Tipe Dummy Data ────────────────────────────────────────────────────────


const CATEGORY_STYLE: Record<string, string> = {
  Webinar: "bg-cyan-100 text-cyan-700 border-cyan-200",
  Kelas: "bg-amber-100 text-amber-700 border-amber-200",
  "Produk Digital": "bg-emerald-100 text-emerald-700 border-emerald-200",
};

// ─── Komponen Gabungan (Browser Mockup + Katalog) ───────────────────────────

export default function CatalogMockup({ className = "" }: { className?: string }) {
  return (
    <div className={`web-container relative w-full ${className} z-0 scale-90 sm:scale-100 origin-top`}>
      {/* Decorative Star8 above browser */}
      <div className="absolute -top-8 -right-10 z-20">
        <Star8 size={36} className="text-yellow-300 rotate-2" stroke="black" strokeWidth={6} />
      </div>

      {/* Browser Frame */}
      <div className="border-2 border-slate-800 shadow-[2px_2px_0px_#000] rounded-xl bg-white relative z-10 overflow-hidden">
        {/* Fake Browser Toolbar */}
        <div className="border-b-2 border-slate-800 rounded-t-xl bg-slate-100 p-4 flex gap-1.5 items-center">
          <div className="w-3 h-3 rounded-full bg-cyan-300 border border-black"></div>
          <div className="w-3 h-3 rounded-full bg-amber-300 border border-black"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-300 border border-black"></div>
        </div>

        {/* Catalog Content */}
        <div className="relative">
          <div className="h-full w-full bg-slate-50 overflow-y-auto no-scrollbar pb-6 pointer-events-none">
            {/* Banner Pendek */}
            <div className="relative h-16 w-full bg-cuan-blue/20"></div>

            <div className="mx-auto max-w-5xl px-4 lg:px-6">
              {/* Profile Section */}
              <div className="relative z-10 -mt-10 flex flex-col items-center pb-6 text-center">
                <Avatar className="h-16 w-16 rounded-full border-4 border-white bg-white shadow-sm">
                  <AvatarFallback className="bg-cuan-blue/60 text-xl font-bold text-white">
                    K
                  </AvatarFallback>
                </Avatar>
                <h1 className="mt-2 text-base font-semibold text-slate-800">Kreator CuanIN</h1>
                <p className="text-xs text-slate-600">Ubah Keahlian Jadi Penghasilan.</p>
              </div>

              {/* Product Grid (Skeleton) */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { name: "Mastering UI/UX", type: "Webinar" },
                  { name: "Kelas React Next.js", type: "Kelas" },
                  { name: "Template Notion gratis", type: "Produk Digital" },
                ].map((product, i) => (
                  <div key={i} className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-300 bg-white px-3 py-3">
                    <div className="flex h-20 w-full items-center justify-center overflow-hidden rounded-lg bg-slate-100 mb-3">
                      <ShoppingBagIcon size={32} weight="duotone" className="text-slate-300" />
                    </div>
                    <div className="flex-1">
                      {/* Mobile Skeleton */}
                      <div className="h-3 w-16 bg-slate-200 rounded-full sm:hidden"></div>

                      {/* Desktop/Tablet Category */}
                      <span className={`hidden sm:inline-block rounded-full px-3 py-1 text-[10px] font-semibold ${CATEGORY_STYLE[product.type]}`}>
                        {product.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Star Icon (Behind Browser Frame) */}
      <div className="absolute -bottom-14 -right-14 z-0 animate-[spin_20s_linear_infinite]">
        <Star15 size={180} className="text-cuan-cyan/50" stroke="black" strokeWidth={2} />
      </div>
      <div className="absolute top-45 -left-18 z-0 animate-[spin_30s_linear_infinite_reverse]">
        <Star15 size={140} className="text-cuan-blue/50" stroke="black" strokeWidth={2} />
      </div>
    </div>
  );
}
