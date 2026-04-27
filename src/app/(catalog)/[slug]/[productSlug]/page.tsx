"use client";

import {
    ArrowLeftIcon,
    ClockIcon,
    CalendarIcon,
    MapPinIcon,
    ShareNetworkIcon,
    SpinnerIcon,
    CheckCircleIcon,
    FileIcon
} from "@phosphor-icons/react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { api } from "~/trpc/react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import MarkdownPreview from "~/components/MarkdownPreview";
import Footer from "~/components/layout/footer";

const TYPE_MAP: Record<string, string> = {
    WEBINAR: "Webinar",
    KELAS_ONLINE: "Kelas Online",
    DIGITAL_PRODUCT: "Produk Digital",
};

export default function ProductDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const productSlug = params.productSlug as string;

    const { data: product, isLoading } = api.catalog.getProductById.useQuery({
        slug,
        productSlug
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <SpinnerIcon className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!product) {
        notFound();
    }

    const price = Number(product.price);
    const isGratis = price === 0;
    const isWebinarOrClass =
        product.type === "WEBINAR" || product.type === "KELAS_ONLINE";

    const categoryLabel = TYPE_MAP[product.type] ?? product.type;

    const CATEGORY_STYLE: Record<string, string> = {
        WEBINAR: "bg-cyan-100 text-cyan-700 border-cyan-200",
        KELAS_ONLINE: "bg-amber-100 text-amber-700 border-amber-200",
        DIGITAL_PRODUCT: "bg-emerald-100 text-emerald-700 border-emerald-200",
    };

    const InfoItem = ({
        icon,
        label,
        value,
    }: {
        icon: React.ReactNode;
        label: string;
        value: string;
    }) => {
        return (
            <div className="flex items-center">
                <div className="flex items-center gap-1 pr-2">
                    <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-700">
                        {icon}
                    </div>

                    <div className="flex flex-col">
                        <span className="text-xs text-slate-500">{label}</span>
                        <span className="text-sm font-medium text-slate-700">{value}</span>
                    </div>
                </div>
            </div>
        );
    };

    const start = product.startDate ? new Date(product.startDate) : null;
    const end = product.endDate ? new Date(product.endDate) : null;

    const isSameDay =
        start &&
        end &&
        format(start, "yyyy-MM-dd") === format(end, "yyyy-MM-dd");

    const metaLabel =
        product.type === "DIGITAL_PRODUCT"
            ? product.format
            : product.type === "KELAS_ONLINE"
                ? product.duration
                : null;

    return (
        <div className="min-h-screen bg-slate-50">

            {/* HEADER */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link
                        href={`/${slug}`}
                        className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full"
                    >
                        <ArrowLeftIcon className="w-5 h-5 text-slate-600" />
                    </Link>

                    <button className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full">
                        <ShareNetworkIcon className="w-5 h-5 text-slate-600" />
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 pt-10 pb-16">

                {/* GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

                    {/* ───── LEFT CONTENT ───── */}
                    <div className="lg:col-span-3 flex flex-col gap-4">

                        {/* ───── MAIN INFO CARD ───── */}

                        <div className="border border-slate-300 bg-white rounded-xl p-6 md:p-8 flex flex-col gap-4 shadow-[0_-4px_0px_0px_rgba(0,146,184,100)]">

                            <span className={`text-xs px-3 py-1 rounded-full border w-fit ${CATEGORY_STYLE[product.type] ?? "bg-slate-100 text-slate-700 border-slate-200"}`}>
                                {categoryLabel}
                            </span>

                            <h1 className="text-2xl md:text-4xl font-bold text-slate-800">
                                {product.name}
                            </h1>

                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center text-xs font-bold">
                                    {product.user.name?.charAt(0).toUpperCase()}
                                </div>
                                <p className="text-sm text-slate-700 font-medium">
                                    {product.user.name}
                                </p>
                            </div>

                            <p className="text-sm text-slate-600">
                                {product.shortDescription}
                            </p>

                            {(metaLabel || isWebinarOrClass) && (
                                <div className="flex flex-wrap gap-6 text-sm text-slate-700 py-2">

                                    {/* FORMAT / DURASI */}
                                    {metaLabel && (
                                        <InfoItem
                                            icon={
                                                product.type === "KELAS_ONLINE" ? (
                                                    <ClockIcon className="w-5 h-5" />
                                                ) : (
                                                    <FileIcon className="w-5 h-5" />
                                                )
                                            }
                                            label={product.type === "KELAS_ONLINE" ? "Durasi" : "Format"}
                                            value={metaLabel}
                                        />
                                    )}

                                    {/* PLATFORM */}
                                    {isWebinarOrClass && product.platform && (
                                        <InfoItem
                                            icon={<MapPinIcon className="w-5 h-5" />}
                                            label="Platform"
                                            value={product.platform}
                                        />
                                    )}

                                    {/* TANGGAL */}
                                    {start && (
                                        <InfoItem
                                            icon={<CalendarIcon className="w-5 h-5" />}
                                            label="Tanggal"
                                            value={
                                                isSameDay
                                                    ? format(start, "dd MMMM yyyy", { locale: idLocale })
                                                    : `${format(start, "dd MMM yyyy", { locale: idLocale })} - ${end ? format(end, "dd MMM yyyy", { locale: idLocale }) : ""
                                                    }`
                                            }
                                        />
                                    )}

                                    {/* JAM (WEBINAR ONLY) */}
                                    {product.type === "WEBINAR" && start && end && (
                                        <InfoItem
                                            icon={<ClockIcon className="w-5 h-5" />}
                                            label="Waktu"
                                            value={`${format(start, "HH:mm")} - ${format(end, "HH:mm")} WIB`}
                                        />
                                    )}

                                </div>
                            )}

                        </div>


                        {/* ───── DESCRIPTION CARD (SEPARATE) ───── */}
                        {product.description && (
                            <div className="border border-slate-300 bg-white rounded-xl p-6">
                                <h2 className="text-lg font-semibold text-slate-600 mb-2">
                                    Deskripsi Produk
                                </h2>
                                <MarkdownPreview content={product.description} />
                            </div>
                        )}

                    </div>


                    {/* ───── RIGHT SIDEBAR ───── */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {/* IMAGE (TOP SIDEBAR) */}
                        <div className="w-full aspect-square bg-slate-100 rounded-3xl overflow-hidden border border-slate-300">

                            {product.image ? (
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    No Image
                                </div>
                            )}

                        </div>

                        {/* CTA (BOTTOM IMAGE) */}
                        <div className="bg-white rounded-2xl border border-slate-300 p-6 shadow-sm">

                            <h3 className="text-sm font-medium text-slate-600 mb-3">
                                {product.name}
                            </h3>

                            <div className="space-y-3 mb-4">
                                {(product.benefit as string[])?.length > 0 ? (
                                    (product.benefit as string[]).map((item, idx) => (
                                        <div key={idx} className="flex gap-3 text-sm text-slate-800">
                                            <CheckCircleIcon className="w-5 h-5 text-green-600 shrink-0" weight="fill" />
                                            <span>{item}</span>
                                        </div>
                                    ))
                                ) : (
                                    <span className="text-slate-400">Belum ada benefit</span>
                                )}
                            </div>

                            {isWebinarOrClass && product.quota && (
                                <div className="flex justify-between text-sm border-t pt-3">
                                    <span className="text-slate-500">Kuota</span>
                                    <span className="font-regular text-slate-800">
                                        {product.quota} peserta
                                    </span>
                                </div>
                            )}

                            {isWebinarOrClass && product.dateDeadline && (
                                <div className="flex justify-between text-sm mt-2">
                                    <span className="text-slate-500">Batas Pendaftaran</span>
                                    <span className="font-regular text-red-500">
                                        {format(new Date(product.dateDeadline), "dd MMM yyyy", {
                                            locale: idLocale,
                                        })}
                                    </span>
                                </div>
                            )}

                            <div className="mt-4">
                                {isGratis ? (
                                    <div className="text-xl font-bold text-green-600">
                                        Gratis
                                    </div>
                                ) : (
                                    <div className="text-xl font-bold text-cyan-600">
                                        Rp {price.toLocaleString("id-ID")}
                                    </div>
                                )}
                            </div>

                            <Link href={`/${slug}/${productSlug}/checkout`}>
                                <button className="mt-5 w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm font-medium rounded-xl cursor-pointer">
                                    {isGratis ? "Daftar Sekarang" : "Beli Sekarang"}
                                </button>
                            </Link>

                        </div>

                    </div>

                </div>

            </div>

            <Footer />
        </div>
    );
}