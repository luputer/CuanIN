"use client";

import { ArrowLeft, Clock, Calendar, MapPin, Share2, ImageIcon, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { api } from "~/trpc/react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

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
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!product) {
        notFound();
    }

    const price = Number(product.price);
    const isGratis = price === 0;
    const isWebinarOrClass = product.type === "WEBINAR" || product.type === "KELAS_ONLINE";
    const categoryLabel = TYPE_MAP[product.type] ?? product.type;

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: product.name,
                    text: `Lihat produk ${product.name} dari ${product.user.name} di CuanIN`,
                    url: window.location.href,
                });
            } else {
                await navigator.clipboard.writeText(window.location.href);
                alert("Link berhasil disalin!");
            }
        } catch (error) {
            console.error("Error sharing:", error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header Navigation */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link
                        href={`/${slug}`}
                        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>

                    <button
                        onClick={handleShare}
                        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors"
                    >
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Image Banner */}
                        <div className="w-full aspect-video bg-slate-200 rounded-2xl overflow-hidden relative border border-slate-100">
                            {product.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <ImageIcon className="w-12 h-12 text-slate-400" strokeWidth={1} />
                                </div>
                            )}
                            <div className="absolute top-4 left-4">
                                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-700 text-sm font-medium rounded-full shadow-sm">
                                    {categoryLabel}
                                </span>
                            </div>
                        </div>

                        {/* Title & Creator */}
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                                {product.name}
                            </h1>
                            <div className="flex items-center gap-3 mt-4 text-slate-600">
                                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                                    {product.user.image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={product.user.image} alt={product.user.name ?? ""} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-sm">
                                            {product.user.name?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Kreator</p>
                                    <p className="font-medium text-slate-800">{product.user.name}</p>
                                </div>
                            </div>
                        </div>

                        {/* Descripticatalogon */}
                        {product.description && (
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
                                <h3 className="font-semibold text-slate-800 mb-4">Deskripsi</h3>
                                <div className="prose prose-sm prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
                                    {product.description}
                                </div>
                            </div>
                        )}

                        {/* Event Details (If Webinar/Class) */}
                        {isWebinarOrClass && product.startDate && (
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
                                <h3 className="font-semibold text-slate-800 mb-4">Tentang {categoryLabel}</h3>
                                <div className="space-y-4 divide-y divide-slate-100">
                                    <div className="flex items-center justify-between py-3">
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium">Platform / Lokasi</span>
                                        </div>
                                        <span className="text-slate-800 font-medium">Online</span>
                                    </div>
                                    <div className="flex items-center justify-between py-3">
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                                <Calendar className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium">Tanggal Pelaksanaan</span>
                                        </div>
                                        <span className="text-slate-800 font-medium">
                                            {format(new Date(product.startDate), "dd MMMM yyyy", { locale: idLocale })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-3">
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                                <Clock className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium">Waktu</span>
                                        </div>
                                        <span className="text-slate-800 font-medium">
                                            {format(new Date(product.startDate), "HH:mm")}
                                            {product.endDate && ` - ${format(new Date(product.endDate), "HH:mm")} WIB`}
                                            {!product.endDate && " WIB"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Pricing / CTA */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-24 shadow-sm">
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-slate-500 mb-2">Pendaftaran {categoryLabel}</h3>
                                {isGratis ? (
                                    <div className="text-3xl font-bold text-green-600">Gratis</div>
                                ) : (
                                    <div className="text-3xl font-bold text-slate-900">
                                        Rp {price.toLocaleString("id-ID")}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-start gap-3 text-slate-600 text-sm">
                                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                    <span>Akses ke materi {categoryLabel.toLowerCase()}</span>
                                </div>
                                {isWebinarOrClass && (
                                    <div className="flex items-start gap-3 text-slate-600 text-sm">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                        <span>Bergabung di sesi langsung (Live)</span>
                                    </div>
                                )}
                                <div className="flex items-start gap-3 text-slate-600 text-sm">
                                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                    <span>Dukungan langsung dari platform</span>
                                </div>
                            </div>

                            <Link href={`/${slug}/${productSlug}/checkout`} className="block w-full">
                                <button className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all active:scale-[0.98] shadow-sm hover:shadow text-center">
                                    {isGratis ? "Daftar Sekarang" : "Beli Sekarang"}
                                </button>
                            </Link>

                            <p className="text-xs text-center text-slate-400 mt-4 leading-relaxed">
                                Dengan mendaftar, kamu menyetujui Syarat & Ketentuan yang berlaku.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
