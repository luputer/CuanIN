"use client";

import { useState } from "react";
import { useParams, notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { api } from "~/trpc/react";
import Link from "next/link";
import SearchInput from "~/components/ui/search";
import { ImagesIcon, SpinnerIcon, CalendarDotsIcon, ArrowRightIcon, FileIcon, ClockIcon } from "@phosphor-icons/react";


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
                <span className="flex items-center gap-1 font-medium text-slate-800 text-xs">
                    <CalendarDotsIcon weight="fill" />
                    {tanggal}, {jam}
                </span>
            );
        }

        if (type === "DIGITAL_PRODUCT" && format) {
            return (
                <span className="flex items-center gap-1 font-medium text-slate-800 text-xs">
                    <FileIcon weight="fill" />
                    {format}
                </span>
            )
        }

        if (type === "KELAS_ONLINE" && duration) {
            return (
                <span className="flex items-center gap-1 font-medium text-slate-800 text-xs">
                    <ClockIcon weight="fill" />
                    {duration}
                </span>
            )
        }

        return null;
    })();

    return (
        <Link href={`/${slug}/${productSlug}`} className="block">
            <div className="bg-white rounded-xl border border-slate-300 px-4 py-4 overflow-hidden cursor-pointer group h-full relative
                transition-transform duration-300 ease-out transform-gpu
                hover:-translate-y-1 hover:scale-[1.02]
            ">
                {/* Thumbnail */}
                <div className="w-full aspect-square rounded-xl bg-slate-100 flex items-center justify-center relative overflow-hidden">

                    {/* Category overlay */}
                    {categoryLabel && (
                        <span
                            className={`
                                absolute top-2 left-2 z-10 text-[10px] font-medium px-4 py-0.5 rounded-full border
                                ${CATEGORY_STYLE[type] ?? "bg-slate-100 text-slate-700 border-slate-200"}
                            `}
                        >
                            {categoryLabel}
                        </span>
                    )}

                    {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={image}
                            alt={name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <ImagesIcon className="w-10 h-10 text-slate-300" strokeWidth={1.2} />
                    )}
                </div>

                {/* Info */}
                <div className="pt-4 space-y-1.5 flex flex-col justify-between">
                    <div>
                        <p className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2 mb-2">
                            {name}
                        </p>
                        <p className="font-regular text-slate-600 text-xs leading-snug line-clamp-2 mb-2 min-h-[2rem]">
                            {shortDescription}
                        </p>

                        {extraInfo && (
                            <p>{extraInfo}</p>
                        )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                        {isGratis ? (
                            <span className="text-sm font-medium text-green-600">
                                Gratis
                            </span>
                        ) : (
                            <span className="text-sm font-medium text-cyan-600">
                                Rp {Number(price).toLocaleString("id-ID")}
                            </span>
                        )}

                        {/* ICON BUTTON (kanan) */}
                        <div className="bg-slate-200 text-slate-800 p-1 rounded-full">
                            <ArrowRightIcon className="w-4 h-4" />
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

    const { data, isLoading } = api.catalog.getBySlug.useQuery({ slug });

    // ── Loading ──
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <SpinnerIcon className="w-8 h-8 animate-spin text-blue-400" />
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
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const initials = creator.name
        ? creator.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "??";

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-16">
            <div className="max-w-6xl mx-auto pb-6">

                {/* ── Profile Section ── */}
                <div className="flex flex-col items-center gap-2 text-center pb-6">
                    <Avatar className="bg-white px-1 py-1 w-24 h-24 border border-slate-300">
                        <AvatarImage src={creator.image ?? ""} alt={creator.name ?? ""} />
                        <AvatarFallback className="text-2xl font-bold bg-yellow-200 text-slate-800">
                            {initials}
                        </AvatarFallback>
                    </Avatar>

                    <h1 className="text-lg font-semibold text-slate-800 mt-1">
                        {creator.name ?? slug}
                    </h1>

                    {bio && (
                        <p className="text-sm text-slate-600 max-w-2xl">{bio}</p>
                    )}

                    <div className="flex items-center bg-white px-10 py-4 border border-slate-200 shadow-xs rounded-full gap-6 text-sm mt-4">

                        <span className="flex items-center gap-3">
                            <span className="text-cyan-600 text-xl font-semibold">
                                {products.length}
                            </span>
                            <span className="text-slate-600">
                                Produk
                            </span>
                        </span>

                        <div className="border-r border-slate-300 h-4"></div>

                        <span className="flex items-center gap-3">
                            <span className="text-cyan-600 text-xl font-semibold">
                                {products.length}
                            </span>
                            <span className="text-slate-600">
                                Terjual
                            </span>
                        </span>

                    </div>

                </div>

                <div className="bg-white border border-slate-200 shadow-sm px-10 pt-10 rounded-xl mt-8 pb-12">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <SearchInput
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari produk..."
                            className="w-full md:w-104 rounded-full border border-slate-400 shadow-none"
                        />

                        <div className="flex gap-2 flex-wrap">
                            {TABS.map((tab) => {
                                const isActive = activeTab === tab;

                                return (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`
                                            h-10 px-4 py-2 text-sm font-medium rounded-full
                                            transition-all duration-200 cursor-pointer


                                            ${isActive
                                                ? "bg-cyan-600 border border-cyan-600 text-white"
                                                : "bg-white text-slate-600 hover:bg-cyan-50 border border-slate-400"
                                            }
                    `}
                                    >
                                        {tab}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center justify-start mt-8 mb-4">
                        <p className="text-lg text-slate-800 font-medium">
                            {TAB_TITLE[activeTab]}
                        </p>
                    </div>

                    {/* ── Product Grid ── */}
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-2">
                            <ImagesIcon className="w-12 h-12" strokeWidth={1} />
                            <p className="text-sm">
                                {searchQuery
                                    ? `Produk "${searchQuery}" tidak ditemukan.`
                                    : "Belum ada produk tersedia."}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
            </div>
        </div>
    );
}