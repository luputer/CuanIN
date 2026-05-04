"use client"
import { ArrowLeftIcon, CopyIcon, ImageIcon, PencilIcon, TrashIcon } from "@phosphor-icons/react";

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
import remarkBreaks from "remark-breaks";
import { Skeleton } from "~/components/ui/skeleton";
import ConfirmDialog from "~/components/ui/confirm-dialog";
import { useState, useRef, useEffect } from "react";
import { SectionHeader } from "~/components/ui/form-layout";
import { useRouter } from "next/navigation";
import Pembeli from "~/components/pembeli";
import { FormCustomizer } from "~/components/form-customizer";

export default function KelasDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const searchParams = useSearchParams();
    const utils = api.useUtils();
    const defaultTab = searchParams.get("tab") ?? "detail";

    const { data: catalog } = api.catalog.getMine.useQuery();

    const { data: product, isLoading } = api.products.getById.useQuery(
        { id },
        { enabled: !!id }
    );
    const { data: buyerCount } = api.purchases.countByProductId.useQuery(
        { productId: id },
        { enabled: !!id }
    );

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const deleteProduct = api.products.delete.useMutation({
        onSuccess: () => {
            void utils.products.getAll.invalidate();
            toast.success("Kelas Online berhasil dihapus");
            router.push("/kelas");
        },
        onError: (error) => {
            toast.error(`Gagal menghapus kelas: ${error.message}`);
            setShowDeleteConfirm(false);
        },
    });

    const handleCopyLink = () => {
        if (!product || !catalog?.slug) {
            toast.error("Gagal menyalin link: Data belum siap");
            return;
        }

        const host = window.location.origin;
        const productSlug = product.slug ?? product.id;
        const publicUrl = `${host}/${catalog.slug}/${productSlug}`;

        void navigator.clipboard.writeText(publicUrl);
        toast.success("Link kelas disalin!");
    };

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
            default: return "bg-slate-200 rounded-full px-4 py-1 w-fit text-slate-500";
        }
    };

    const [expanded, setExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const descriptionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (descriptionRef.current && product?.description) {
            // Cek apakah konten melebihi batas (clamped) saat pertama kali render
            const isClamped = descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight;
            if (isClamped) {
                setIsOverflowing(true);
            }
        }
    }, [product?.description]);

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
                <p className="text-slate-500 text-lg">Kelas tidak ditemukan.</p>
                <Link href="/kelas" className="text-blue-500 hover:underline">
                    ← Kembali ke Daftar Kelas Online
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-slate-50">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sticky top-[74px] bg-slate-50 z-40 -mx-4 px-4 pt-2">
                    <div className="flex-1 flex flex-col gap-1">
                        <Link
                            href="/kelas"
                            className="group flex items-center gap-2 text-sm font-regular text-slate-600 hover:text-slate-800 transition-colors w-fit mb-2"
                        >
                            <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                            <span className="leading-none">Kembali ke Daftar</span>
                        </Link>

                        <h1 className="text-xl font-semibold text-slate-800 break-words">{product.name}</h1>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border-cyan-600 hover:bg-cyan-50 hover:shadow-sm h-10 px-4 rounded-lg transition-all cursor-pointer"
                            onClick={handleCopyLink}
                        >
                            <CopyIcon className="w-4 h-4 text-cyan-600" />
                            <span className="text-sm font-regular text-cyan-600 whitespace-nowrap">
                                Salin Link Kelas
                            </span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center justify-center h-10 w-10 p-0 bg-white border-red-500 hover:bg-red-100 hover:shadow-sm rounded-lg transition-all cursor-pointer shrink-0"
                            onClick={() => setShowDeleteConfirm(true)}
                        >
                            <TrashIcon className="w-4 h-4 text-red-500" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="rounded-xl border border-slate-800 overflow-hidden">
                <ProductDetailTabs defaultTab={defaultTab} buyerCount={buyerCount ?? 0}>
                    <ProductDetailTabContent value="detail" className="bg-transparent overflow-visible">
                        {/* Main Content Area */}
                        <div className="flex-1 min-w-0 bg-white rounded-xl px-4 py-2 sm:px-8 sm:py-8">
                            <SectionHeader title="Informasi Kelas">
                                <Link
                                    href={`/kelas/${id}/edit`}
                                    className="flex items-center gap-1.5 text-sm text-cyan-600 font-medium transition-colors hover:text-cyan-700 cursor-pointer"
                                >
                                    <PencilIcon className="w-4 h-4" />
                                    Edit
                                </Link>
                            </SectionHeader>

                            <div className="flex flex-col lg:flex-row gap-10 items-start pt-4">
                                {/* Kiri: Informasi Produk */}
                                <div className="flex-1 min-w-0 space-y-0">
                                    <Row label="Nama">
                                        {product.name}
                                    </Row>

                                    <Row label="Deskripsi Singkat">
                                        {product.shortDescription ?? "-"}
                                    </Row>

                                    <Row label="Deskripsi">
                                        <div className="">
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

                                                    {/* Button */}
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

                                    <Row label="Benefit">
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

                                    <Row label="Durasi">
                                        {product.duration}
                                    </Row>

                                    <Row label="Link">
                                        {product.link ? (
                                            <a href={product.link} target="_blank" className="text-blue-500 hover:underline break-all">
                                                {product.link}
                                            </a>
                                        ) : "-"}
                                    </Row>

                                    <Row label="Status">
                                        <p className={`w-fit font-medium ${getStatusColor(product.status ?? "draft")}`}>
                                            {product.status
                                                ? product.status.charAt(0).toUpperCase() + product.status.slice(1)
                                                : "Draft"}
                                        </p>
                                    </Row>


                                    <p className="text-slate-500 text-sm">
                                        Ditambahkan pada {format(new Date(product.createdAt), "d MMMM yyyy HH:mm", { locale: idLocale })}
                                    </p>

                                </div>

                                {/* Kanan: Gambar */}
                                <div className="shrink-0 w-full lg:w-90 bg-slate-100 p-4 rounded-xl border border-slate-100">
                                    <p className="text-slate-700 text-sm font-medium mb-4">Gambar Thumbnail</p>
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

            <ConfirmDialog
                open={showDeleteConfirm}
                onOpenChange={setShowDeleteConfirm}
                icon={<TrashIcon size={52} className="bg-red-100 rounded-full p-3 text-red-500" weight="regular" />}
                title="Hapus Kelas Online?"
                description={
                    <>
                        Kamu yakin ingin menghapus {" "}
                        <span className="font-semibold text-slate-800">&quot;{product.name}&quot;</span>?
                        <br />
                        Tindakan ini tidak bisa dibatalkan.
                    </>
                }
                confirmText="Ya, Hapus"
                confirmClassName="bg-red-500 hover:bg-red-600 text-white"
                loading={deleteProduct.isPending}
                onConfirm={() => {
                    deleteProduct.mutate({ id });
                }}
            />
        </div >
    );
}
