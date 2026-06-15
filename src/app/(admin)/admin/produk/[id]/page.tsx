"use client";

import { ArrowLeftIcon, ImageIcon, ArrowSquareOutIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { api } from "~/trpc/react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { useState, useRef, useEffect } from "react";
import { SectionHeader, FormRow } from "~/components/shared/form-layout";
import React from "react";
import { cn } from "~/lib/utils";
import { DetailHeader } from "~/components/shared/detail-header";
import { AdminDetailSkeleton } from "~/components/shared/detail-skeletons";
import { StatusBadge } from "~/components/ui/status-badge";


export default function AdminProductDetailPage() {
    const params = useParams();
    const id = params.id as string;

    const { data: product, isLoading } = api.products.adminGetById.useQuery(
        { id },
        { enabled: !!id }
    );

    const [expanded, setExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const descriptionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (descriptionRef.current && product?.description) {
            const isClamped = descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight;
            if (isClamped) {
                setIsOverflowing(true);
            }
        }
    }, [product?.description]);

    // ─── Loading ───
    if (isLoading) return <AdminDetailSkeleton />;

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <p className="text-slate-500 text-lg">Produk tidak ditemukan.</p>
                <Link href="/admin/produk" className="text-blue-500 hover:underline">
                    ← Kembali ke Daftar Produk
                </Link>
            </div>
        );
    }

    const isWebinar = product.type === "WEBINAR";
    const isKelas = product.type === "KELAS_ONLINE";
    const isDigital = product.type === "DIGITAL_PRODUCT";

    const buyerCount = (product as any)._count?.purchases ?? 0;

    const currentStatus =
        isWebinar && product.endDate && new Date() > new Date(product.endDate)
            ? "archived"
            : product.status ?? "draft";

    const priceNum = Number(product.price);

    // Parse images array
    const parsedImages: string[] = [];
    if (Array.isArray(product.images) && product.images.length > 0) {
        parsedImages.push(...(product.images as string[]));
    } else if (product.image) {
        parsedImages.push(product.image);
    }

    return (
        <div className="w-full max-w-7xl mx-auto">
            <div className="space-y-6">
                {/* Header */}
                <DetailHeader
                    backLink="/admin/produk"
                    backLabel="Kembali ke Daftar Produk"
                    title={product.name}
                    badges={
                        <div className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-semibold tracking-wider",
                            priceNum > 0
                                ? "bg-amber-100 text-amber-700 border border-amber-200"
                                : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        )}>
                            {priceNum > 0 ? "Berbayar" : "Gratis"}
                        </div>
                    }
                    actions={
                        product.slug && (product as any).user?.catalog?.slug && (
                            <a
                                href={`/${(product as any).user.catalog.slug}/${product.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-cyan-600 hover:bg-cyan-50 hover:shadow-sm h-10 px-4 rounded-lg transition-all cursor-pointer"
                            >
                                <ArrowSquareOutIcon className="w-4 h-4 text-cyan-600" />
                                <span className="text-sm font-regular text-cyan-600 whitespace-nowrap">
                                    Lihat Katalog Produk
                                </span>
                            </a>
                        )
                    }
                />

                {/* Content card */}
                <div className="rounded-xl border border-slate-800 overflow-hidden bg-white">
                    <div className="flex-1 min-w-0 bg-white rounded-xl px-4 py-6 sm:px-8 sm:py-8">
                        <SectionHeader title={
                            isWebinar ? "Informasi Webinar"
                                : isKelas ? "Informasi Kelas"
                                    : "Informasi Produk Digital"
                        } />

                        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start pt-6">
                            {/* Left: detail fields */}
                            <div className="flex-1 min-w-0 w-full space-y-0">
                                <FormRow label="Nama">
                                    <div className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 w-full text-slate-800 font-medium">
                                        {product.name}
                                    </div>
                                </FormRow>

                                <FormRow label="Kreator">
                                    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-4 py-2.5 w-full">
                                        {(product as any).user?.image ? (
                                            <Image
                                                src={(product as any).user.image}
                                                alt={(product as any).user.name ?? "Kreator"}
                                                width={32}
                                                height={32}
                                                unoptimized
                                                className="rounded-full w-8 h-8 object-cover border border-slate-200"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 text-xs font-bold shrink-0">
                                                {((product as any).user?.name ?? "K")[0]?.toUpperCase()}
                                            </div>
                                        )}
                                        <Link
                                            href={`/admin/kreator/${product.userId}`}
                                            className="text-cyan-600 hover:underline font-semibold text-sm"
                                        >
                                            {(product as any).user?.name ?? "-"}
                                        </Link>
                                    </div>
                                </FormRow>

                                <FormRow label="Ringkasan">
                                    <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 w-full text-slate-700 leading-relaxed">
                                        {product.shortDescription ?? "-"}
                                    </div>
                                </FormRow>

                                <FormRow label="Deskripsi Lengkap">
                                    <div className="bg-white border border-slate-200 rounded-lg p-4 w-full">
                                        {product.description ? (
                                            <>
                                                <div
                                                    ref={descriptionRef}
                                                    className={`
                                                        prose prose-sm prose-slate max-w-none text-slate-800 leading-relaxed
                                                        [&>*:first-child]:mt-0
                                                        ${!expanded ? "line-clamp-4" : ""}
                                                    `}
                                                >
                                                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                                                        {product.description}
                                                    </ReactMarkdown>
                                                </div>
                                                {(isOverflowing || expanded) && (
                                                    <button
                                                        onClick={() => setExpanded(!expanded)}
                                                        className="sm:justify-start mt-2 text-sm text-cyan-600 hover:underline cursor-pointer font-medium"
                                                    >
                                                        {expanded ? "Tampilkan lebih sedikit" : "Baca selengkapnya"}
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-slate-400">-</span>
                                        )}
                                    </div>
                                </FormRow>

                                <FormRow label="Keuntungan">
                                    <div className="bg-white border border-slate-200 rounded-lg p-4 w-full">
                                        {Array.isArray(product.benefit) && product.benefit.length > 0 ? (
                                            <ul className="list-disc list-inside space-y-1">
                                                {(product.benefit as string[]).map((item, index) => (
                                                    <li key={index} className="text-slate-800 font-medium">
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <span className="text-slate-400">-</span>
                                        )}
                                    </div>
                                </FormRow>

                                <FormRow label="Tipe">
                                    <div className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 w-full text-slate-800 font-medium">
                                        {Number(product.price) === 0 ? "Gratis" : "Berbayar"}
                                    </div>
                                </FormRow>

                                <FormRow label="Harga">
                                    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-4 py-2.5 w-full">
                                        <span className={cn(
                                            "font-medium",
                                            product.discountPrice && Number(product.discountPrice) > 0 ? "line-through text-slate-400" : "text-slate-800"
                                        )}>
                                            {Number(product.price) === 0
                                                ? "Rp 0"
                                                : `Rp ${Number(product.price).toLocaleString("id-ID")}`}
                                        </span>
                                        {product.discountPrice && Number(product.discountPrice) > 0 && (
                                            <span className="font-semibold text-emerald-600">
                                                Rp {Number(product.discountPrice).toLocaleString("id-ID")}
                                            </span>
                                        )}
                                    </div>
                                </FormRow>

                                <div className="pt-8">
                                    <SectionHeader title={
                                        isWebinar ? "Detail Webinar" : isKelas ? "Detail Kelas" : "Detail Produk Digital"
                                    } />

                                    <div className="space-y-0 pt-6">
                                        {/* Webinar-specific */}
                                        {isWebinar && (
                                            <>
                                                <FormRow label="Platform">
                                                    <div className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 w-full font-medium capitalize text-slate-800">
                                                        {product.contentType || "-"}
                                                    </div>
                                                </FormRow>
                                                <FormRow label="Jadwal Webinar">
                                                    <div className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 w-full font-medium text-slate-800">
                                                        {product.startDate ? (
                                                            `${format(new Date(product.startDate), "d MMMM yyyy, HH:mm", { locale: idLocale })}${product.endDate ? ` - ${format(new Date(product.endDate), "HH:mm", { locale: idLocale })}` : ""}`
                                                        ) : (
                                                            "-"
                                                        )}
                                                    </div>
                                                </FormRow>
                                                <FormRow label="Batas Pendaftaran">
                                                    <div className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 w-full font-medium text-slate-800">
                                                        {product.dateDeadline ? format(new Date(product.dateDeadline), "d MMMM yyyy, HH:mm", { locale: idLocale }) : "-"}
                                                    </div>
                                                </FormRow>
                                                <FormRow label="Kuota">
                                                    <div className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 w-full font-medium text-slate-800">
                                                        {product.capacity ? (Number(product.capacity) === 0 ? "Tidak Terbatas" : `${product.capacity} Peserta`) : "Tidak Terbatas"}
                                                    </div>
                                                </FormRow>
                                            </>
                                        )}

                                        {/* Kelas-specific */}
                                        {isKelas && (
                                            <>
                                                <FormRow label="Platform">
                                                    <div className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 w-full font-medium capitalize text-slate-800">
                                                        {product.contentType || "-"}
                                                    </div>
                                                </FormRow>
                                                <FormRow label="Durasi">
                                                    <div className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 w-full font-medium text-slate-800">
                                                        {product.duration ?? "-"}
                                                    </div>
                                                </FormRow>
                                                <FormRow label="Batasi Kuota">
                                                    <div className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 w-full font-medium text-slate-800">
                                                        {product.capacity ? (Number(product.capacity) === 0 ? "Tidak Terbatas" : `${product.capacity} Peserta`) : "Tidak Terbatas"}
                                                    </div>
                                                </FormRow>
                                            </>
                                        )}

                                        {/* Digital-specific */}
                                        {isDigital && (
                                            <>
                                                <FormRow label="Tipe Konten">
                                                    <div className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 w-full font-medium capitalize text-slate-800">
                                                        {product.contentType || "-"}
                                                    </div>
                                                </FormRow>
                                                <FormRow label="Batasi Stok">
                                                    <div className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 w-full font-medium text-slate-800">
                                                        {product.capacity ? (Number(product.capacity) === 0 ? "Tidak Terbatas" : `${product.capacity} Unit`) : "Tidak Terbatas"}
                                                    </div>
                                                </FormRow>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Sidebar Metadata */}
                            <div className="shrink-0 w-full lg:w-[400px] space-y-6">
                                {/* Thumbnail */}
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <p className="text-slate-700 text-sm font-semibold mb-3">Thumbnail</p>
                                    {parsedImages.length > 0 && parsedImages[0] ? (
                                        <div className="space-y-3">
                                            <div className="w-full aspect-square bg-white rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 shadow-sm relative">
                                                <Image
                                                    src={parsedImages[activeImageIndex] || parsedImages[0] || ""}
                                                    alt={product.name}
                                                    fill
                                                    unoptimized
                                                    className="object-cover transition-all duration-300"
                                                />
                                            </div>
                                            {parsedImages.length > 1 && (
                                                <div className="flex flex-wrap gap-3">
                                                    {parsedImages.map((img, idx) => (
                                                        img ? (
                                                            <button
                                                                type="button"
                                                                key={idx}
                                                                onClick={() => setActiveImageIndex(idx)}
                                                                className={cn(
                                                                    "relative w-20 aspect-square rounded-xl overflow-hidden border shadow-sm transition-all focus:outline-none cursor-pointer",
                                                                    activeImageIndex === idx
                                                                        ? "border-cyan-600 ring-2 ring-cyan-600/20"
                                                                        : "border-slate-200 hover:border-cyan-400 hover:opacity-90 opacity-60"
                                                                )}
                                                            >
                                                                <Image
                                                                    src={img}
                                                                    alt={`${product.name} - Thumbnail ${idx + 1}`}
                                                                    fill
                                                                    unoptimized
                                                                    className="object-cover"
                                                                />
                                                            </button>
                                                        ) : null
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-full aspect-square bg-white rounded-xl overflow-hidden flex flex-col items-center justify-center border border-slate-200 shadow-sm text-slate-400 gap-2">
                                            <ImageIcon className="w-10 h-10" />
                                            <span className="text-xs">Belum ada gambar</span>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <p className="text-slate-700 text-sm font-semibold mb-3">Status</p>
                                    <div className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 w-full">
                                        <StatusBadge status={currentStatus} />
                                    </div>
                                </div>

                                {/* Pembeli */}
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <p className="text-slate-700 text-sm font-semibold mb-3">Pembeli</p>
                                    <div className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 w-full text-slate-800 text-sm">
                                        {buyerCount} Orang
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-200 text-right">
                                    <p className="text-slate-400 text-xs italic">
                                        Ditambahkan pada {format(new Date(product.createdAt), "d MMMM yyyy HH:mm", { locale: idLocale })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
