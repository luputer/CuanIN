"use client";

import {
  ArrowLeftIcon,
  ClockIcon,
  CalendarIcon,
  MapPinIcon,
  ShareNetworkIcon,
  SpinnerIcon,
  CheckCircleIcon,
  FileIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import Image from "next/image";
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
    productSlug,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <SpinnerIcon className="h-8 w-8 animate-spin text-blue-500" />
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
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-50 text-cyan-700">
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
    start && end && format(start, "yyyy-MM-dd") === format(end, "yyyy-MM-dd");

  const metaLabel =
    product.type === "DIGITAL_PRODUCT"
      ? product.format
      : product.type === "KELAS_ONLINE"
        ? product.duration
        : null;

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

          <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100">
            <ShareNetworkIcon className="h-5 w-5 text-slate-600" />
          </button>
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

              {(metaLabel ?? isWebinarOrClass) && (
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
                        product.type === "KELAS_ONLINE" ? "Durasi" : "Format"
                      }
                      value={metaLabel}
                    />
                  )}

                  {/* PLATFORM */}
                  {isWebinarOrClass && product.platform && (
                    <InfoItem
                      icon={<MapPinIcon className="h-5 w-5" />}
                      label="Platform"
                      value={product.platform}
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
                          : `${format(start, "dd MMM yyyy", { locale: idLocale })} - ${
                              end
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
            {/* IMAGE (TOP SIDEBAR) */}
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl border border-slate-300 bg-slate-100 shadow-sm lg:aspect-square lg:max-h-95">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-Wcenter text-slate-400">
                  No Image
                </div>
              )}
            </div>

            {/* CTA (BOTTOM IMAGE) */}
            <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
              <h3 className="mb-3 text-sm font-medium wrap-break-word text-slate-600">
                {product.name}
              </h3>

              <div className="mb-4 space-y-3">
                {(product.benefit as string[])?.length > 0 ? (
                  (product.benefit as string[]).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex gap-3 text-sm text-slate-800"
                    >
                      <CheckCircleIcon
                        className="h-5 w-5 shrink-0 text-green-600"
                        weight="fill"
                      />
                      <span className="min-w-0 wrap-break-word">{item}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-slate-400">Belum ada benefit</span>
                )}
              </div>

              {isWebinarOrClass && product.quota && (
                <div className="flex justify-between border-t pt-3 text-sm">
                  <span className="text-slate-500">Kuota</span>
                  <span className="font-regular text-slate-800">
                    {product.quota} peserta
                  </span>
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
                  <div className="text-xl font-bold text-green-600">Gratis</div>
                ) : (
                  <div className="text-xl font-bold text-cyan-600">
                    Rp {price.toLocaleString("id-ID")}
                  </div>
                )}
              </div>

              <Link href={`/${slug}/${productSlug}/checkout`}>
                <button className="mt-5 w-full cursor-pointer rounded-xl bg-cyan-600 py-3 font-medium text-white shadow-sm hover:bg-cyan-700">
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
