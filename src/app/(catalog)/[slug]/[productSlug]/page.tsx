"use client";

import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  FileIcon,
  ImagesIcon,
  MapPinIcon,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { api } from "~/trpc/react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import MarkdownPreview from "~/components/shared/markdown/preview";
import Footer from "~/components/layout/footer";
import { getProductTypeLabel, CATEGORY_STYLE, CATEGORY_STYLE_DEFAULT, PLATFORM_MAP } from "~/lib/constants";
import { getVisitorId } from "~/lib/visitor";
import { CatalogProductCard } from "~/components/catalog/product-card";
import { CatalogNavHeader, CatalogNavHeaderSkeleton } from "~/components/layout/catalog-nav-header";
import { InfoItem } from "~/components/catalog/info-item";
import { ProductMainInfoCard } from "~/components/catalog/product-main-info-card";
import { CardContainer } from "~/components/ui/card-container";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 animate-pulse">
      <CatalogNavHeaderSkeleton withShare />

      <div className="mx-auto max-w-6xl px-4 pt-10 pb-16">
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-5 lg:items-start">
          {/* LEFT */}
          <div className="flex flex-col gap-4 lg:col-span-3">
            {/* Main info card */}
            <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 md:p-8">
              <div className="h-6 w-24 rounded-full bg-slate-200" />
              <div className="h-7 md:h-9 w-3/4 rounded-xl bg-slate-200" />
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-slate-200" />
                <div className="h-4 w-32 rounded-full bg-slate-200" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full rounded-full bg-slate-200" />
                <div className="h-3 w-5/6 rounded-full bg-slate-200" />
              </div>
            </div>

            {/* Image Placeholder (Mobile only) */}
            <div className="aspect-4/3 w-full rounded-2xl bg-slate-200 lg:hidden" />

            {/* Description card */}
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="mb-4 h-5 w-40 rounded-full bg-slate-200" />
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-3 rounded-full bg-slate-200 ${i === 3 ? "w-3/5" : "w-full"}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <div className="hidden lg:block aspect-square w-full rounded-2xl bg-slate-200" />
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="mb-4 h-5 w-3/4 rounded-full bg-slate-200" />
              <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-slate-200" />
                    <div className="h-3 w-3/4 rounded-full bg-slate-200" />
                  </div>
                ))}
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

