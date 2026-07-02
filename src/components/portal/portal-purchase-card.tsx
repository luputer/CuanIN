"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CATEGORY_STYLE, CATEGORY_STYLE_DEFAULT, PRODUCT_TYPE_MAP } from "~/lib/constants";
import {
  ImagesIcon,
  NoteIcon,
  DownloadSimpleIcon,
  EyeIcon,
  CircleNotchIcon,
} from "@phosphor-icons/react";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import type { PortalPurchaseType } from "~/types/portal";

export function PortalPurchaseCard({ purchase, isHistoryTab }: { purchase: PortalPurchaseType; isHistoryTab: boolean }) {
  const router = useRouter();
  const [isDownloading, setIsDownloading] = useState(false);
  const product = purchase.product;

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setIsDownloading(true);
      const { generateInvoicePDF } = await import("~/lib/invoice");
      await new Promise((resolve) => setTimeout(resolve, 50));
      generateInvoicePDF(purchase);
    } catch (err) {
      console.error("Gagal mengunduh invoice:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const cardContent = (
    <div className="relative h-full flex flex-col cursor-pointer overflow-hidden rounded-xl border border-slate-300 bg-white px-4 py-4">
      {/* Thumbnail */}
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-slate-100">
        {product.image ? (
          <Image src={product.image} alt={product.name} fill className="object-cover" unoptimized />
        ) : (
          <ImagesIcon className="h-10 w-10 text-slate-300" strokeWidth={1.2} />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between space-y-1.5 pt-4">
        <div>
          <div className="mb-1.5">
            <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${CATEGORY_STYLE[product.type] ?? CATEGORY_STYLE_DEFAULT}`}>
              {PRODUCT_TYPE_MAP[product.type] ?? product.type}
            </span>
          </div>
          <p className="mb-1 line-clamp-2 text-sm leading-snug font-semibold text-slate-800">
            {product.name}
          </p>
          <p className="text-xs text-slate-500 font-medium mb-1">
            {product.user?.name ?? "Kreator"}
          </p>

          {isHistoryTab && (
            <div className="mt-2 text-xs font-medium text-slate-500">
              {Number(purchase.amount) === 0 ? (
                <span className="font-semibold text-green-600">Gratis</span>
              ) : (
                <span className="font-semibold text-slate-800">
                  Rp{Number(purchase.amount).toLocaleString("id-ID")}
                </span>
              )}
              <span className="mx-1.5">·</span>
              {purchase.status === "completed" && <span className="text-emerald-600">Berhasil</span>}
              {purchase.status === "pending" && <span className="text-yellow-600">Pending</span>}
              {purchase.status === "failed" && <span className="text-red-600">Gagal</span>}
              {purchase.status === "expired" && <span className="text-slate-400">Kadaluarsa</span>}
            </div>
          )}

        </div>

        <div className="mt-4 flex flex-col gap-2.5">
          {/* Action Area (Dashboard) */}
          {!isHistoryTab && (
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const url = Array.isArray(product.links) ? (product.links[0] as string) : "#";
                  if (url && url !== "#") window.open(url, "_blank", "noopener,noreferrer");
                }}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-cuan-cyan py-2 px-4 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[#008BB5] cursor-pointer"
              >
                Masuk ke Produk
              </button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/portal/dashboard/produk/${purchase.id}`);
                    }}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-400 bg-white text-slate-800 transition-colors hover:bg-slate-100 cursor-pointer"
                  >
                    <EyeIcon size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Lihat Detail</TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* Actions (History) */}
          {isHistoryTab && (
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center justify-center gap-1.5 rounded-md border border-cuan-cyan py-2 px-4 text-sm font-semibold text-cuan-cyan transition-colors duration-200 hover:bg-cuan-cyan/10">
                Lihat Detail
              </div>
              {purchase.status === "completed" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-slate-800 border border-slate-400 hover:bg-slate-100 disabled:bg-slate-200 disabled:text-slate-400 shadow-sm cursor-pointer"
                    >
                      {isDownloading ? (
                        <CircleNotchIcon size={16} className="animate-spin" />
                      ) : (
                        <DownloadSimpleIcon size={16} />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Download Invoice</TooltipContent>
                </Tooltip>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isHistoryTab) {
    return (
      <Link href={`/portal/dashboard/riwayat/${purchase.id}`} className="block h-full">
        {cardContent}
      </Link>
    );
  }

  return (
    <Link href={`/portal/dashboard/produk/${purchase.id}`} className="block h-full">
      {cardContent}
    </Link>
  );
}
