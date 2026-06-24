"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ImagesIcon,
  ArrowUpRightIcon,
  CaretLeftIcon,
  ArrowLeftIcon,
  NoteIcon,
} from "@phosphor-icons/react";
import { api } from "~/trpc/react";
import { CATEGORY_STYLE, CATEGORY_STYLE_DEFAULT, PRODUCT_TYPE_MAP } from "~/lib/constants";

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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2 text-sm">
      <span className="text-slate-500 min-w-24">{label}:</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}

export default function PortalDetailProdukPage() {
  const { id } = useParams<{ id: string }>();
  const { data: purchase, isLoading } = api.purchases.getById.useQuery({ id: id! });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-6 w-32 rounded-full bg-slate-200" />
        <div className="h-32 w-full rounded-xl bg-slate-200" />
        <div className="h-36 w-full rounded-xl bg-slate-200" />
        <div className="h-24 w-full rounded-xl bg-slate-200" />
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <p className="text-lg font-semibold">Produk tidak ditemukan.</p>
          <Link href="/portal/dashboard" className="text-sm text-cuan-cyan font-medium hover:underline flex items-center gap-1">
            <ArrowLeftIcon size={14} />
            Kembali ke Produk Saya
          </Link>
        </div>
      </div>
    );
  }

  const p = purchase as any;
  const product = p.product;
  const isFree = Number(p.amount) === 0;
  const links: string[] = product.links
    ? (Array.isArray(product.links) ? product.links : [product.links].filter(Boolean))
    : product.link
      ? [product.link]
      : [];

  const infoRows: { label: string; value: string }[] = [];

  const formatTimeRange = (start: Date | string, end?: Date | string | null) => {
    if (!end) return formatTime(start);
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  if (product.type === "WEBINAR") {
    if (product.contentType) infoRows.push({ label: "Platform", value: product.contentType });
    if (product.startDate) {
      const d = new Date(product.startDate);
      infoRows.push({ label: "Tanggal", value: formatDate(d) });
      infoRows.push({ label: "Waktu", value: formatTimeRange(d, product.endDate) });
    }
  }

  if (product.type === "KELAS_ONLINE") {
    if (product.contentType) infoRows.push({ label: "Platform", value: product.contentType });
    if (product.duration) infoRows.push({ label: "Durasi", value: product.duration });
    if (product.startDate) {
      const d = new Date(product.startDate);
      infoRows.push({ label: "Tanggal Mulai", value: formatDate(d) });
      infoRows.push({ label: "Waktu", value: formatTimeRange(d, product.endDate) });
    }
  }

  if (product.type === "DIGITAL_PRODUCT") {
    if (product.contentType) infoRows.push({ label: "Tipe Konten", value: product.contentType });
  }

  return (
    <div className="space-y-6">
      <Link
        href="/portal/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
      >
        <CaretLeftIcon size={16} />
        Detail Produk
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
            <div className="flex h-full min-w-0 flex-1 flex-col gap-1.5">
              <span className={`w-fit rounded-full border px-2 py-0.5 text-[10px] ${CATEGORY_STYLE[product.type] ?? CATEGORY_STYLE_DEFAULT}`}>
                {PRODUCT_TYPE_MAP[product.type] ?? product.type}
              </span>
              <h2 className="text-base font-bold break-words text-slate-800">
                {product.name}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {product.user?.name ?? "Kreator"}
              </p>
              {isFree ? (
                <div className="text-lg font-semibold text-green-600">Gratis</div>
              ) : (
                <div className="text-lg font-bold text-cuan-cyan">
                  Rp {Number(p.amount).toLocaleString("id-ID")}
                </div>
              )}

            </div>
          </div>

          {/* Info Produk */}
          {infoRows.length > 0 && (
            <div className="rounded-xl border border-slate-300 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-slate-700">Informasi Produk</h3>
              <div className="space-y-3">
                {infoRows.map((row, i) => (
                  <InfoRow key={i} label={row.label} value={row.value} />
                ))}
              </div>
            </div>
          )}

          {/* Catatan Kreator */}
          {product.notes && (
            <div className="rounded-xl border border-slate-300 bg-white p-5">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-3">
                <NoteIcon size={16} weight="bold" />
                Catatan Kreator
              </h3>
              <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{product.notes}</p>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="w-full min-w-0 lg:sticky lg:top-24 lg:col-span-2 lg:h-fit lg:self-start">
          <div className="rounded-xl border border-slate-300 bg-white p-6">
            <h3 className="mb-4 pb-3 font-semibold text-slate-800">Akses Produk</h3>

            {links.length > 0 ? (
              <div className="space-y-2">
                {links.map((link, i) => (
                  <a
                    key={i}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-cuan-cyan/5 hover:border-cuan-cyan/30"
                  >
                    <span className="truncate">Link Akses {i + 1}</span>
                    <ArrowUpRightIcon size={16} className="shrink-0 text-slate-400" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Tidak ada link akses tersedia.</p>
            )}

            <div className="mt-6 pt-4 border-t border-slate-200">
              <Link
                href={`/portal/dashboard/riwayat/${p.id}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Lihat Rincian Pembayaran
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
