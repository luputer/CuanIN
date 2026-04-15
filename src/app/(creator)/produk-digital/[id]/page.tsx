
"use client"
import { ChevronLeft, Copy, Image as ImageIcon, Loader2, Pencil } from "lucide-react";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs";

import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import Image from "next/image";
import { FormCustomizer } from "../_Component/form-customizer";
import Pembeli from "../_Component/pembeli";

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
        <div className="w-[200px] text-slate-700 font-semibold">{children}</div>
    );

    const Value = ({ children }: { children: React.ReactNode }) => (
        <div className="flex-1">
            <div className="w-full rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-slate-600 min-h-[44px] flex items-center">
                {children}
            </div>
        </div>
    );

    const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
        <div className="flex flex-col md:flex-row gap-2 md:items-start mb-4">
            <div className="md:pt-2.5">
                <Label>{label}</Label>
            </div>
            <Value>
                {children}
            </Value>
        </div>
    );

    const SectionHeader = ({ title, showEdit }: { title: string; showEdit?: boolean }) => (
        <div className="flex items-center justify-between border-b-2 border-blue-500 pb-2 mb-6">
            <h2 className="text-lg font-bold text-slate-800">{title}</h2>
            {showEdit && (
                <Link
                    href={`/produk-digital/${id}/edit`}
                    className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors"
                >
                    <Pencil className="w-3.5 h-3.5" />
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
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
        <div className="w-full space-y-6">
            {/* Header Back */}
            <div className="flex items-center justify-between">
                <Link
                    href="/produk-digital"
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 w-fit"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Kembali ke Daftar Produk Digital</span>
                </Link>

                <Button
                    variant={"outline"}
                    className="flex items-center gap-2"
                    onClick={handleCopyLink}
                >
                    <Copy className="w-4 h-4" />
                    Salin Link Produk
                </Button>


            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-blue-600">{product.name}</h1>

            {/* Tabs */}
            <Tabs defaultValue={defaultTab}>
                <div className="bg-white rounded-t-xl overflow-hidden border-b border-slate-200">
                    <TabsList className="w-full flex h-auto p-0 bg-transparent ">
                        <TabsTrigger
                            value="detail"
                            className="flex-1   rounded-none border-b-2 border-transparent py-4 data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 bg-transparent text-slate-500 font-medium cursor-pointer"
                        >
                            Detail Produk
                        </TabsTrigger>
                        <TabsTrigger
                            value="user"
                            className="flex-1 rounded-none border-b-2 border-transparent py-4 data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 bg-transparent text-slate-500 font-medium cursor-pointer"
                        >
                            Pembeli ({buyerCount ?? 0})
                        </TabsTrigger>
                        <TabsTrigger
                            value="form"
                            className="flex-1 rounded-none border-b-2 border-transparent py-4 data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 bg-transparent text-slate-500 font-medium cursor-pointer"
                        >
                            Kustomisasi Form
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="detail" className="space-y-8 bg-blue-50/50 p-6 rounded-b-xl">
                    {/* Informasi Produk */}
                    <section>
                        <SectionHeader title="Informasi Produk" showEdit />

                        <Row label="Nama">{product.name}</Row>

                        <Row label="Deskripsi">
                            <span className="leading-relaxed">
                                {product.description ?? "-"}
                            </span>
                        </Row>

                        <div className="flex flex-col md:flex-row gap-2 md:items-start mb-4">
                            <div className="md:pt-2.5">
                                <Label>Gambar</Label>
                            </div>
                            <div className="flex-1">
                                <div className="w-full rounded-lg border border-blue-200 bg-white p-4 min-h-[44px]">
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
                            </div>
                        </div>

                        <Row label="Tipe">
                            {Number(product.price) === 0 ? "Gratis" : "Berbayar"}
                        </Row>
                        <Row label="Harga">
                            {Number(product.price) === 0
                                ? "Rp 0"
                                : `Rp ${Number(product.price).toLocaleString("id-ID")}`
                            }
                        </Row>
                        <Row label="Link">
                            {product.link ? (
                                <a href={product.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">
                                    {product.link}
                                </a>
                            ) : "-"}
                        </Row>

                        <div className="flex flex-col md:flex-row gap-2 md:items-start mb-4">
                            <div className="md:pt-2.5">
                                <Label>Status</Label>
                            </div>
                            <Value>
                                <span className={`font-semibold ${getStatusColor(product.status ?? "draft")}`}>
                                    {product.status
                                        ? product.status.charAt(0).toUpperCase() + product.status.slice(1)
                                        : "Draft"}
                                </span>
                            </Value>
                        </div>
                    </section>

                    {/* Timestamp */}
                    <div className="flex justify-end pt-4">
                        <p className="text-slate-400 text-sm italic">
                            Ditambahkan pada {format(new Date(product.createdAt), "d MMMM yyyy HH:mm", { locale: idLocale })}
                        </p>
                    </div>
                </TabsContent>

                <TabsContent value="user">
                    <Pembeli productId={id} />
                </TabsContent>
                <TabsContent value="form">
                    <FormCustomizer productId={id} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
