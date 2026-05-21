"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeftIcon,
  ClockIcon,
  CalendarIcon,
  CalendarBlankIcon,
  MapPinIcon,
  ShareNetworkIcon,
  CheckCircleIcon,
  FileIcon,
  ImagesIcon,
  CopyIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import Image from "next/image";
import { useParams, notFound } from "next/navigation";
import { api } from "~/trpc/react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import MarkdownPreview from "~/components/MarkdownPreview";
import Footer from "~/components/layout/footer";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";

const TYPE_MAP: Record<string, string> = {
  WEBINAR: "Webinar",
  KELAS_ONLINE: "Kelas",
  DIGITAL_PRODUCT: "Produk Digital",
};

const PLATFORM_MAP: Record<string, string> = {
  zoom: "Zoom",
  "google-meet": "Google Meet",
  website: "Website Kelas",
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

const WhatsappIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.058 5.348 5.4 0 12.008 0c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.347 12.006-11.957 12.006-.003 0-.005 0-.008 0-2.005-.001-3.978-.502-5.733-1.45L0 24zM5.889 19.538c1.678.995 3.335 1.523 5.305 1.524 5.358 0 9.713-4.321 9.716-9.63.001-2.574-1.002-4.997-2.825-6.82S13.9 1.83 11.328 1.83c-5.362 0-9.717 4.317-9.72 9.629-.002 1.892.487 3.739 1.471 5.314l-.997 3.64 3.742-.975zm11.367-4.82c-.08-.13-.294-.21-.617-.37-.324-.16-1.917-.94-2.21-1.05-.294-.11-.507-.16-.72.16-.214.32-.83.105-1.017.32-.188.21-.375.24-.7.08-.324-.16-1.365-.5-2.602-1.6-1-.89-1.676-2-1.87-2.32-.196-.32-.02-.49.14-.65.147-.14.324-.37.487-.56.16-.19.214-.32.324-.54.11-.21.05-.4-.03-.56-.08-.16-.72-1.73-.986-2.37-.26-.63-.524-.55-.72-.56-.188-.01-.403-.01-.617-.01-.214 0-.56.08-.854.4-.294.32-1.123 1.1-1.123 2.68 0 1.58 1.15 3.11 1.31 3.33.16.21 2.26 3.45 5.48 4.84.76.33 1.36.53 1.82.68.77.24 1.47.21 2.03.12.62-.09 1.917-.78 2.19-1.54.27-.76.27-1.41.19-1.54z" />
  </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const MOCK_RECOMMENDATIONS = [
  {
    id: "mock-1",
    name: "Masterclass Next.js 15 & TypeScript untuk Pemula",
    shortDescription: "Pelajari pembuatan aplikasi web modern berskala besar menggunakan Next.js App Router, TailwindCSS, dan Prisma DB.",
    price: 149000,
    type: "KELAS_ONLINE",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=60",
    slug: "masterclass-nextjs",
    duration: "12 Jam",
    startDate: null,
    endDate: null,
  },
  {
    id: "mock-2",
    name: "E-Book Premium: Panduan Copywriting yang Menjual",
    shortDescription: "Rahasia menulis teks promosi yang menarik perhatian pembeli dan meningkatkan konversi penjualan Anda hingga 300%.",
    price: 49000,
    type: "DIGITAL_PRODUCT",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60",
    slug: "copywriting-menjual",
    contentType: "E-Book (PDF)",
    startDate: null,
    endDate: null,
  }
];

function RecommendationCard({
  product,
  creatorSlug,
}: {
  product: {
    id: string;
    name: string;
    shortDescription: string | null;
    price: number | string;
    type: string;
    image: string | null;
    slug: string | null;
    startDate?: Date | null;
    endDate?: Date | null;
    contentType?: string | null;
    duration?: string | null;
  };
  creatorSlug: string;
}) {
  const price = Number(product.price);
  const isGratis = price === 0;
  const categoryLabel = TYPE_MAP[product.type] ?? product.type;

  const CATEGORY_STYLE: Record<string, string> = {
    WEBINAR: "bg-cyan-100 text-cyan-700 border-cyan-200",
    KELAS_ONLINE: "bg-amber-100 text-amber-700 border-amber-200",
    DIGITAL_PRODUCT: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  const isWebinarCompleted =
    product.type === "WEBINAR" &&
    product.endDate &&
    new Date() > new Date(product.endDate);

  const extraInfo = (() => {
    if (product.type === "WEBINAR" && product.startDate) {
      const date = new Date(product.startDate);

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

    if (product.type === "DIGITAL_PRODUCT" && product.contentType) {
      return (
        <span className="flex items-center gap-1 text-xs font-medium text-slate-600">
          <FileIcon weight="fill" />
          {product.contentType}
        </span>
      );
    }

    if (product.type === "KELAS_ONLINE" && product.duration) {
      return (
        <span className="flex items-center gap-1 text-xs font-medium text-slate-600">
          <ClockIcon weight="fill" />
          {product.duration}
        </span>
      );
    }

    return null;
  })();

  const targetHref = product.id.startsWith("mock-")
    ? "#"
    : `/${creatorSlug}/${product.slug || product.id}`;

  return (
    <Link href={targetHref} className="block h-full">
      <div className="group relative h-full flex flex-col cursor-pointer overflow-hidden rounded-xl border border-slate-300 bg-white px-4 py-4 transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 hover:border-slate-400">
        {/* Thumbnail */}
        <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-slate-100">
          {/* Category overlay */}
          {categoryLabel && (
            <span
              className={`absolute top-2 left-2 z-10 rounded-full border px-4 py-0.5 text-[10px] font-medium ${CATEGORY_STYLE[product.type] ?? "border-slate-200 bg-slate-100 text-slate-700"} `}
            >
              {categoryLabel}
            </span>
          )}

          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              unoptimized
              className="object-cover"
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
              {product.name}
            </p>
            <p className="font-regular mb-2 line-clamp-2 min-h-[2rem] text-xs leading-snug text-slate-600">
              {product.shortDescription}
            </p>

            {extraInfo && <p>{extraInfo}</p>}
          </div>

          <div className="mt-2 flex flex-col gap-2.5">
            <div>
              {isGratis ? (
                <span className="text-md font-semibold text-green-600">Gratis</span>
              ) : (
                <span className="text-md font-semibold text-cyan-600">
                  Rp {price.toLocaleString("id-ID")}
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

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const productSlug = params.productSlug as string;
  const recordedProductIdRef = useRef<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { data: product, isLoading } = api.catalog.getProductById.useQuery({
    slug,
    productSlug,
  });

  const { mutate: recordView } = api.analytics.recordView.useMutation();

  useEffect(() => {
    if (!product?.id) return;
    if (recordedProductIdRef.current === product.id) return;

    recordedProductIdRef.current = product.id;

    recordView({
      productId: product.id,
      visitorId: getVisitorId(),
    });
  }, [product?.id, recordView]);

  const [shareUrl, setShareUrl] = useState("");
  const [navigatorShareSupported, setNavigatorShareSupported] = useState(false);

  useEffect(() => {
    setShareUrl(window.location.href);
    setNavigatorShareSupported(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 animate-pulse">
        {/* Header skeleton */}
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
            <div className="h-10 w-10 rounded-full bg-slate-200" />
            <div className="h-10 w-10 rounded-full bg-slate-200" />
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 pt-10 pb-16">
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-5">
            {/* LEFT */}
            <div className="flex flex-col gap-4 lg:col-span-3">
              {/* Main info card */}
              <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 md:p-8">
                <div className="h-6 w-24 rounded-full bg-slate-200" />
                <div className="h-9 w-3/4 rounded-xl bg-slate-200" />
                <div className="h-5 w-full rounded-xl bg-slate-200 md:hidden" />
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-slate-200" />
                  <div className="h-4 w-32 rounded-full bg-slate-200" />
                </div>
                <div className="space-y-2">
                  <div className="h-3.5 w-full rounded-full bg-slate-200" />
                  <div className="h-3.5 w-5/6 rounded-full bg-slate-200" />
                  <div className="h-3.5 w-4/6 rounded-full bg-slate-200" />
                </div>
                <div className="flex flex-wrap gap-4 py-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-slate-200" />
                      <div className="space-y-1">
                        <div className="h-3 w-16 rounded-full bg-slate-200" />
                        <div className="h-4 w-24 rounded-full bg-slate-200" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description card */}
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="mb-4 h-5 w-40 rounded-full bg-slate-200" />
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`h-3.5 rounded-full bg-slate-200 ${i % 3 === 0 ? "w-3/5" : i % 2 === 0 ? "w-4/5" : "w-full"}`} />
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="flex flex-col gap-6 lg:col-span-2">
              {/* Image skeleton */}
              <div className="aspect-4/3 w-full rounded-2xl bg-slate-200 lg:aspect-square lg:max-h-95" />

              {/* CTA card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="mb-4 h-5 w-3/4 rounded-full bg-slate-200" />
                <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-slate-200" />
                      <div className="h-3.5 w-3/4 rounded-full bg-slate-200" />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between border-t pt-3">
                  <div className="h-4 w-12 rounded-full bg-slate-200" />
                  <div className="h-4 w-20 rounded-full bg-slate-200" />
                </div>
                <div className="mt-4 h-7 w-1/3 rounded-full bg-slate-200" />
                <div className="mt-5 h-12 w-full rounded-xl bg-slate-200" />
              </div>
            </div>
          </div>
        </div>
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

  const isWebinarCompleted =
    product.type === "WEBINAR" &&
    ((product.endDate && new Date() > new Date(product.endDate)) ||
      product.status === "archived");

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
        <div className="flex items-center gap-2 pr-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-cyan-700">
            {icon}
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-slate-600">{label}</span>
            <span className="text-sm font-medium text-slate-700">{value}</span>
          </div>
        </div>
      </div>
    );
  };

  const start = product.startDate ? new Date(product.startDate) : null;
  const end = product.endDate ? new Date(product.endDate) : null;

  const isSameDay =
    start && end && format(start, "yyyy-MM-dd") === format(end, "yyyy-MM-dd");

  const metaLabel =
    product.type === "DIGITAL_PRODUCT"
      ? product.contentType
      : product.type === "KELAS_ONLINE"
        ? product.duration
        : null;

  const additionalImages = Array.isArray(product.images)
    ? (product.images as string[])
    : [];
  const allImages = Array.from(
    new Set([product.image, ...additionalImages].filter(Boolean) as string[])
  );
  const currentImage = allImages[activeImageIndex] || allImages[0] || product.image;

  const otherProducts = (product.user.products ?? []).filter(
    (p: any) => p.id !== product.id
  );
  const recommendationList = (otherProducts.length > 0 ? otherProducts : MOCK_RECOMMENDATIONS).slice(0, 4);

  const handleCopyLinkOnly = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link produk berhasil disalin!");
    } catch {
      toast.error("Gagal menyalin link");
    }
  };

  const handleNativeShareOnly = async () => {
    if (!product) return;
    try {
      await navigator.share({
        title: product.name,
        text: product.shortDescription ?? "",
        url: shareUrl,
      });
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        await handleCopyLinkOnly();
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link

            href={`/${slug}`}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100"
          >
            <ArrowLeftIcon className="h-5 w-5 text-slate-600" />
          </Link>

          <Popover>
            <PopoverTrigger asChild>
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 cursor-pointer border border-slate-200 transition-all duration-200"
              >
                <ShareNetworkIcon className="h-5 w-5 text-slate-600" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 rounded-xl border border-slate-200 bg-white shadow-xl" align="end">
              <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex flex-col gap-1">
                  <h4 className="text-sm font-semibold text-slate-800">Bagikan Produk</h4>
                </div>

                {/* Quick Share Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(product.name + " - " + shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg border border-slate-100 hover:bg-emerald-50 hover:border-emerald-200 group transition-all duration-200 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 transition-all duration-200 group-hover:scale-110">
                      <WhatsappIcon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-600 group-hover:text-emerald-700">WhatsApp</span>
                  </a>

                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg border border-slate-100 hover:bg-blue-50 hover:border-blue-200 group transition-all duration-200 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 transition-all duration-200 group-hover:scale-110">
                      <FacebookIcon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-600 group-hover:text-blue-700">Facebook</span>
                  </a>

                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(product.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg border border-slate-100 hover:bg-slate-50 hover:border-slate-200 group transition-all duration-200 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 transition-all duration-200 group-hover:scale-110">
                      <TwitterIcon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-600 group-hover:text-slate-900">Twitter / X</span>
                  </a>
                </div>

                {/* Divider */}
                <div className="h-px bg-slate-100 my-1" />

                {/* Link Copy Field */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Tautan Produk</span>
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1.5">
                    <span className="flex-1 truncate text-xs text-slate-600 px-1 font-mono">{shareUrl}</span>
                    <button
                      onClick={handleCopyLinkOnly}
                      className="flex h-7 px-3 items-center justify-center gap-1 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white font-medium text-[11px] cursor-pointer shadow-sm active:translate-y-[1px] transition-all shrink-0"
                    >
                      <CopyIcon className="w-3.5 h-3.5" weight="bold" />
                      <span>Salin</span>
                    </button>
                  </div>
                </div>

                {/* Web Share API Native Trigger (Conditional) */}
                {navigatorShareSupported && (
                  <button
                    onClick={handleNativeShareOnly}
                    className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 py-2 text-xs font-semibold text-slate-700 cursor-pointer transition-all duration-200"
                  >
                    <ShareNetworkIcon className="w-4 h-4 text-slate-500" />
                    <span>Metode Berbagi Lainnya</span>
                  </button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-10 pb-16">
        {/* GRID */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-5">
          {/* ───── LEFT CONTENT ───── */}
          <div className="flex flex-col gap-4 lg:col-span-3">
            {/* ───── MAIN INFO CARD ───── */}

            <div className="flex flex-col gap-4 rounded-xl border border-slate-300 bg-white p-6 shadow-[0_-4px_0px_0px_rgba(0,146,184,100)] md:p-8">
              <span
                className={`w-fit rounded-full border px-3 py-1 text-xs ${CATEGORY_STYLE[product.type] ?? "border-slate-200 bg-slate-100 text-slate-700"}`}
              >
                {categoryLabel}
              </span>

              <h1 className="text-2xl font-bold text-slate-800 md:text-4xl">
                {product.name}
              </h1>

              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-200 text-xs font-bold">
                  {product.user.name?.charAt(0).toUpperCase()}
                </div>
                <p className="text-sm font-medium text-slate-700">
                  {product.user.name}
                </p>
              </div>

              <p className="text-sm text-slate-600">
                {product.shortDescription}
              </p>

              {(!!metaLabel || isWebinarOrClass || !!start) && (
                <div className="flex flex-wrap gap-6 py-2 text-sm text-slate-700">
                  {/* FORMAT / DURASI */}
                  {metaLabel && (
                    <InfoItem
                      icon={
                        product.type === "KELAS_ONLINE" ? (
                          <ClockIcon className="h-5 w-5" />
                        ) : (
                          <FileIcon className="h-5 w-5" />
                        )
                      }
                      label={
                        product.type === "KELAS_ONLINE" ? "Durasi" : "Tipe Konten"
                      }
                      value={metaLabel}
                    />
                  )}

                  {/* PLATFORM */}
                  {isWebinarOrClass && (
                    <InfoItem
                      icon={<MapPinIcon className="h-5 w-5" />}
                      label="Platform"
                      value={
                        product.contentType
                          ? (PLATFORM_MAP[product.contentType.toLowerCase()] ?? product.contentType)
                          : "Online"
                      }
                    />
                  )}

                  {/* TANGGAL */}
                  {start && (
                    <InfoItem
                      icon={<CalendarIcon className="h-5 w-5" />}
                      label="Tanggal"
                      value={
                        isSameDay
                          ? format(start, "dd MMMM yyyy", { locale: idLocale })
                          : `${format(start, "dd MMM yyyy", { locale: idLocale })} - ${end
                            ? format(end, "dd MMM yyyy", {
                              locale: idLocale,
                            })
                            : ""
                          }`
                      }
                    />
                  )}

                  {/* JAM (WEBINAR ONLY) */}
                  {product.type === "WEBINAR" && start && end && (
                    <InfoItem
                      icon={<ClockIcon className="h-5 w-5" />}
                      label="Waktu"
                      value={`${format(start, "HH:mm")} - ${format(end, "HH:mm")} WIB`}
                    />
                  )}
                </div>
              )}
            </div>

            {/* ───── DESCRIPTION CARD (SEPARATE) ───── */}
            {product.description && (
              <div className="rounded-xl border border-slate-300 bg-white p-6">
                <h2 className="mb-2 text-lg font-semibold text-slate-600">
                  Deskripsi Produk
                </h2>
                <MarkdownPreview content={product.description} />
              </div>
            )}
          </div>

          {/* ───── RIGHT SIDEBAR ───── */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* IMAGE & CAROUSEL PREVIEW (TOP SIDEBAR) */}
            <div className="flex flex-col gap-2.5">
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl border border-slate-300 bg-slate-100 shadow-sm lg:aspect-square lg:max-h-95">
                {currentImage ? (
                  <Image
                    src={currentImage}
                    alt={product.name}
                    fill
                    unoptimized
                    className="object-cover transition-all duration-300"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-400">
                    <ImagesIcon className="h-12 w-12 text-slate-300" />
                  </div>
                )}
              </div>

              {/* THUMBNAILS */}
              {allImages.length > 1 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative h-16 w-16 overflow-hidden rounded-xl border-2 transition-all duration-200 cursor-pointer ${activeImageIndex === idx
                        ? "border-cyan-600 ring-2 ring-cyan-100"
                        : "border-slate-200 hover:border-slate-300"
                        }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} preview ${idx + 1}`}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* CTA (BOTTOM IMAGE) */}
            <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-md font-medium wrap-break-word text-slate-600">
                {product.name}
              </h3>

              {((product.benefit as string[])?.length ?? 0) > 0 && (
                <div className="mb-5 rounded-xl border border-cyan-100 bg-cyan-50 p-4">
                  <div className="mb-3 text-sm font-semibold text-cyan-600">
                    Yang akan Kamu dapatkan:
                  </div>
                  <div className="space-y-3">
                    {(product.benefit as string[]).map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 text-sm text-slate-700"
                      >
                        <CheckCircleIcon
                          className="h-5 w-5 shrink-0 text-cyan-600 mt-0.5"
                          weight="fill"
                        />
                        <span className="min-w-0 wrap-break-word leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* KUOTA (WEBINAR & KELAS ONLINE) */}
              {(product.type === "WEBINAR" || product.type === "KELAS_ONLINE") && (
                <div className="flex justify-between border-t pt-3 text-sm">
                  <span className="text-slate-500">Kuota</span>
                  <div className="flex flex-col items-end">
                    <span className="font-regular text-slate-800">
                      {product.capacity && product.capacity > 0 ? `${product.capacity} peserta` : "Tak Terbatas"}
                    </span>
                    {(product.capacity ?? 0) > 0 && (product._count?.purchases ?? 0) >= product.capacity! && !isWebinarCompleted && (
                      <span className="text-[10px] font-bold text-red-500 uppercase">Sudah Full</span>
                    )}
                  </div>
                </div>
              )}

              {/* STOK (DIGITAL PRODUCT) */}
              {product.type === "DIGITAL_PRODUCT" && (
                <div className="flex justify-between border-t pt-3 text-sm">
                  <span className="text-slate-500">Stok</span>
                  <div className="flex flex-col items-end">
                    <span className="font-regular text-slate-800">
                      {product.capacity && product.capacity > 0 ? `${product.capacity} item` : "Tak Terbatas"}
                    </span>
                    {(product.capacity ?? 0) > 0 && (product._count?.purchases ?? 0) >= product.capacity! && (
                      <span className="text-[10px] font-bold text-red-500 uppercase">Habis</span>
                    )}
                  </div>
                </div>
              )}

              {isWebinarOrClass && product.dateDeadline && (
                <div className="mt-2 flex justify-between text-sm">
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
                  <div className="text-xl font-semibold text-green-600">Gratis</div>
                ) : (
                  <div className="text-xl font-bold text-cyan-600">
                    Rp {price.toLocaleString("id-ID")}
                  </div>
                )}
              </div>

              {isWebinarCompleted ? (
                <button
                  disabled
                  className="mt-5 w-full rounded-xl bg-slate-300 py-3 font-medium text-slate-500 shadow-sm cursor-not-allowed"
                >
                  Webinar sudah selesai
                </button>
              ) : product.capacity && product.capacity > 0 && (product._count?.purchases ?? 0) >= product.capacity ? (
                <button
                  disabled
                  className="mt-5 w-full rounded-xl bg-slate-300 py-3 font-medium text-slate-500 shadow-sm cursor-not-allowed"
                >
                  {product.type === "DIGITAL_PRODUCT" ? "Stok sudah habis" : "Kuota sudah penuh"}
                </button>
              ) : (
                <Link href={`/${slug}/${productSlug}/checkout`}>
                  <button className="mt-5 w-full cursor-pointer rounded-xl bg-cyan-600 py-3 text-lg font-semibold text-white shadow-sm hover:bg-cyan-700">
                    {isGratis ? "Daftar Sekarang" : "Beli Sekarang"}
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SEPARATOR BORDER */}
      <div className="mx-auto max-w-6xl px-4">
        <div className="border-t border-slate-300"></div>
      </div>

      {/* ───── RECOMMENDATIONS SECTION ───── */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-6 text-xl font-bold text-slate-800 md:text-2xl">
          Rekomendasi Produk Lainnya
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {recommendationList.map((rec) => {
            const normalized = {
              ...rec,
              price: (rec as any)?.price && typeof (rec as any)?.price === "object" && typeof (rec as any)?.price.toNumber === "function"
                ? (rec as any).price.toNumber()
                : (rec as any).price,
            };

            return (
              <RecommendationCard key={rec.id} product={normalized} creatorSlug={slug} />
            );
          })}
        </div>
      </div>

      <Footer />
    </div>
  );
}
