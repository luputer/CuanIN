"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ImagesIcon,
  DownloadSimpleIcon,
  CaretLeftIcon,
  ArrowLeftIcon,
  ArrowUpRightIcon,
  CircleNotchIcon,
} from "@phosphor-icons/react";
import { api } from "~/trpc/react";
import { CATEGORY_STYLE, CATEGORY_STYLE_DEFAULT, PRODUCT_TYPE_MAP } from "~/lib/constants";
import type { PortalPurchaseType } from "~/types/portal";

const formatIDR = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val);

const formatDate = (date: Date | string) =>
  new Date(date).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default function PortalDetailRiwayatPage() {
  const { id } = useParams<{ id: string }>();
  const { data: purchase, isLoading } = api.purchases.getById.useQuery({ id: id! });
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const { generateInvoicePDF } = await import("~/lib/invoice");
      await new Promise((resolve) => setTimeout(resolve, 50));
      generateInvoicePDF(purchase as unknown as PortalPurchaseType);
    } catch (err) {
      console.error("Gagal mengunduh invoice:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 animate-pulse">
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
          <div className="mb-6 h-8 w-32 rounded-xl bg-slate-200" />
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-5 md:gap-8">
            <div className="space-y-6 lg:col-span-3">
              <div className="h-32 w-full rounded-xl bg-slate-200" />
              <div className="h-64 w-full rounded-xl bg-slate-200" />
            </div>
            <div className="space-y-6 lg:col-span-2">
              <div className="h-72 w-full rounded-xl bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <p className="text-lg font-semibold">Pembelian tidak ditemukan.</p>
          <Link href="/portal/dashboard/riwayat" className="text-sm text-cuan-cyan font-medium hover:underline flex items-center gap-1">
            <ArrowLeftIcon size={14} />
            Kembali ke Riwayat
          </Link>
        </div>
      </div>
    );
  }

  const p = purchase as unknown as PortalPurchaseType;
  const product = p.product;
  const isCompleted = p.status === "completed";
  const isPending = p.status === "pending";
  const isFailed = p.status === "failed";
  const isFree = Number(p.amount) === 0;
  const paidDate = p.paidAt ?? p.createdAt;
  const details = p.paymentDetails as { paymentType?: string; bank?: string; vaNumber?: string } | null;
  const catalogSlug = product.user?.catalog?.slug;
  const productSlug = product.slug;
  const productUrl = catalogSlug && productSlug ? `/${catalogSlug}/${productSlug}` : null;

  return (
    <div className="space-y-6">
      <Link
        href="/portal/dashboard/riwayat"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
      >
        <CaretLeftIcon size={16} />
        Detail Riwayat
      </Link>

      <div className="grid grid-cols-1 items-start gap-6 md:gap-8 lg:grid-cols-5">
        {/* LEFT */}
        <div className="w-full min-w-0 space-y-6 lg:col-span-3 lg:pb-12">
          {/* Product Card */}
          <div className="flex flex-col gap-4 rounded-xl border border-slate-300 bg-white p-4 sm:flex-row sm:items-start">
            <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:w-24 md:w-28 self-start">
              {product.image ? (
                <Image src={product.image} alt={product.name} unoptimized fill className="object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center text-slate-400">
                  <ImagesIcon className="size-10 text-slate-300" />
                </div>
              )}
            </div>
            <div className="mt-0 flex h-full min-w-0 flex-1 flex-col gap-1.5">
              <span className={`w-fit rounded-full border px-2 py-0.5 text-[10px] ${CATEGORY_STYLE[product.type] ?? CATEGORY_STYLE_DEFAULT}`}>
                {PRODUCT_TYPE_MAP[product.type] ?? product.type}
              </span>
              <h2 className="flex items-center gap-1.5 text-base font-bold break-words text-slate-800">
                {product.name}
                {productUrl && (
                  <Link
                    href={productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-slate-400 hover:text-cuan-cyan transition-colors"
                    title="Lihat produk"
                  >
                    <ArrowUpRightIcon size={16} />
                  </Link>
                )}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {product.user?.name ?? "Kreator"}
              </p>
              <div className="mt-1">
                {isFree ? (
                  <div className="text-lg font-semibold text-green-600">Gratis</div>
                ) : (
                  <div className="text-lg font-bold text-cuan-cyan">
                    {formatIDR(Number(p.amount))}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Data Diri */}
          <div className="rounded-xl border border-slate-300 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-slate-700">Data Diri</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-baseline gap-2">
                <span className="text-slate-500 min-w-16">Nama:</span>
                <span className="font-medium text-slate-800">{p.buyerName}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-slate-500 min-w-16">Email:</span>
                <span className="font-medium text-slate-800">{p.buyerEmail}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-slate-500 min-w-16">No HP:</span>
                <span className="font-medium text-slate-800">{p.buyerPhone ?? "-"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="w-full min-w-0 lg:sticky lg:top-24 lg:col-span-2 lg:h-fit lg:self-start">
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-300 bg-white p-6">
              <h3 className="mb-4 pb-3 font-semibold text-slate-800">
                Detail Pembayaran
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">ID Transaksi</span>
                  <span className="font-mono text-xs font-medium text-slate-600 break-all max-w-[180px] text-right">
                    {p.id}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Status</span>
                  <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${isCompleted ? "bg-emerald-100 text-emerald-700" :
                    isPending ? "bg-yellow-100 text-yellow-700" :
                      isFailed ? "bg-red-100 text-red-700" :
                        "bg-slate-100 text-slate-500"
                    }`}>
                    {isCompleted ? "Berhasil" : isPending ? "Pending" : isFailed ? "Gagal" : "Kadaluarsa"}
                  </span>
                </div>

                {!isFree && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Metode</span>
                      <span className="font-medium text-slate-800">
                        {p.paymentMethod ?? details?.paymentType ?? "—"}
                      </span>
                    </div>
                    {details?.vaNumber && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">VA Number</span>
                        <span className="font-medium font-mono text-slate-800 text-xs">
                          {details.vaNumber}
                        </span>
                      </div>
                    )}
                  </>
                )}

                <div className="h-px bg-slate-200" />

                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Harga</span>
                  {isFree ? (
                    <span className="font-semibold text-green-600">Gratis</span>
                  ) : (
                    <span className="font-medium text-slate-700">{formatIDR(Number(p.amount))}</span>
                  )}
                </div>

                <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                  <span className="font-semibold text-slate-800">Total</span>
                  {isFree ? (
                    <span className="font-bold text-green-600">Gratis</span>
                  ) : (
                    <span className="font-bold text-cuan-cyan">{formatIDR(Number(p.amount))}</span>
                  )}
                </div>
                <div className="pt-2 text-[11px] text-slate-400 text-center">
                  Dibeli pada {formatDate(paidDate)}
                </div>
              </div>

              {isCompleted && (
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="mt-6 w-full cursor-pointer rounded-xl bg-cuan-cyan py-3 text-lg font-semibold text-white transition-colors duration-200 hover:bg-[#008BB5] disabled:bg-slate-400 flex items-center justify-center gap-2"
                >
                  {isDownloading ? (
                    <>
                      <CircleNotchIcon size={20} className="animate-spin" />
                      Menyusun PDF...
                    </>
                  ) : (
                    <>
                      <DownloadSimpleIcon size={20} />
                      Download Invoice
                    </>
                  )}
                </button>
              )}

              {productUrl && (
                <Link
                  href={productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <ArrowUpRightIcon size={18} />
                  Beli Lagi
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
