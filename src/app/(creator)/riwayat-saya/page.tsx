"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { api } from "~/trpc/react";
import {
  ShoppingBagIcon,
  CalendarBlankIcon,
  ArrowSquareOutIcon,
  PackageIcon,
  VideoIcon,
  MonitorPlayIcon,
  MagnifyingGlassIcon,
  SmileyIcon,
} from "@phosphor-icons/react";

const formatIDR = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val);

const formatDate = (date: Date | string) =>
  new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const PRODUCT_TYPE_LABEL: Record<
  string,
  { label: string; icon: React.ReactNode; color: string }
> = {
  WEBINAR: {
    label: "Webinar",
    icon: <VideoIcon size={11} weight="fill" />,
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  KELAS_ONLINE: {
    label: "Kelas Online",
    icon: <MonitorPlayIcon size={11} weight="fill" />,
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  DIGITAL_PRODUCT: {
    label: "Produk Digital",
    icon: <PackageIcon size={11} weight="fill" />,
    color: "bg-green-100 text-green-700 border-green-200",
  },
};

type PurchaseItem = {
  id: string;
  amount: unknown;
  createdAt: Date | string;
  paidAt?: Date | string | null;
  product: {
    id: string;
    name: string;
    image?: string | null;
    type: string;
    slug?: string | null;
    user?: { name?: string | null; catalog?: { slug: string } | null } | null;
  };
};

function PurchaseRow({ purchase }: { purchase: PurchaseItem }) {
  const typeInfo = PRODUCT_TYPE_LABEL[purchase.product.type] ?? {
    label: purchase.product.type,
    icon: <PackageIcon size={11} weight="fill" />,
    color: "bg-slate-100 text-slate-600 border-slate-200",
  };

  const catalogSlug = purchase.product.user?.catalog?.slug;
  const productSlug = purchase.product.slug;
  const productUrl =
    catalogSlug && productSlug ? `/${catalogSlug}/${productSlug}` : null;

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all duration-200 group">
      {/* Thumbnail */}
      <div className="relative h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
        {purchase.product.image ? (
          <Image
            src={purchase.product.image}
            alt={purchase.product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingBagIcon size={24} weight="thin" className="text-slate-400" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1">
          <p className="font-semibold text-slate-800 text-sm truncate leading-snug">
            {purchase.product.name}
          </p>
          <span
            className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold ${typeInfo.color}`}
          >
            {typeInfo.icon}
            <span className="hidden sm:inline">{typeInfo.label}</span>
          </span>
        </div>
        <p className="text-xs text-slate-400">
          oleh{" "}
          <span className="text-slate-500 font-medium">
            {purchase.product.user?.name ?? "Kreator"}
          </span>
        </p>
        <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
          <CalendarBlankIcon size={11} />
          {formatDate(purchase.paidAt ?? purchase.createdAt)}
        </div>
      </div>

      {/* Price + Link */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <p className="font-bold text-slate-800 text-sm">
          {Number(purchase.amount) === 0
            ? "Gratis"
            : formatIDR(Number(purchase.amount))}
        </p>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Selesai
        </span>
        {productUrl && (
          <Link
            href={productUrl}
            target="_blank"
            className="inline-flex items-center gap-1 text-xs text-cuan-cyan hover:text-cyan-800 transition-colors font-medium"
          >
            Buka <ArrowSquareOutIcon size={11} />
          </Link>
        )}
      </div>
    </div>
  );
}

export default function RiwayatSayaPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = api.purchases.getPurchaseHistoryForCreator.useQuery();

  const filteredPurchases =
    data?.purchases.filter(
      (p) =>
        p.product.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.product.user?.name ?? "").toLowerCase().includes(search.toLowerCase())
    ) ?? [];

  const totalSpent = data?.purchases.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  ) ?? 0;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <ShoppingBagIcon size={26} weight="fill" className="text-cuan-cyan" />
          Riwayat Pembelian Saya
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Produk yang pernah kamu beli menggunakan akun ini.
        </p>
      </div>

      {/* Stats */}
      {!isLoading && data && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl border-2 border-slate-200 p-4">
            <p className="text-xs text-slate-400 font-medium mb-1">
              Total Produk
            </p>
            <p className="text-2xl font-bold text-slate-800">
              {data.purchases.length}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">produk dibeli</p>
          </div>
          <div className="bg-white rounded-xl border-2 border-slate-200 p-4">
            <p className="text-xs text-slate-400 font-medium mb-1">
              Total Pengeluaran
            </p>
            <p className="text-2xl font-bold text-slate-800">
              {formatIDR(totalSpent)}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">dari semua pembelian</p>
          </div>
        </div>
      )}

      {/* Search */}
      {(data?.purchases.length ?? 0) > 0 && (
        <div className="relative mb-5">
          <MagnifyingGlassIcon
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama produk atau kreator..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cuan-cyan/100 transition-all text-sm"
          />
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 w-full rounded-xl bg-slate-200 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredPurchases.length === 0 && (
        <div className="text-center py-20">
          {search ? (
            <>
              <MagnifyingGlassIcon
                size={48}
                weight="thin"
                className="text-slate-300 mx-auto mb-3"
              />
              <p className="text-slate-500 font-medium">Produk tidak ditemukan</p>
              <p className="text-slate-400 text-sm mt-1">
                Tidak ada yang cocok dengan &quot;{search}&quot;
              </p>
            </>
          ) : (
            <>
              <SmileyIcon
                size={56}
                weight="thin"
                className="text-slate-300 mx-auto mb-3"
              />
              <p className="text-slate-600 font-semibold text-lg mb-1">
                Belum Ada Pembelian
              </p>
              <p className="text-slate-400 text-sm mb-6">
                Kamu belum pernah membeli produk dari kreator lain.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-slate-800 bg-yellow-300 font-semibold text-slate-800 shadow-[0px_2px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-sm"
              >
                Jelajahi Produk
              </Link>
            </>
          )}
        </div>
      )}

      {/* List */}
      {!isLoading && filteredPurchases.length > 0 && (
        <div className="space-y-3">
          {filteredPurchases.map((purchase) => (
            <PurchaseRow key={purchase.id} purchase={purchase} />
          ))}
        </div>
      )}
    </div>
  );
}
