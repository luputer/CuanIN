"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { CopyIcon, TrashIcon } from "@phosphor-icons/react";

import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { useEditProdukDigital } from "~/hooks/creator/use-edit-produk-digital";
import { Button } from "~/components/ui/button";
import { SectionHeader, FormInput, FormRow } from "~/components/shared/form-layout";
import DeleteConfirmDialog from "~/components/shared/delete-confirm-dialog";
import { CreatorDetailSkeleton } from "~/components/shared/detail-skeletons";
import { 
    BasicInfoSection, 
    PricingSection, 
    QuotaSection, 
    PlatformSelector 
} from "~/components/creator/product-form-sections";
import { ProductFormLayout } from "~/components/shared/product-form-layout";

export default function ProdukDigitalDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const utils = api.useUtils();
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const {
        form,
        uploading,
        onFilesChange,
        removeImage,
        handlePriceAdjust,
        handleDiscountPriceAdjust,
        handleQuotaAdjust,
        onSubmit,
        isPending,
        isLoadingProduct,
        product,
    } = useEditProdukDigital({ id, isEdit: true });

    const { register, watch, formState: { errors } } = form;

    const { data: buyerCount } = api.purchases.countByProductId.useQuery(
        { productId: id },
        { enabled: !!id }
    );

    const deleteProduct = api.products.delete.useMutation({
        onSuccess: () => {
            void utils.products.getAll.invalidate();
            toast.success("Produk Digital berhasil dihapus");
            router.push("/produk-digital");
        },
        onError: (error) => {
            toast.error(`Gagal menghapus produk: ${error.message}`);
            setShowDeleteConfirm(false);
        },
    });

    const { data: catalog } = api.catalog.getMine.useQuery();

    const handleCopyLink = () => {
        if (!product || !catalog?.slug) {
            toast.error("Gagal menyalin link: Data belum siap");
            return;
        }

        const host = window.location.origin;
        const productSlug = product.slug ?? product.id;
        const publicUrl = `${host}/${catalog.slug}/${productSlug}`;

        void navigator.clipboard.writeText(publicUrl);
        toast.success("Link produk berhasil disalin!");
    };

    if (isLoadingProduct) return <CreatorDetailSkeleton />;

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
        <>
            <ProductFormLayout
                form={form}
                title={product.name}
                productId={id}
                isEdit={true}
                backLink="/produk-digital"
                backLabel="Kembali ke Daftar"
                buyerCount={buyerCount ?? 0}
                createdAt={product.createdAt}
                updatedAt={product.updatedAt}
                onSubmit={onSubmit}
                onCancel={() => router.push("/produk-digital")}
                isPending={isPending}
                uploading={uploading}
                onFilesChange={onFilesChange}
                removeImage={removeImage}
                fileInputRef={fileInputRef}
                badges={
                    <div className={cn(
                        "px-2 py-0.5 rounded-full text-sm font-semibold tracking-wider",
                        (watch("price") ?? 0) > 0
                            ? "bg-amber-100 text-amber-700 border border-amber-200"
                            : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    )}>
                        {(watch("price") ?? 0) > 0 ? "Berbayar" : "Gratis"}
                    </div>
                }
                actions={
                    <>
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border-cyan-600 hover:bg-cyan-50 hover:shadow-sm h-10 px-4 rounded-lg transition-all cursor-pointer"
                            onClick={handleCopyLink}
                        >
                            <CopyIcon className="w-4 h-4 text-cyan-600" />
                            <span className="text-sm font-regular text-cyan-600 whitespace-nowrap">
                                Salin Link Produk
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
                    </>
                }
            >
                <BasicInfoSection form={form} />
                
                <PricingSection 
                    form={form} 
                    onAdjustPrice={handlePriceAdjust} 
                    onAdjustDiscount={handleDiscountPriceAdjust} 
                />

                <div className="pt-8">
                    <SectionHeader title="Detail Produk Digital" />
                    <div className="space-y-0 pt-6">
                        <PlatformSelector form={form} type="digital" />

                        <FormRow label="Link Akses" error={errors.link?.message as string}>
                            <FormInput placeholder="https://..." {...register("link")} />
                        </FormRow>

                        <QuotaSection 
                            form={form} 
                            onAdjustQuota={handleQuotaAdjust} 
                            label="Batasi Stok"
                            placeholder="Masukkan batas stok"
                        />
                    </div>
                </div>
            </ProductFormLayout>

            <DeleteConfirmDialog
                open={showDeleteConfirm}
                onOpenChange={setShowDeleteConfirm}
                title="Hapus Produk Digital?"
                itemName={`produk digital ${product.name || ""}`.trim()}
                loading={deleteProduct.isPending}
                onConfirm={() => deleteProduct.mutate({ id })}
            />
        </>
    );
}