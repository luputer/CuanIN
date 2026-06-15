"use client";

import Image from "next/image";
import Link from "next/link";
import {
  CalendarBlankIcon,
  ClockIcon,
  FileIcon,
  ImagesIcon,
} from "@phosphor-icons/react";
import { CATEGORY_STYLE, CATEGORY_STYLE_DEFAULT, getProductTypeLabel } from "~/lib/constants";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CatalogProductCardProps {
  /** slug kreator, dipakai untuk membangun href */
  creatorSlug: string;
  /** slug / id produk */
  productSlug: string;
  id: string;
  name: string;
  shortDescription?: string | null;
  type: string;
  price: number;
  discountPrice?: number | null;
  image?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  contentType?: string | null;
  duration?: string | null;
  status?: string | null;
}

// ─── Extra Info (tanggal / tipe / durasi) ──────────────────────────────────

function ExtraInfo({
  type,
  startDate,
  contentType,
  duration,
}: Pick<CatalogProductCardProps, "type" | "startDate" | "contentType" | "duration">) {
  if (type === "WEBINAR" && startDate) {
    const date = new Date(startDate);
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

  if (type === "DIGITAL_PRODUCT" && contentType) {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-slate-600">
        <FileIcon weight="fill" />
        {contentType}
      </span>
    );
  }

  if (type === "KELAS_ONLINE" && duration) {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-slate-600">
        <ClockIcon weight="fill" />
        {duration}
      </span>
    );
  }

  return null;
}

// ─── Main Card ────────────────────────────────────────────────────────────────

export function CatalogProductCard({
  creatorSlug,
  productSlug,
  id,
  name,
  shortDescription,
  type,
  price,
  discountPrice,
  image,
  startDate,
  endDate,
  contentType,
  duration,
  status,
}: CatalogProductCardProps) {
  const hasDiscount =
    discountPrice != null && discountPrice > 0 && discountPrice < price;
  const displayPrice = hasDiscount ? discountPrice! : price;
  const isGratis = displayPrice === 0;
  const categoryLabel = getProductTypeLabel(type);

  const isWebinarCompleted =
    type === "WEBINAR" &&
    ((endDate && new Date() > new Date(endDate)) || status === "archived");

  // Guard mock IDs (dipakai di halaman rekomendasi)
  const href = id.startsWith("mock-")
    ? "#"
    : `/${creatorSlug}/${productSlug || id}`;

  return (
    <Link href={href} className="block h-full">
      <div className="group relative h-full flex flex-col cursor-pointer overflow-hidden rounded-xl border border-slate-300 bg-white px-4 py-4 transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 hover:border-slate-400">
        {/* Thumbnail */}
        <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-slate-100">
          {/* Category badge */}
          {categoryLabel && (
            <span
              className={`absolute top-2 left-2 z-10 rounded-full border px-4 py-0.5 text-[10px] font-medium ${CATEGORY_STYLE[type] ?? CATEGORY_STYLE_DEFAULT}`}
            >
              {categoryLabel}
            </span>
          )}

          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <ImagesIcon className="h-10 w-10 text-slate-300" strokeWidth={1.2} />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-between space-y-1.5 pt-4">
          <div>
            <p className="mb-2 line-clamp-2 text-sm leading-snug font-semibold text-slate-800">
              {name}
            </p>
            <p className="font-regular mb-2 line-clamp-2 min-h-[2rem] text-xs leading-snug text-slate-600">
              {shortDescription}
            </p>
            <ExtraInfo
              type={type}
              startDate={startDate}
              contentType={contentType}
              duration={duration}
            />
          </div>

          <div className="mt-2 flex flex-col gap-2.5">
            {/* Harga */}
            <div>
              {isGratis ? (
                <span className="text-md font-semibold text-green-600">Gratis</span>
              ) : hasDiscount ? (
                <div className="flex flex-col">
                  <span className="text-md font-semibold text-cyan-600">
                    Rp {Number(discountPrice).toLocaleString("id-ID")}
                  </span>
                  <span className="text-xs font-medium text-slate-400 line-through">
                    Rp {price.toLocaleString("id-ID")}
                  </span>
                </div>
              ) : (
                <span className="text-md font-semibold text-cyan-600">
                  Rp {price.toLocaleString("id-ID")}
                </span>
              )}
            </div>

            {/* CTA */}
            {isWebinarCompleted ? (
              <div className="w-full flex items-center justify-center gap-1.5 rounded-md bg-slate-200 py-2 px-4 text-sm font-semibold text-slate-500 transition-all duration-300">
                <span>Sudah Selesai</span>
              </div>
            ) : (
              <div className="w-full flex items-center justify-center gap-1.5 rounded-md bg-cyan-600 py-2 px-4 text-sm font-semibold text-white transition-all duration-300 shadow-sm hover:bg-cyan-700 hover:shadow-md">
                <span>Beli Sekarang</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function CatalogProductCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="aspect-square w-full rounded-xl bg-slate-200" />
      <div className="mt-4 space-y-2">
        <div className="h-4 w-3/4 rounded-full bg-slate-200" />
        <div className="h-3 w-full rounded-full bg-slate-200" />
        <div className="h-3 w-2/3 rounded-full bg-slate-200" />
        <div className="mt-3 h-4 w-1/3 rounded-full bg-slate-200" />
        <div className="h-9 w-full rounded-md bg-slate-200" />
      </div>
    </div>
  );
}
