"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import {
  CreditCardIcon,
  ImagesIcon,
} from "@phosphor-icons/react";
import { api } from "~/trpc/react";
import { CatalogNavHeader } from "~/components/layout/catalog-nav-header";

const CATEGORY_STYLE: Record<string, string> = {
  WEBINAR: "bg-cyan-100 text-cyan-700 border-cyan-200",
  KELAS_ONLINE: "bg-amber-100 text-amber-700 border-amber-200",
  DIGITAL_PRODUCT: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const CATEGORY_NAME: Record<string, string> = {
  WEBINAR: "Webinar",
  KELAS_ONLINE: "Kelas",
  DIGITAL_PRODUCT: "Produk Digital",
};

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

const formatTime = (date: Date | string) =>
  new Date(date).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

export default function PurchaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: purchase, isLoading } = api.purchases.getById.useQuery({ id: id! });

  if (isLoading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (!purchase) {
    return <div className="p-10 text-center">Pembelian tidak ditemukan</div>;
  }

  const p = purchase;
  const isCompleted = p.status === "completed";
  const isFree = Number(p.amount) === 0;
  const paidDate = p.paidAt ?? p.createdAt;

  return (
    <div className="min-h-screen bg-slate-50">
      <CatalogNavHeader backHref="/riwayat-pembelian" />

      <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
        <h1 className="mb-6 md:mb-8 text-2xl md:text-3xl font-bold text-slate-800">
          Detail Pembelian
        </h1>

        <div className="grid grid-cols-1 items-start gap-6 md:gap-8 lg:grid-cols-5">
          {/* Main Info */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex flex-col gap-5 rounded-xl border border-slate-300 bg-white p-5 sm:flex-row sm:items-start">
              <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:w-40 md:w-44 lg:w-48 self-start">
                {p.product.image ? (
                  <Image src={p.product.image} alt={p.product.name} unoptimized fill className="object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center text-slate-400">
                    <ImagesIcon className="size-12 text-slate-300" />
                  </div>
                )}
              </div>
              <div className="flex h-full min-w-0 flex-1 flex-col justify-between">
                <div>
                  <span className={`w-fit rounded-full border px-3 py-1 text-xs ${CATEGORY_STYLE[p.product.type]}`}>
                    {CATEGORY_NAME[p.product.type] ?? p.product.type}
                  </span>
                  <h1 className="mt-2 text-lg font-bold break-words text-slate-800">
                    {p.product.name}
                  </h1>
                  <div className="mt-3">
                    {isFree ? (
                      <div className="text-xl font-semibold text-green-600">Gratis</div>
                    ) : (
                      <div className="text-xl font-bold text-cyan-600">
                        {formatIDR(Number(p.amount))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-sm text-slate-500 pt-4 mt-4 border-t border-slate-100 flex flex-col gap-1">
                  <span className="font-medium text-slate-600">Tanggal Pembelian:</span>
                  <span>{formatDate(paidDate)} ({formatTime(paidDate)})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24 lg:col-span-2 lg:h-fit">
            <h3 className="mb-6 font-semibold text-slate-800 flex items-center gap-4">
              <CreditCardIcon size={22} className="text-cyan-600" />
              Rincian Pembayaran
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Harga</span>
                {isFree ? (
                  <span className="font-semibold text-green-600">Gratis</span>
                ) : (
                  <span className="font-medium text-slate-700">
                    {formatIDR(Number(p.amount))}
                  </span>
                )}
              </div>

              <div className="h-px bg-slate-200" />

              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-slate-800">Total</span>
                {isFree ? (
                  <span className="font-bold text-green-600">Gratis</span>
                ) : (
                  <span className="font-bold text-cyan-600">
                    {formatIDR(Number(p.amount))}
                  </span>
                )}
              </div>

              <div className="rounded-xl bg-slate-100 p-4 space-y-3 mt-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Status Pembayaran</span>
                  <span className={`font-medium ${isCompleted ? "text-slate-800" : "text-yellow-700"}`}>
                    {isCompleted ? "Berhasil" : "Pending"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Metode Pembayaran</span>
                  <span className="font-medium text-slate-800">
                    {isFree ? "-" : (p.paymentMethod ?? "—")}
                  </span>
                </div>
                {!isFree && p.paymentDetails && (() => {
                  const details = p.paymentDetails as { paymentType?: string; bank?: string; vaNumber?: string } | null;
                  return details?.vaNumber ? (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">No. Virtual Account</span>
                      <span className="font-medium font-mono text-slate-800">{details.vaNumber}</span>
                    </div>
                  ) : null;
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
