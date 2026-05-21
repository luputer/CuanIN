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
  CalendarBlankIcon,
  FileIcon,
  ClockIcon,
  ArrowLeftIcon,
  Funnel,
} from "@phosphor-icons/react";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { cn } from "~/lib/utils";

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
  contentType,
  duration,
  endDate,
  status,
}: {
  productSlug: string;
  name: string;
  shortDescription: string;
  type: string;
  price: number;
  image?: string | null;
  slug: string;
  startDate?: Date | null;
  contentType?: string | null;
  duration?: string | null;
  endDate?: Date | null;
  status?: string;
}) {
  const isGratis = price === 0;
  const categoryLabel = TYPE_MAP[type] ?? type;

  const isWebinarCompleted =
    type === "WEBINAR" &&
    ((endDate && new Date() > new Date(endDate)) ||
      status === "archived");

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
  })();

  return (
    <Link href={`/${slug}/${productSlug}`} className="block h-full">
      <div className="group relative h-full flex flex-col cursor-pointer overflow-hidden rounded-xl border border-slate-300 bg-white px-4 py-4 transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 hover:border-slate-400">
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
        <div className="flex-1 flex flex-col justify-between space-y-1.5 pt-4">
          <div>
            <p className="mb-2 line-clamp-2 text-sm leading-snug font-semibold text-slate-800">
              {name}
            </p>
            <p className="font-regular mb-2 line-clamp-2 min-h-[2rem] text-xs leading-snug text-slate-600">
              {shortDescription}
            </p>

            {extraInfo && <p>{extraInfo}</p>}
          </div>

          <div className="mt-2 flex flex-col gap-2.5">
            <div>
              {isGratis ? (
                <span className="text-md font-semibold text-green-600">Gratis</span>
              ) : (
                <span className="text-md font-semibold text-cyan-600">
                  Rp {Number(price).toLocaleString("id-ID")}
                </span>
              )}
            </div>

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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CatalogSlugPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [activeTab, setActiveTab] = useState<TabFilter>("Semua");
  const [searchQuery, setSearchQuery] = useState(""); // State pencarian
  const [sortBy, setSortBy] = useState<"terbaru" | "terlaris">("terbaru");
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

  // ── Loading Skeleton ──
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pb-16 animate-pulse">
        {/* Banner skeleton */}
        <div className="relative h-32 w-full overflow-hidden bg-slate-200 md:h-48" />

        <div className="mx-auto max-w-6xl px-4">
          {/* Profile skeleton */}
          <div className="relative z-10 -mt-12 flex flex-col items-center text-center md:-mt-16">
            <div className="h-24 w-24 rounded-full border-4 border-white bg-slate-200 shadow-md md:h-32 md:w-32" />
            <div className="mt-3 h-5 w-40 rounded-full bg-slate-200" />
            <div className="mt-2 h-3.5 w-64 rounded-full bg-slate-200" />
            <div className="mt-4 flex items-center gap-6 rounded-full border border-slate-200 bg-white px-10 py-4 shadow-xs">
              <div className="h-4 w-20 rounded-full bg-slate-200" />
              <div className="h-4 w-px bg-slate-200" />
              <div className="h-4 w-20 rounded-full bg-slate-200" />
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-slate-200 bg-white px-6 pt-8 pb-10 shadow-sm md:px-10">
            {/* Search + filter skeleton */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex w-full items-center gap-3 md:w-auto">
                <div className="h-10 w-full rounded-full bg-slate-200 md:w-80" />
                <div className="h-10 w-10 shrink-0 rounded-full bg-slate-200" />
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 w-20 rounded-full bg-slate-200" />
                ))}
              </div>
            </div>

            <div className="mt-8 mb-4 h-5 w-32 rounded-full bg-slate-200" />

            {/* Product grid skeleton */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="aspect-square w-full rounded-xl bg-slate-200" />
                  <div className="mt-4 space-y-2">
                    <div className="h-4 w-3/4 rounded-full bg-slate-200" />
                    <div className="h-3 w-full rounded-full bg-slate-200" />
                    <div className="h-3 w-2/3 rounded-full bg-slate-200" />
                    <div className="mt-3 h-4 w-1/3 rounded-full bg-slate-200" />
                    <div className="h-9 w-full rounded-md bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Not Found ──
  if (!data) {
    notFound();
  }

  const { creator, products, bio } = data;

  const initials = creator.name
    ? creator.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
    : "??";

  // ── Filter Logika (Tab + Search + Sort) ──
  const filtered = products
    .filter((p) => {
      const matchesTab = activeTab === "Semua" || TYPE_MAP[p.type] === activeTab;
      const matchesSearch = p.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    })
    .sort((a, b) => {
      const isCompletedA =
        a.type === "WEBINAR" &&
        ((a.endDate && new Date() > new Date(a.endDate)) ||
          a.status === "archived");
      const isCompletedB =
        b.type === "WEBINAR" &&
        ((b.endDate && new Date() > new Date(b.endDate)) ||
          b.status === "archived");

      if (isCompletedA !== isCompletedB) {
        return isCompletedA ? 1 : -1;
      }

      if (sortBy === "terbaru") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "terlaris") {
        const salesA = (a as any)._count?.purchases ?? 0;
        const salesB = (b as any)._count?.purchases ?? 0;
        if (salesA !== salesB) {
          return salesB - salesA;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });

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
        <div className="relative z-10 -mt-12 flex flex-col items-center text-center md:-mt-16">
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
            <div className="flex w-full items-center gap-3 md:w-auto">
              <div className="w-full flex-1 md:w-104 md:flex-initial">
                <SearchInput
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari produk..."
                  className="w-full rounded-full border border-slate-400 !shadow-none"
                />
              </div>

              {/* Popover Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-400 bg-white text-slate-600 transition-all duration-200 ease-out hover:bg-slate-50 hover:text-slate-800 hover:translate-x-[1px] hover:translate-y-[1px] !shadow-none m-0 p-0 box-border">
                    <Funnel className="h-5 w-5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2" align="end">
                  <div className="flex flex-col gap-1">
                    <p className="px-2.5 py-1.5 text-xs font-semibold text-slate-400">
                      Urutkan Berdasarkan
                    </p>
                    <button
                      onClick={() => setSortBy("terbaru")}
                      className={cn(
                        "w-full cursor-pointer rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-all hover:bg-slate-100",
                        sortBy === "terbaru" ? "bg-cyan-50 text-cyan-600" : "text-slate-700"
                      )}
                    >
                      Terbaru
                    </button>
                    <button
                      onClick={() => setSortBy("terlaris")}
                      className={cn(
                        "w-full cursor-pointer rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-all hover:bg-slate-100",
                        sortBy === "terlaris" ? "bg-cyan-50 text-cyan-600" : "text-slate-700"
                      )}
                    >
                      Terlaris
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

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
                  contentType={product.contentType}
                  duration={product.duration}
                  endDate={product.endDate}
                  status={product.status}
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
