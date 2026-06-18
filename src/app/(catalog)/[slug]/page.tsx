"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { api } from "~/trpc/react";
import Link from "next/link";
import SearchInput from "~/components/ui/search";
import { ShoppingBagIcon, ArrowLeftIcon, Funnel } from "@phosphor-icons/react";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { getVisitorId } from "~/lib/visitor";
import { CatalogProductCard, CatalogProductCardSkeleton } from "~/components/catalog/product-card";
import { PRODUCT_TYPE_MAP } from "~/lib/constants";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabFilter = "Semua" | "Webinar" | "Kelas" | "Produk Digital";

const TAB_TITLE: Record<TabFilter, string> = {
  Semua: "Semua Produk",
  Webinar: "Webinar",
  Kelas: "Kelas",
  "Produk Digital": "Produk Digital",
};

const TABS: TabFilter[] = ["Semua", "Webinar", "Kelas", "Produk Digital"];

const TYPE_TO_TAB: Record<string, TabFilter> = {
  WEBINAR: "Webinar",
  KELAS_ONLINE: "Kelas",
  DIGITAL_PRODUCT: "Produk Digital",
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CatalogPageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 pb-16 animate-pulse">
      {/* Banner */}
      <div className="relative h-32 w-full overflow-hidden bg-slate-200 md:h-48" />

      <div className="mx-auto max-w-6xl px-4">
        {/* Profile */}
        <div className="relative z-10 -mt-12 flex flex-col items-center text-center md:-mt-16">
          <div className="h-24 w-24 rounded-full border-4 border-white bg-slate-200 shadow-md md:h-32 md:w-32" />
          <div className="mt-3 h-5 w-40 rounded-full bg-slate-200" />
          <div className="mt-2 h-3.5 w-64 rounded-full bg-slate-200" />
          <div className="mt-4 flex items-center gap-4 md:gap-6 rounded-full border border-slate-200 bg-white px-6 md:px-10 py-3 md:py-4 shadow-xs">
            <div className="h-4 w-20 rounded-full bg-slate-200" />
            <div className="h-4 w-px bg-slate-200" />
            <div className="h-4 w-20 rounded-full bg-slate-200" />
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white px-4 py-8 md:px-10 md:pt-10 md:pb-12 shadow-sm">
          {/* Search + filter */}
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

          {/* Product grid */}
          <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <CatalogProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CatalogSlugPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [activeTab, setActiveTab] = useState<TabFilter>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState<"semua" | "gratis" | "berbayar">("semua");
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

  if (isLoading) return <CatalogPageSkeleton />;
  if (!data) notFound();

  const { creator, products, bio } = data;

  const initials = creator.name
    ? creator.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
    : "??";

  // ── Filter + Sort ──
  const filtered = products
    .filter((p) => {
      const matchesTab =
        activeTab === "Semua" || TYPE_TO_TAB[p.type] === activeTab;
      const matchesSearch = p.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const price = Number(p.price);
      const discountPrice = p.discountPrice != null ? Number(p.discountPrice) : null;
      const finalPrice = discountPrice !== null && discountPrice < price ? discountPrice : price;

      const matchesPrice =
        priceFilter === "semua" ||
        (priceFilter === "gratis" && finalPrice === 0) ||
        (priceFilter === "berbayar" && finalPrice > 0);

      return matchesTab && matchesSearch && matchesPrice;
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

      if (isCompletedA !== isCompletedB) return isCompletedA ? 1 : -1;

      // Default sort by terbaru
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* ── Banner ── */}
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
        {/* ── Profile ── */}
        <div className="relative z-10 -mt-12 flex flex-col items-center text-center md:-mt-16">
          <Avatar className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-white p-1 shadow-md md:h-32 md:w-32">
            <AvatarImage src={creator.image ?? ""} alt={creator.name ?? ""} />
            <AvatarFallback className="bg-yellow-200 text-2xl font-bold text-slate-800">
              {initials}
            </AvatarFallback>
          </Avatar>

          <h1 className="mt-1 text-md md:text-lg font-semibold text-slate-800">
            {creator.name ?? slug}
          </h1>

          {bio && <p className="max-w-2xl text-xs md:text-sm text-slate-600">{bio}</p>}

          <div className="mt-4 flex items-center gap-4 md:gap-6 rounded-full border border-slate-200 bg-white px-6 md:px-10 py-3 md:py-4 text-xs md:text-sm shadow-xs">
            <span className="flex items-center gap-2 md:gap-3">
              <span className="text-lg md:text-xl font-semibold text-cyan-600">
                {products.length}
              </span>
              <span className="text-slate-600">Produk</span>
            </span>

            <div className="h-4 border-r border-slate-300" />

            <span className="flex items-center gap-2 md:gap-3">
              <span className="text-lg md:text-xl font-semibold text-cyan-600">
                {products.length}
              </span>
              <span className="text-slate-600">Terjual</span>
            </span>
          </div>
        </div>

        {/* ── Product Panel ── */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-white px-4 py-8 md:px-10 md:pt-10 md:pb-12 shadow-sm">
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

              {/* Filter Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-400 bg-white text-slate-600 transition-all duration-200 ease-out hover:bg-slate-50 hover:text-slate-800 hover:translate-x-[1px] hover:translate-y-[1px] !shadow-none m-0 p-0 box-border">
                    <Funnel className="h-5 w-5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2" align="end">
                  <div className="flex flex-col gap-1">
                    <p className="px-2.5 py-1.5 text-xs font-semibold text-slate-400">
                      Filter Berdasarkan:
                    </p>
                    {(["semua", "gratis", "berbayar"] as const).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setPriceFilter(opt)}
                        className={cn(
                          "w-full cursor-pointer rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-all hover:bg-slate-100",
                          priceFilter === opt
                            ? "bg-cyan-50 text-cyan-600"
                            : "text-slate-700",
                        )}
                      >
                        {opt === "semua" ? "Semua" : opt === "gratis" ? "Gratis" : "Berbayar"}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Tab filter */}
            <div className="flex flex-wrap gap-2">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`h-9 md:h-10 cursor-pointer rounded-full px-3 md:px-4 py-2 text-xs md:text-sm font-medium transition-all duration-200 ${activeTab === tab
                    ? "border border-cyan-600 bg-cyan-600 text-white"
                    : "border border-slate-400 bg-white text-slate-600 hover:bg-cyan-50"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 mb-4 flex items-center justify-start">
            <p className="text-md md:text-lg font-medium text-slate-800">
              {TAB_TITLE[activeTab]}
            </p>
          </div>

          {/* ── Product Grid ── */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-24 text-slate-400">
              <ShoppingBagIcon className="h-12 w-12" strokeWidth={1} />
              <p className="text-sm">
                {searchQuery
                  ? `Produk "${searchQuery}" tidak ditemukan.`
                  : "Belum ada produk tersedia."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((product) => (
                <CatalogProductCard
                  key={product.id}
                  id={product.id}
                  productSlug={product.slug ?? product.id}
                  creatorSlug={slug}
                  name={product.name}
                  shortDescription={product.shortDescription ?? ""}
                  type={product.type}
                  price={Number(product.price)}
                  discountPrice={
                    product.discountPrice != null
                      ? Number(product.discountPrice)
                      : null
                  }
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

        {/* ── Back to Dashboard (creator only) ── */}
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
