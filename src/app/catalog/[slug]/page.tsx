"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ImageIcon, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { api } from "~/trpc/react";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabFilter = "Semua" | "Webinar" | "Kelas" | "Produk Digital";

const TABS: TabFilter[] = ["Semua", "Webinar", "Kelas", "Produk Digital"];

const TYPE_MAP: Record<string, TabFilter> = {
    WEBINAR: "Webinar",
    KELAS_ONLINE: "Kelas",
    DIGITAL_PRODUCT: "Produk Digital",
};

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({
    name,
    type,
    price,
    image,
}: {
    name: string;
    type: string;
    price: number;
    image?: string | null;
}) {
    const isGratis = price === 0;
    const categoryLabel = TYPE_MAP[type] ?? type;

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer group">
            {/* Thumbnail */}
            <div className="w-full aspect-4/3 bg-slate-100 flex items-center justify-center">
                {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <ImageIcon className="w-10 h-10 text-slate-300" strokeWidth={1.2} />
                )}
            </div>

            {/* Info */}
            <div className="p-4 space-y-1.5">
                <p className="font-semibold text-slate-800 text-sm leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                    {name}
                </p>
                <p className="text-xs text-slate-400">{categoryLabel}</p>

                {isGratis ? (
                    <span className="inline-block text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-full px-3 py-0.5">
                        Gratis
                    </span>
                ) : (
                    <span className="inline-block text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-3 py-0.5">
                        Rp {Number(price).toLocaleString("id-ID")}
                    </span>
                )}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CatalogSlugPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [activeTab, setActiveTab] = useState<TabFilter>("Semua");

    const { data, isLoading } = api.catalog.getBySlug.useQuery({ slug });

    // ── Loading ──
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
        );
    }

    // ── Not Found ──
    if (!data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-4">
                <ImageIcon className="w-12 h-12 text-slate-300" strokeWidth={1} />
                <p className="text-slate-500 font-medium">Catalog tidak ditemukan.</p>
                <p className="text-slate-400 text-sm">Pastikan URL sudah benar.</p>
            </div>
        );
    }

    const { creator, products, bio } = data;

    // Filter berdasarkan tab aktif
    const filtered =
        activeTab === "Semua"
            ? products
            : products.filter((p) => TYPE_MAP[p.type] === activeTab);

    const initials = creator.name
        ? creator.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "??";

    return (
        <div className="min-h-screen bg-white px-4 py-10">
            <div className="max-w-5xl mx-auto space-y-10">

                {/* ── Profile Section ── */}
                <div className="flex flex-col items-center gap-2 text-center">
                    <Avatar className="w-24 h-24 ring-4 ring-white shadow-lg">
                        <AvatarImage src={creator.image ?? ""} alt={creator.name ?? ""} />
                        <AvatarFallback className="text-2xl font-bold bg-slate-200 text-slate-500">
                            {initials}
                        </AvatarFallback>
                    </Avatar>

                    <h1 className="text-base font-semibold text-slate-800 mt-1">
                        {creator.name ?? slug}
                    </h1>

                    {bio && (
                        <p className="text-sm text-slate-500 max-w-sm">{bio}</p>
                    )}

                    <div className="flex items-center gap-3 text-sm text-slate-400">
                        <span>
                            <span className="font-medium text-slate-600">{products.length}</span> Produk
                        </span>
                    </div>
                </div>

                {/* ── Tab Filter ── */}
                <div className="border-b border-slate-200">
                    <div className="flex">
                        {TABS.map((tab) => {
                            const isActive = activeTab === tab;
                            return (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`
                                        relative flex-1 py-3 text-sm font-medium transition-colors
                                        ${isActive ? "text-blue-600" : "text-slate-500 hover:text-slate-700"}
                                    `}
                                >
                                    {/* Pill background */}
                                    {isActive && (
                                        <span className="absolute inset-x-2 inset-y-1.5 rounded-full bg-blue-50" />
                                    )}
                                    <span className="relative z-10">{tab}</span>
                                    {/* Underline */}
                                    {isActive && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Product Grid ── */}
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-2">
                        <ImageIcon className="w-12 h-12" strokeWidth={1} />
                        <p className="text-sm">Belum ada produk tersedia.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filtered.map((product) => (
                            <ProductCard
                                key={product.id}
                                name={product.name}
                                type={product.type}
                                price={Number(product.price)}
                                image={null}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