// ─── Main Page ────────────────────────────────────────────────────────────────


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

  if (isLoading) return <ProductDetailSkeleton />;
  if (!product) notFound();

  const price = Number(product.price);
  const discountPrice =
    product.discountPrice != null ? Number(product.discountPrice) : null;
  const hasDiscount =
    discountPrice != null && discountPrice > 0 && discountPrice < price;
  const displayPrice = hasDiscount ? discountPrice : price;
  const isGratis = displayPrice === 0;
  const isWebinarOrClass =
    product.type === "WEBINAR" || product.type === "KELAS_ONLINE";

  const categoryLabel = getProductTypeLabel(product.type);

  const isWebinarCompleted =
    product.type === "WEBINAR" &&
    ((product.endDate && new Date() > new Date(product.endDate)) ||
      product.status === "archived");

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
    new Set(
      [product.image, ...additionalImages].filter(Boolean) as string[],
    ),
  );
  const currentImage = allImages[activeImageIndex] ?? allImages[0] ?? product.image;

  const otherProducts = (product.user.products ?? []).filter(
    (p: any) => p.id !== product.id,
  );
  const recommendationList = otherProducts.slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <CatalogNavHeader
        backHref={`/${slug}`}
        shareData={{
          title: product.name,
          text: product.shortDescription ?? "",
        }}
      />

      <div className="mx-auto max-w-6xl px-4 pt-10 pb-16">
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-5 lg:items-start">
          {/* ───── LEFT ───── */}
          <div className="flex flex-col gap-4 lg:col-span-3">
            {/* MAIN INFO CARD */}
            <ProductMainInfoCard
              categoryLabel={categoryLabel}
              categoryStyle={CATEGORY_STYLE[product.type] ?? CATEGORY_STYLE_DEFAULT}
              name={product.name}
              creatorName={product.user.name ?? ""}
              description={product.shortDescription ?? ""}
              infoItems={[
                ...(metaLabel
                  ? [
                      <InfoItem
                        key="meta"
                        icon={
                          product.type === "KELAS_ONLINE" ? (
                            <ClockIcon className="h-5 w-5" />
                          ) : (
                            <FileIcon className="h-5 w-5" />
                          )
                        }
                        label={
                          product.type === "KELAS_ONLINE"
                            ? "Durasi"
                            : "Tipe Konten"
                        }
                        value={metaLabel}
                      />,
                    ]
                  : []),
                ...(isWebinarOrClass
                  ? [
                      <InfoItem
                        key="platform"
                        icon={<MapPinIcon className="h-5 w-5" />}
                        label="Platform"
                        value={
                          product.contentType
                            ? (PLATFORM_MAP[product.contentType.toLowerCase()] ??
                              product.contentType)
                            : "Online"
                        }
                      />,
                    ]
                  : []),
                ...(start
                  ? [
                      <InfoItem
                        key="date"
                        icon={<CalendarIcon className="h-5 w-5" />}
                        label="Tanggal"
                        value={
                          isSameDay
                            ? format(start, "dd MMMM yyyy", { locale: idLocale })
                            : `${format(start, "dd MMM yyyy", { locale: idLocale })} - ${end
                              ? format(end, "dd MMM yyyy", { locale: idLocale })
                              : ""
                            }`
                        }
                      />,
                    ]
                  : []),
                ...(product.type === "WEBINAR" && start && end
                  ? [
                      <InfoItem
                        key="time"
                        icon={<ClockIcon className="h-5 w-5" />}
                        label="Waktu"
                        value={`${format(start, "HH:mm")} - ${format(end, "HH:mm")}`}
                      />,
                    ]
                  : []),
              ]}
            />

            {/* IMAGE & CAROUSEL (Mobile only - visible above description) */}
            <div className="flex flex-col gap-2.5 lg:hidden">
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl border border-slate-300 bg-slate-100 shadow-sm">
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

              {/* Thumbnails (Mobile) */}
              {allImages.length > 1 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative h-14 w-14 overflow-hidden rounded-xl border-2 transition-all duration-200 cursor-pointer ${activeImageIndex === idx
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

            {/* DESCRIPTION CARD */}
            {product.description && (
              <CardContainer shadow={false}>
                <h2 className="mb-2 text-md md:text-lg font-semibold text-slate-600">
                  Deskripsi Produk
                </h2>
                <div className="break-words text-sm md:text-base">
                  <MarkdownPreview content={product.description} />
                </div>
              </CardContainer>
            )}
          </div>

          {/* ───── RIGHT SIDEBAR ───── */}
          <div className="flex flex-col gap-6 lg:col-span-2 lg:sticky lg:top-20 lg:self-start">
            {/* IMAGE & CAROUSEL (Desktop only) */}
            <div className="hidden lg:flex lg:flex-col lg:gap-2.5">
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

              {/* Thumbnails (Desktop) */}
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

            {/* CTA CARD */}
            <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm md:text-md font-medium wrap-break-word text-slate-600">
                {product.name}
              </h3>

              {/* Benefits */}
              {((product.benefit as string[])?.length ?? 0) > 0 && (
                <div className="mb-5 rounded-xl border border-cyan-100 bg-cyan-50 p-4">
                  <div className="mb-3 text-xs md:text-sm font-semibold text-cyan-600">
                    Yang akan Kamu dapatkan:
                  </div>
                  <div className="space-y-3">
                    {(product.benefit as string[]).map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 text-xs md:text-sm text-slate-700"
                      >
                        <CheckCircleIcon
                          className="h-5 w-5 shrink-0 text-cyan-600 mt-0.5"
                          weight="fill"
                        />
                        <span className="min-w-0 wrap-break-word leading-relaxed">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Kuota (webinar & kelas) */}
              {(product.type === "WEBINAR" || product.type === "KELAS_ONLINE") && (
                <div className="flex justify-between border-t pt-3 text-sm">
                  <span className="text-slate-500">Kuota</span>
                  <div className="flex flex-col items-end">
                    <span className="font-regular text-slate-800">
                      {product.capacity && product.capacity > 0
                        ? `${product.capacity} peserta`
                        : "Tak Terbatas"}
                    </span>
                    {(product.capacity ?? 0) > 0 &&
                      (product._count?.purchases ?? 0) >= product.capacity! &&
                      !isWebinarCompleted && (
                        <span className="text-[10px] font-bold text-red-500 uppercase">
                          Sudah Full
                        </span>
                      )}
                  </div>
                </div>
              )}

              {/* Stok (digital product) */}
              {product.type === "DIGITAL_PRODUCT" && (
                <div className="flex justify-between border-t pt-3 text-sm">
                  <span className="text-slate-500">Stok</span>
                  <div className="flex flex-col items-end">
                    <span className="font-regular text-slate-800">
                      {product.capacity && product.capacity > 0
                        ? `${product.capacity} item`
                        : "Tak Terbatas"}
                    </span>
                    {(product.capacity ?? 0) > 0 &&
                      (product._count?.purchases ?? 0) >= product.capacity! && (
                        <span className="text-[10px] font-bold text-red-500 uppercase">
                          Habis
                        </span>
                      )}
                  </div>
                </div>
              )}

              {/* Deadline */}
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

              {/* Harga */}
              <div className="mt-4">
                {isGratis ? (
                  <div className="text-xl font-semibold text-green-600">
                    Gratis
                  </div>
                ) : hasDiscount ? (
                  <div className="flex flex-col">
                    <div className="text-xl font-bold text-cyan-600">
                      Rp {discountPrice!.toLocaleString("id-ID")}
                    </div>
                    <div className="text-sm font-medium text-slate-400 line-through">
                      Rp {price.toLocaleString("id-ID")}
                    </div>
                  </div>
                ) : (
                  <div className="text-xl font-bold text-cyan-600">
                    Rp {price.toLocaleString("id-ID")}
                  </div>
                )}
              </div>

              {/* CTA button */}
              {isWebinarCompleted ? (
                <button
                  disabled
                  className="mt-5 w-full rounded-xl bg-slate-300 py-3 font-medium text-slate-500 shadow-sm cursor-not-allowed"
                >
                  Webinar sudah selesai
                </button>
              ) : product.capacity &&
                product.capacity > 0 &&
                (product._count?.purchases ?? 0) >= product.capacity ? (
                <button
                  disabled
                  className="mt-5 w-full rounded-xl bg-slate-300 py-3 font-medium text-slate-500 shadow-sm cursor-not-allowed"
                >
                  {product.type === "DIGITAL_PRODUCT"
                    ? "Stok sudah habis"
                    : "Kuota sudah penuh"}
                </button>
              ) : (
                <Link href={`/${slug}/${productSlug}/checkout`}>
                  <button className="mt-5 w-full cursor-pointer rounded-xl bg-cyan-600 py-3 text-lg font-semibold text-white shadow-sm hover:bg-cyan-700">
                    Beli Sekarang
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RECOMMENDATIONS */}
      {recommendationList.length > 0 && (
        <>
          <div className="mx-auto max-w-6xl px-4">
            <div className="border-t border-slate-300" />
          </div>
          <div className="mx-auto max-w-6xl px-4 py-12">
            <h2 className="mb-6 text-xl font-bold text-slate-800 md:text-2xl">
              Rekomendasi Produk Lainnya
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {recommendationList.map((rec) => {
                const recPrice =
                  (rec as any)?.price &&
                    typeof (rec as any)?.price === "object" &&
                    typeof (rec as any)?.price.toNumber === "function"
                    ? (rec as any).price.toNumber()
                    : (rec as any).price;

                return (
                  <CatalogProductCard
                    key={rec.id}
                    id={rec.id}
                    productSlug={(rec as any).slug ?? rec.id}
                    creatorSlug={slug}
                    name={rec.name}
                    shortDescription={(rec as any).shortDescription}
                    type={rec.type}
                    price={Number(recPrice)}
                    image={(rec as any).image}
                    startDate={(rec as any).startDate}
                    endDate={(rec as any).endDate}
                    contentType={(rec as any).contentType}
                    duration={(rec as any).duration}
                  />
                );
              })}
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
}
