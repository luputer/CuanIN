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
import { Skeleton } from "~/components/ui/skeleton";
import { useState, useRef, useEffect } from "react";
import { SectionHeader } from "~/components/ui/form-layout";
import React from "react";

export default function AdminCreatorProductDetailPage() {
    const params = useParams();
    const id = params.id as string; // creatorId
    const productId = params.productId as string;

    const { data: product, isLoading } = api.products.adminGetById.useQuery(
        { id: productId },
        { enabled: !!productId }
    );

    const [expanded, setExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const descriptionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (descriptionRef.current && product?.description) {
            const isClamped = descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight;
            if (isClamped) {
                setIsOverflowing(true);
            }
        }
    }, [product?.description]);

    const Label = ({ children }: { children: React.ReactNode }) => (
        <div className="w-full sm:w-48 md:w-60 shrink-0 text-slate-500 text-sm font-medium leading-6">{children}</div>
    );

    const Value = ({ children }: { children: React.ReactNode }) => (
        <div className="flex-1 text-slate-800 text-sm font-medium leading-6">
            {children}
        </div>
    );

    const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
        <div className="flex flex-col sm:flex-row items-start pb-6 sm:pb-8 gap-1 sm:gap-8">
            <Label>{label}</Label>
            <Value>{children}</Value>
        </div>
    );

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "published": return "bg-green-100 rounded-full px-4 py-1 w-fit text-green-700";
            case "unpublished": return "bg-slate-200 rounded-full px-4 py-1 w-fit text-slate-500";
            case "archived": return "bg-blue-100 rounded-full px-4 py-1 w-fit text-blue-700";
            default: return "bg-slate-200 rounded-full px-4 py-1 w-fit text-slate-500";
        }
    };


    // ─── Loading ───
    if (isLoading) {
        return (
            <div className="w-full space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <Skeleton className="h-8 w-64" />
                <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
                    <div className="p-6 space-y-6">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-40 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <p className="text-slate-500 text-lg">Produk tidak ditemukan.</p>
                <Link href={`/admin/kreator/${id}/produk`} className="text-blue-500 hover:underline">
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

    const displayStatus =
        currentStatus === "archived"
            ? "Selesai"
            : currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1);

    return (
        <div className="space-y-6">
            {/* Sticky top bar — back link only */}
            <div className="bg-slate-50">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sticky top-[74px] bg-slate-50 z-40 -mx-4 px-4 pt-2">
                    <div className="flex-1 flex flex-col gap-1">
                        <Link
                            href={`/admin/kreator/${id}/produk`}
                            className="group flex items-center gap-2 text-sm font-regular text-slate-600 hover:text-slate-800 transition-colors w-fit mb-2"
                        >
                            <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                            <span className="leading-none">Kembali ke Daftar Produk</span>
                        </Link>
                        <h1 className="text-xl font-semibold text-slate-800">Detail Produk</h1>
                    </div>
                </div>
            </div>

            {/* Content card */}
            <div className="flex-1 bg-white rounded-xl border border-slate-800 overflow-hidden shadow-[0px_2px_0px_rgba(29,41,61)] w-full">

                {/* Sub-header: bg-cyan-50 with product name, buyer count, status */}
                <div className="bg-cyan-50 px-4 sm:px-10 py-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-lg font-semibold text-cyan-900 break-words">{product.name}</h2>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1.5 bg-white border border-cyan-200 rounded-lg px-6 py-2">
                            <span className="text-sm font-semibold text-cyan-700">{buyerCount} Pembeli</span>
                        </div>
                    </div>
                </div>

                <div className="px-4 sm:px-10 py-6 sm:py-8">

                    {/* ─── Informasi Produk ─── */}
                    <SectionHeader title={
                        isWebinar ? "Informasi Webinar"
                            : isKelas ? "Informasi Kelas"
                                : "Informasi Produk Digital"
                    } />

                    <div className="flex flex-col lg:flex-row gap-10 items-start pt-4">
                        {/* Left: detail fields */}
                        <div className="flex-1 min-w-0 space-y-0">
                            <Row label="Nama">
                                {product.name}
                            </Row>

                            {/* Creator info */}
                            <Row label="Kreator">
                                <div className="flex items-center gap-3">
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
                                        className="text-cyan-600 hover:underline font-medium text-sm"
                                    >
                                        {(product as any).user?.name ?? "-"}
                                    </Link>
                                </div>
                            </Row>
                            <Row label="Ringkasan">
                                {product.shortDescription ?? "-"}
                            </Row>

                            <Row label="Deskripsi">
                                <div>
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
                                                    className="sm:justify-start mt-2 text-sm text-slate-600 hover:underline cursor-pointer font-regular"
                                                >
                                                    {expanded ? "Tampilkan lebih sedikit" : "Baca selengkapnya"}
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-slate-400">-</span>
                                    )}
                                </div>
                            </Row>

                            <Row label="Manfaat">
                                {Array.isArray(product.benefit) && product.benefit.length > 0 ? (
                                    <ul className="list-disc list-inside space-y-1">
                                        {(product.benefit as string[]).map((item, index) => (
                                            <li key={index} className="text-slate-800 font-medium">
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                ) : "-"}
                            </Row>

                            <Row label="Tipe">
                                {Number(product.price) === 0 ? "Gratis" : "Berbayar"}
                            </Row>

                            <Row label="Harga">
                                {Number(product.price) === 0
                                    ? "Rp 0"
                                    : `Rp ${Number(product.price).toLocaleString("id-ID")}`}
                            </Row>

                            {/* Webinar-specific */}
                            {isWebinar && (
                                <Row label="Platform">
                                    {product.platform ? (
                                        <span className="capitalize">{product.platform}</span>
                                    ) : "-"}
                                </Row>
                            )}

                            {/* Digital-specific */}
                            {isDigital && (
                                <Row label="Format">
                                    <p className="w-fit font-medium bg-slate-100 text-slate-700 px-4 py-1 rounded-full">
                                        {product.format
                                            ? product.format.charAt(0).toUpperCase() + product.format.slice(1)
                                            : "-"}
                                    </p>
                                </Row>
                            )}

                            {/* Kelas-specific */}
                            {isKelas && (
                                <Row label="Durasi">
                                    {product.duration ?? "-"}
                                </Row>
                            )}

                            {/* Katalog link */}
                            <Row label="Katalog Produk">
                                {product.slug && (product as any).user?.catalog?.slug ? (
                                    <Link
                                        href={`/${(product as any).user.catalog.slug}/${product.slug}`}
                                        target="_blank"
                                        className="inline-flex items-center gap-2 bg-white border border-cyan-600 text-cyan-600 hover:bg-cyan-50 text-sm font-medium px-4 py-1.5 rounded-lg transition-all"
                                    >
                                        <ArrowSquareOutIcon className="w-4 h-4" />
                                        Lihat Produk
                                    </Link>
                                ) : <span className="text-slate-400">-</span>}
                            </Row>

                            <Row label="Status">
                                <p className={`w-fit font-medium ${getStatusColor(currentStatus)}`}>
                                    {displayStatus}
                                </p>
                            </Row>
                            {!isWebinar && (
                                <p className="text-slate-500 text-sm mt-2">
                                    Ditambahkan pada {format(new Date(product.createdAt), "d MMMM yyyy HH:mm", { locale: idLocale })}
                                </p>
                            )}
                        </div>

                        {/* Right: Thumbnail */}
                        <div className="shrink-0 w-full lg:w-90 bg-slate-100 p-4 rounded-xl border border-slate-100">
                            <p className="text-slate-700 text-sm font-medium mb-4">Thumbnail</p>
                            <div className="w-full aspect-square bg-white rounded-xl overflow-hidden flex items-center justify-center border border-slate-200">
                                {product.image ? (
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        width={256}
                                        height={256}
                                        unoptimized
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-slate-400">
                                        <ImageIcon className="w-12 h-12" />
                                        <span className="text-xs">Belum ada gambar</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ─── Jadwal (Webinar only) ─── */}
                    {isWebinar && (
                        <div className="mt-4">
                            <SectionHeader title="Jadwal" />
                            <div className="flex flex-col lg:flex-row gap-10 items-start pt-6">
                                <div className="flex-1 min-w-0 space-y-0">
                                    <Row label="Waktu Mulai">
                                        <span className="text-slate-700 text-sm font-medium">
                                            {product.startDate ? format(new Date(product.startDate), "d MMMM yyyy, HH:mm", { locale: idLocale }) : "-"}
                                        </span>
                                    </Row>
                                    <Row label="Waktu Selesai">
                                        {product.endDate ? format(new Date(product.endDate), "d MMMM yyyy, HH:mm", { locale: idLocale }) : "-"}
                                    </Row>
                                </div>
                                <div className="shrink-0 w-full lg:w-90 hidden lg:block" />
                            </div>
                        </div>
                    )}

                    {/* ─── Pendaftaran (Webinar only) ─── */}
                    {isWebinar && (
                        <div className="mt-4">
                            <SectionHeader title="Pendaftaran" />
                            <div className="flex flex-col lg:flex-row gap-10 items-start pt-6">
                                <div className="flex-1 min-w-0 space-y-0">
                                    <Row label="Batas Pendaftaran">
                                        {product.dateDeadline ? format(new Date(product.dateDeadline), "d MMMM yyyy, HH:mm", { locale: idLocale }) : "-"}
                                    </Row>
                                    <Row label="Kuota">
                                        {product.quota ? (Number(product.quota) === 0 ? "Tidak Terbatas" : product.quota) : "Tidak Terbatas"}
                                    </Row>
                                </div>
                                <div className="shrink-0 w-full lg:w-90 hidden lg:block" />
                            </div>
                        </div>
                    )}

                    {/* Tanggal dibuat — Webinar: letakkan setelah Pendaftaran */}
                    {isWebinar && (
                        <p className="text-slate-500 text-sm mt-6">
                            Ditambahkan pada {format(new Date(product.createdAt), "d MMMM yyyy HH:mm", { locale: idLocale })}
                        </p>
                    )}

                </div>
            </div>
        </div>
    );
}
