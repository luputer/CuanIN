import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import SearchInput from "~/components/ui/search";
import {
  CalendarDotsIcon,
  ArrowRightIcon,
  FileIcon,
  ClockIcon,
  ImagesIcon,
} from "@phosphor-icons/react";

// ─── Tipe Dummy Data ────────────────────────────────────────────────────────

const CATEGORY_STYLE: Record<string, string> = {
  Webinar: "bg-cyan-100 text-cyan-700 border-cyan-200",
  Kelas: "bg-amber-100 text-amber-700 border-amber-200",
  "Produk Digital": "bg-emerald-100 text-emerald-700 border-emerald-200",
};

// ─── Komponen Kartu Produk Preview ──────────────────────────────────────────

function PreviewProductCard({
  name,
  shortDescription,
  type,
  price,
  extraInfo,
  icon,
}: {
  name: string;
  shortDescription: string;
  type: "Webinar" | "Kelas" | "Produk Digital";
  price: number;
  extraInfo: string;
  icon: React.ReactNode;
}) {
  const isGratis = price === 0;

  return (
    <div className="group relative flex h-full cursor-default flex-col overflow-hidden rounded-xl border border-slate-300 bg-white px-3 py-3 transition-transform duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] shadow-sm">
      {/* Thumbnail */}
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-slate-100">
        <span
          className={`absolute top-2 left-2 z-10 rounded-full border px-3 py-0.5 text-[9px] font-semibold ${CATEGORY_STYLE[type]} shadow-sm`}
        >
          {type}
        </span>
        {/* Placeholder Thumbnail Gradient */}
        <div className="h-full w-full bg-gradient-to-tr from-slate-200 to-slate-100 opacity-60"></div>
        <div className="absolute text-slate-300">
          <ImagesIcon size={32} weight="duotone" />
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between pt-3">
        <div>
          <p className="mb-1.5 line-clamp-2 text-sm font-semibold leading-snug text-slate-800">
            {name}
          </p>
          <p className="mb-2 line-clamp-2 min-h-[2rem] text-[10px] leading-snug text-slate-500 font-medium">
            {shortDescription}
          </p>
          <p className="flex items-center gap-1 text-[10px] font-semibold text-slate-700">
            {icon}
            {extraInfo}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between">
          {isGratis ? (
            <span className="text-xs font-bold text-green-600">Gratis</span>
          ) : (
            <span className="text-xs font-bold text-cyan-600">
              Rp {price.toLocaleString("id-ID")}
            </span>
          )}

          <div className="rounded-full bg-slate-200 p-1 text-slate-800 transition-colors">
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Komponen Utama Preview ──────────────────────────────────────────────────

export default function CatalogPreview() {
  return (
    <div className="flex h-full w-full overflow-hidden rounded-xl border-2 border-slate-800 bg-slate-50 shadow-[0px_3px_0px_rgba(30,27,75)] relative z-10 select-none">
      <div className="h-full w-full overflow-y-auto no-scrollbar pb-10 pointer-events-none">

        {/* ── Banner Section ── */}
        <div className="relative h-24 sm:h-32 lg:h-40 w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-white via-yellow-200 to-white opacity-90 mix-blend-multiply"></div>
          {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "20px 20px" }}></div>
        </div>

        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          {/* ── Profile Section ── */}
          <div className="relative z-10 -mt-10 sm:-mt-12 flex flex-col items-center pb-4 text-center">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-full border-4 border-white bg-white shadow-md">
              <AvatarFallback className="bg-yellow-300 text-2xl font-bold text-slate-800">
                CR
              </AvatarFallback>
            </Avatar>

            <h1 className="mt-2 text-base sm:text-lg font-semibold text-slate-800">
              Creator Studio
            </h1>

            <p className="mt-1 max-w-lg text-xs sm:text-sm text-slate-600 px-4">
              Membantu kamu belajar skill digital terbaru dari ahlinya langsung. Mari tingkatkan potensimu bersama kami!
            </p>

            {/* Statistik */}
            <div className="mt-4 flex items-center gap-4 sm:gap-6 rounded-full border border-slate-200 bg-white px-6 sm:px-8 py-2 sm:py-3 text-xs sm:text-sm shadow-sm">
              <span className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-bold text-cyan-600">3</span>
                <span className="text-slate-600 font-medium">Produk</span>
              </span>

              <div className="h-4 border-r border-slate-300"></div>

              <span className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-bold text-cyan-600">1.2K</span>
                <span className="text-slate-600 font-medium">Terjual</span>
              </span>
            </div>
          </div>

          {/* ── Filter & Search Section ── */}
          <div className="mt-4 sm:mt-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
              <div className="w-full sm:w-64">
                <div className="relative">
                  <SearchInput
                    value=""
                    onChange={() => undefined}
                    placeholder="Cari produk..."
                    className="w-full rounded-full border border-slate-400 shadow-none h-9 text-sm"
                  />
                  {/* Div overlay untuk mencegah pengetikan pada dummy */}
                  <div className="absolute inset-0 z-10 cursor-default" />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                {["Semua", "Webinar", "Kelas", "Produk Digital"].map((tab, idx) => (
                  <button
                    key={tab}
                    className={`shrink-0 rounded-full px-4 py-1.5 text-[11px] sm:text-xs font-medium transition-all duration-200 ${idx === 0
                      ? "bg-cyan-600 text-white"
                      : "border border-slate-400 bg-white text-slate-600 hover:bg-cyan-50"
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Product Grid ── */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <PreviewProductCard
                name="Mastering UI/UX Design 2026"
                shortDescription="Belajar desain antarmuka dari nol sampai mahir dengan Figma."
                type="Webinar"
                price={150000}
                extraInfo="15 Mei 2026, 19:00"
                icon={<CalendarDotsIcon weight="fill" className="text-cyan-600" />}
              />
              <PreviewProductCard
                name="Kelas Jago React Next.js"
                shortDescription="Bangun aplikasi web modern skala industri dengan panduan komprehensif."
                type="Kelas"
                price={350000}
                extraInfo="Durasi 10 Jam"
                icon={<ClockIcon weight="fill" className="text-amber-600" />}
              />
              <PreviewProductCard
                name="Template Notion Produktivitas"
                shortDescription="Sistem manajemen tugas dan waktu lengkap siap pakai untuk pelajar dan profesional."
                type="Produk Digital"
                price={0}
                extraInfo="Notion Template"
                icon={<FileIcon weight="fill" className="text-emerald-600" />}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
