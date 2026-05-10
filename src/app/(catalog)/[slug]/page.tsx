"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { api } from "~/trpc/react";
import Link from "next/link";
import SearchInput from "~/components/ui/search";
import {
  ImagesIcon,
  SpinnerIcon,
  CalendarDotsIcon,
  ArrowRightIcon,
  FileIcon,
  ClockIcon,
  ArrowLeftIcon,
} from "@phosphor-icons/react";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabFilter = "Semua" | "Webinar" | "Kelas" | "Produk Digital";

const TAB_TITLE: Record<TabFilter, string> = {
  Semua: "Semua Produk",
  Webinar: "Webinar",
  Kelas: "Kelas",
  "Produk Digital": "Produk Digital",
};

const TABS: TabFilter[] = ["Semua", "Webinar", "Kelas", "Produk Digital"];

const TYPE_MAP: Record<string, TabFilter> = {
  WEBINAR: "Webinar",
  KELAS_ONLINE: "Kelas",
  DIGITAL_PRODUCT: "Produk Digital",
};

const CATEGORY_STYLE: Record<string, string> = {
  WEBINAR: "bg-cyan-100 text-cyan-700 border-cyan-200",
  KELAS_ONLINE: "bg-amber-100 text-amber-700 border-amber-200",
  DIGITAL_PRODUCT: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const VISITOR_ID_KEY = "cuanin_visitor_id";

const getVisitorId = () => {
  const existingVisitorId = window.localStorage.getItem(VISITOR_ID_KEY);
  if (existingVisitorId) return existingVisitorId;

  const visitorId =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : Array.from(crypto.getRandomValues(new Uint32Array(4)))
        .map((value) => value.toString(36))
        .join("-");

  window.localStorage.setItem(VISITOR_ID_KEY, visitorId);
  return visitorId;
};

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({
  productSlug,
  name,
  shortDescription,
  type,
  price,
  image,
  slug,
  startDate,
  format,
  duration,
}: {
  productSlug: string;
  name: string;
  shortDescription: string;
  type: string;
  price: number;
  image?: string | null;
  slug: string;
  startDate?: Date | null;
  format?: string | null;
  duration?: string | null;
}) {
  const isGratis = price === 0;
  const categoryLabel = TYPE_MAP[type] ?? type;

  const extraInfo = (() => {
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
        <span className="flex items-center gap-1 text-xs font-medium text-slate-800">
          <CalendarDotsIcon weight="fill" />
          {tanggal}, {jam}
        </span>
      );
    }

    if (type === "DIGITAL_PRODUCT" && format) {
      return (
        <span className="flex items-center gap-1 text-xs font-medium text-slate-800">
          <FileIcon weight="fill" />
          {format}
        </span>
      );
    }

    if (type === "KELAS_ONLINE" && duration) {
      return (
        <span className="flex items-center gap-1 text-xs font-medium text-slate-800">
          <ClockIcon weight="fill" />
          {duration}
        </span>
      );
    }

    return null;
  })();

  return (
    <Link href={`/${slug}/${productSlug}`} className="block">
      <div className="group relative h-full transform-gpu cursor-pointer overflow-hidden rounded-xl border border-slate-300 bg-white px-4 py-4 transition-transform duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02]">
        {/* Thumbnail */}
        <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-slate-100">
          {/* Category overlay */}
          {categoryLabel && (
            <span
              className={`absolute top-2 left-2 z-10 rounded-full border px-4 py-0.5 text-[10px] font-medium ${CATEGORY_STYLE[type] ?? "border-slate-200 bg-slate-100 text-slate-700"} `}
            >
              {categoryLabel}
            </span>
          )}

          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            <ImagesIcon
              className="h-10 w-10 text-slate-300"
              strokeWidth={1.2}
            />
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col justify-between space-y-1.5 pt-4">
          <div>
            <p className="mb-2 line-clamp-2 text-sm leading-snug font-semibold text-slate-800">
              {name}
            </p>
            <p className="font-regular mb-2 line-clamp-2 min-h-[2rem] text-xs leading-snug text-slate-600">
              {shortDescription}
            </p>

            {extraInfo && <p>{extraInfo}</p>}
          </div>

          <div className="mt-2 flex items-center justify-between">
            {isGratis ? (
              <span className="text-sm font-medium text-green-600">Gratis</span>
            ) : (
              <span className="text-sm font-medium text-cyan-600">
                Rp {Number(price).toLocaleString("id-ID")}
              </span>
            )}

            {/* ICON BUTTON (kanan) */}
            <div className="rounded-full bg-slate-200 p-1 text-slate-800">
              <ArrowRightIcon className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CatalogSlugPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [activeTab, setActiveTab] = useState<TabFilter>("Semua");
  const [searchQuery, setSearchQuery] = useState(""); // State pencarian
  const recordedCatalogIdRef = useRef<string | null>(null);

  const { data: session } = useSession();

  const { data, isLoading } = api.catalog.getBySlug.useQuery(
    { slug },
    { enabled: !!slug },
  );
  const { mutate: recordCatalogView } =
    api.analytics.recordCatalogView.useMutation();

  useEffect(() => {
    if (!data?.id) return;
    if (session?.user.id === data.creator.id) return;
    if (recordedCatalogIdRef.current === data.id) return;

    recordedCatalogIdRef.current = data.id;

    recordCatalogView({
      catalogId: data.id,
      visitorId: getVisitorId(),
    });
  }, [data?.id, data?.creator.id, recordCatalogView, session?.user.id]);

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <SpinnerIcon className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  // ── Not Found ──
  if (!data) {
    notFound();
  }

  const { creator, products, bio } = data;

  // ── Filter Logika (Tab + Search) ──
  const filtered = products.filter((p) => {
    const matchesTab = activeTab === "Semua" || TYPE_MAP[p.type] === activeTab;
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const initials = creator.name
    ? creator.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
    : "??";

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* ── Banner Section ── */}
      <div className="relative h-32 w-full overflow-hidden bg-slate-200 md:h-48">
        {creator.banner ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={creator.banner}
            alt="Banner"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-cyan-500 to-blue-600 opacity-20" />
        )}
      </div>

      <div className="mx-auto max-w-6xl px-4">
        {/* ── Profile Section ── */}
        <div className="relative z-10 -mt-12 flex flex-col items-center pb-6 text-center md:-mt-16">
          <Avatar className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-white p-1 shadow-md md:h-32 md:w-32">
            <AvatarImage src={creator.image ?? ""} alt={creator.name ?? ""} />
            <AvatarFallback className="bg-yellow-200 text-2xl font-bold text-slate-800">
              {initials}
            </AvatarFallback>
          </Avatar>

          <h1 className="mt-1 text-lg font-semibold text-slate-800">
            {creator.name ?? slug}
          </h1>

          {bio && <p className="max-w-2xl text-sm text-slate-600">{bio}</p>}

          <div className="mt-4 flex items-center gap-6 rounded-full border border-slate-200 bg-white px-10 py-4 text-sm shadow-xs">
            <span className="flex items-center gap-3">
              <span className="text-xl font-semibold text-cyan-600">
                {products.length}
              </span>
              <span className="text-slate-600">Produk</span>
            </span>

            <div className="h-4 border-r border-slate-300"></div>

            <span className="flex items-center gap-3">
              <span className="text-xl font-semibold text-cyan-600">
                {products.length}
              </span>
              <span className="text-slate-600">Terjual</span>
            </span>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white px-10 pt-10 pb-12 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk..."
              className="w-full rounded-full border border-slate-400 shadow-none md:w-104"
            />

            <div className="flex flex-wrap gap-2">
              {TABS.map((tab) => {
                const isActive = activeTab === tab;

                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`h-10 cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${isActive
                        ? "border border-cyan-600 bg-cyan-600 text-white"
                        : "border border-slate-400 bg-white text-slate-600 hover:bg-cyan-50"
                      } `}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 mb-4 flex items-center justify-start">
            <p className="text-lg font-medium text-slate-800">
              {TAB_TITLE[activeTab]}
            </p>
          </div>

          {/* ── Product Grid ── */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-24 text-slate-400">
              <ImagesIcon className="h-12 w-12" strokeWidth={1} />
              <p className="text-sm">
                {searchQuery
                  ? `Produk "${searchQuery}" tidak ditemukan.`
                  : "Belum ada produk tersedia."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  productSlug={product.slug ?? product.id}
                  slug={slug}
                  name={product.name}
                  shortDescription={product.shortDescription ?? ""}
                  type={product.type}
                  price={Number(product.price)}
                  image={product.image}
                  startDate={product.startDate}
                  format={product.format}
                  duration={product.duration}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Back to Account for Creator ── */}
        {session?.user?.role === "CREATOR" && (
          <div className="mt-12 flex justify-center border-t border-slate-200 pt-10">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-full bg-slate-800 px-8 py-3 font-semibold text-white shadow-md transition-all hover:bg-slate-700"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Kembali ke Dashboard</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
