"use client"
import { ArrowLeftIcon, CopyIcon, ImageIcon, PencilIcon } from "@phosphor-icons/react";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ProductDetailTabs, ProductDetailTabContent } from "../../../../components/layout/product-detail-tabs";

import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FormCustomizer } from "../_Component/form-customizer";
import Pembeli from "../_Component/pembeli";
import { Skeleton } from "~/components/ui/skeleton";
import remarkBreaks from "remark-breaks";

export default function ProductDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const searchParams = useSearchParams();
    const defaultTab = searchParams.get("tab") ?? "detail";

    const { data: catalog } = api.catalog.getMine.useQuery();

    const { data: product, isLoading } = api.products.getById.useQuery({ id });
    const { data: buyerCount } = api.purchases.countByProductId.useQuery(
        { productId: id },
        { enabled: !!id }
    );

    const handleCopyLink = () => {
        if (!product || !catalog?.slug) {
            toast.error("Gagal menyalin link: Data belum siap");
            return;
        }

        const host = window.location.origin;
        const productSlug = product.slug ?? product.id;
        const publicUrl = `${host}/${catalog.slug}/${productSlug}`;

        void navigator.clipboard.writeText(publicUrl);
        toast.success("Link produk disalin!");
    };

    const Label = ({ children }: { children: React.ReactNode }) => (
        <div className="w-[200px] text-sm text-slate-800 font-medium">{children}</div>
    );

    const Value = ({ children }: { children: React.ReactNode }) => (
        <div className="flex-1">
            <div className="w-full text-sm font-regular text-slate-800 min-h-[44px] flex items-center">
                {children}
            </div>
        </div>
    );

    const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
        <div className="flex flex-col md:flex-row gap-10 md:items-start mb-2">
            <div className="md:pt-2.5">
                <Label>{label}</Label>
            </div>
            <Value>{children}</Value>
        </div>
    );

    const SectionHeader = ({ title, showEdit }: { title: string; showEdit?: boolean }) => (
        <div className="flex items-center justify-between border-b-1 border-cyan-600 pb-4 mb-4">
            <h2 className="text-md font-semibold text-cyan-600">{title}</h2>
            {showEdit && (
                <Link
                    href={`/produk-digital/${id}/edit`}
                    className="flex items-center gap-1.5 text-sm text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
                >
                    <PencilIcon className="w-4 h-4" />
                    Edit
                </Link>
            )}
        </div>
    );

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "published": return "text-amber-500";
            case "selesai": return "text-green-600";
            case "draft": return "text-slate-500";
            case "archived": return "text-slate-400";
            default: return "text-slate-500";
        }
    };

    // ✅ Skeleton loading
    if (isLoading) {
        return (
            <div className="w-full space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <Skeleton className="h-8 w-64" />

                <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
                    <div className="flex border-b border-slate-200">
                        <Skeleton className="h-14 flex-1" />
                        <Skeleton className="h-14 flex-1" />
                        <Skeleton className="h-14 flex-1" />
                    </div>
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
                <Link href="/produk-digital" className="text-blue-500 hover:underline">
                    ← Kembali ke Daftar Produk Digital
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-slate-50">
                <div className="sticky top-[74px] bg-slate-50 z-40 -mx-4 px-4 mb-2">
                    <div className="max-w-7xl mx-auto flex flex-col gap-1">
                        <Link
                            href="/produk-digital"
                            className="group flex items-center gap-2 text-sm font-regular text-slate-600 hover:text-slate-800 transition-colors w-fit"
                        >
                            <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                            <span className="leading-none">Kembali ke Daftar</span>
                        </Link>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h1 className="text-xl font-semibold text-slate-800">{product.name}</h1>

                            <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 bg-white border-cyan-600 hover:bg-cyan-50 hover:shadow-sm h-9 px-4 rounded-lg transition-all cursor-pointer"
                                onClick={handleCopyLink}
                            >
                                <CopyIcon className="w-4 h-4 text-cyan-600" />
                                <span className="text-sm font-regular text-cyan-600">
                                    Salin Link Produk
                                </span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="rounded-xl border border-slate-800 overflow-hidden">
                <ProductDetailTabs className="bg-cyan-50" defaultTab={defaultTab} buyerCount={buyerCount ?? 0}>
                    <ProductDetailTabContent value="detail" className="space-y-8 bg-white px-10 py-8">
                        <section>
                            <SectionHeader title="Informasi Produk" showEdit />

                            <Row label="Nama">{product.name}</Row>

                            {/* markdown */}
                            <Row label="Deskripsi">
                                <div className="pt-2.5 prose prose-sm prose-slate max-w-none text-slate-600 leading-relaxed [&>*:first-child]:mt-0">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {product.description ?? "-"}
                                    </ReactMarkdown>
                                </div>
                            </Row>

                            <Row label="Gambar">
                                <div className="w-full pt-4 min-h-[44px]">
                                    <div className="w-48 h-48 bg-slate-100 rounded-md overflow-hidden flex items-center justify-center border border-slate-200">
                                        {product.image ? (
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                width={200}
                                                height={200}
                                                unoptimized
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <ImageIcon className="w-12 h-12 text-slate-300" />
                                        )}
                                    </div>
                                </div>
                            </Row>

                            <Row label="Tipe">
                                {Number(product.price) === 0 ? "Gratis" : "Berbayar"}
                            </Row>

                            <Row label="Harga">
                                {Number(product.price) === 0
                                    ? "Rp 0"
                                    : `Rp ${Number(product.price).toLocaleString("id-ID")}`}
                            </Row>

                            <Row label="Link">
                                {product.link ? (
                                    <a href={product.link} target="_blank" className="text-blue-500 hover:underline break-all">
                                        {product.link}
                                    </a>
                                ) : "-"}
                            </Row>

                            <Row label="Status">
                                <span className={`font-semibold ${getStatusColor(product.status ?? "draft")}`}>
                                    {product.status
                                        ? product.status.charAt(0).toUpperCase() + product.status.slice(1)
                                        : "Draft"}
                                </span>
                            </Row>
                        </section>

                        <div className="flex justify-end pt-2">
                            <p className="text-slate-400 text-sm italic">
                                Ditambahkan pada {format(new Date(product.createdAt), "d MMMM yyyy HH:mm", { locale: idLocale })}
                            </p>
                        </div>
                    </ProductDetailTabContent>

                    <ProductDetailTabContent value="user">
                        <Pembeli productId={id} />
                    </ProductDetailTabContent>

                    <ProductDetailTabContent value="form">
                        <FormCustomizer productId={id} />
                    </ProductDetailTabContent>
                </ProductDetailTabs>
            </div>
        </div>
    );
}