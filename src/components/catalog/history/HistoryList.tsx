"use client";

import Link from "next/link";
import Image from "next/image";
import { ImagesIcon, CalendarBlankIcon, ClockIcon, FileIcon } from "@phosphor-icons/react";
import { CATEGORY_STYLE, CATEGORY_STYLE_DEFAULT } from "~/lib/constants";

// Reusing the same ExtraInfo logic logic if possible or keeping it simple here
function ExtraInfo({
  type,
  product,
}: {
  type: string;
  product: any;
}) {
  if (type === "WEBINAR" && product.startDate) {
    const date = new Date(product.startDate);
    const tanggal = date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const jam = date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-slate-600">
        <CalendarBlankIcon weight="fill" />
        {tanggal}, {jam}
      </span>
    );
  }

  if (type === "DIGITAL_PRODUCT" && product.contentType) {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-slate-600">
        <FileIcon weight="fill" />
        {product.contentType}
      </span>
    );
  }

  if (type === "KELAS_ONLINE" && product.duration) {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-slate-600">
        <ClockIcon weight="fill" />
        {product.duration}
      </span>
    );
  }

  return null;
}

const CATEGORY_NAME: Record<string, string> = {
  WEBINAR: "Webinar",
  KELAS_ONLINE: "Kelas",
  DIGITAL_PRODUCT: "Produk Digital",
};

export function HistoryList({ purchases, isLoading }: { purchases: any[]; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-64 w-full rounded-xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {purchases.map((p: any) => (
        <Link
          href={`/riwayat-pembelian/${p.id}`}
          key={p.id}
          className="group relative h-full flex flex-col cursor-pointer overflow-hidden rounded-xl border border-slate-300 bg-white p-4 transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 hover:border-slate-400"
        >
          {/* Thumbnail */}
          <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-slate-100">
            {p.product.image ? (
              <Image
                src={p.product.image}
                alt={p.product.name}
                fill
                className="object-cover"
              />
            ) : (
              <ImagesIcon className="h-10 w-10 text-slate-300" strokeWidth={1.2} />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 flex flex-col justify-between pt-4">
            <div>
              <p className="mb-1 line-clamp-2 text-sm leading-snug font-semibold text-slate-800">
                {p.product.name}
              </p>

              <div className="mb-2">
                <span
                  className={`inline-block rounded-full border px-2 py-0.5 text-[9px] font-medium ${CATEGORY_STYLE[p.product.type] ?? CATEGORY_STYLE_DEFAULT}`}
                >
                  {CATEGORY_NAME[p.product.type] ?? p.product.type}
                </span>
              </div>

              <ExtraInfo type={p.product.type} product={p.product} />
            </div>

            <div className="mt-auto flex items-center justify-between">
              <div className="text-md font-semibold text-cyan-600">
                {Number(p.amount) === 0 ? 'Gratis' : `Rp ${Number(p.amount).toLocaleString("id-ID")}`}
              </div>
              <div className="text-right text-xs text-slate-500">
                <p>
                  {new Date(p.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <span className={`font-semibold ${p.status === 'completed' ? 'text-emerald-700' : 'text-yellow-700'}`}>
                  {p.status === 'completed' ? 'Berhasil' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
