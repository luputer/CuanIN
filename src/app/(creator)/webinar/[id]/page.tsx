"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { isBefore, startOfDay } from "date-fns";
import { CopyIcon, TrashIcon } from "@phosphor-icons/react";

import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { useWebinar } from "~/hooks/use-webinar";
import { Button } from "~/components/ui/button";
import { SectionHeader, FormInput, FormRow } from "~/components/ui/form-layout";
import { DateRangePicker } from "~/components/ui/date-range-picker";
import DeleteConfirmDialog from "~/components/ui/delete-confirm-dialog";
import { CreatorDetailSkeleton } from "~/components/layout/detail-skeletons";
import { 
    BasicInfoSection, 
    PricingSection, 
    QuotaSection, 
    PlatformSelector 
} from "~/components/creator/product-form-sections";
import { ProductFormLayout } from "~/components/layout/product-form-layout";

/**
 * WebinarDetailPage
 * Halaman untuk mengedit webinar yang ada.
 */
export default function WebinarDetailPage() {
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
    } = useWebinar({ id, isEdit: true });

    const { register, watch, setValue, formState: { errors } } = form;

    const dateStart = watch("dateStart");
    const dateEnd = watch("dateEnd");
    const dateDeadline = watch("dateDeadline");

    const { data: buyerCount } = api.purchases.countByProductId.useQuery(
        { productId: id },
        { enabled: !!id }
    );

    const deleteProduct = api.products.delete.useMutation({
        onSuccess: () => {
            void utils.products.getAll.invalidate();
            toast.success("Webinar berhasil dihapus");
            router.push("/webinar");
        },
        onError: (error) => {
            toast.error(`Gagal menghapus webinar: ${error.message}`);
            setShowDeleteConfirm(false);
        },
    });

    const { data: catalog } = api.catalog.getMine.useQuery();

    // Helper untuk menyalin link produk ke clipboard
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
                <p className="text-slate-500 text-lg">Webinar tidak ditemukan.</p>
                <Link href="/webinar" className="text-blue-500 hover:underline">
                    ← Kembali ke Daftar Webinar
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
                backLink="/webinar"
                backLabel="Kembali ke Daftar"
                buyerCount={buyerCount ?? 0}
                createdAt={product.createdAt}
                onSubmit={onSubmit}
                onCancel={() => router.push("/webinar")}
                isPending={isPending}
                uploading={uploading}
                onFilesChange={onFilesChange}
                removeImage={removeImage}
                fileInputRef={fileInputRef}
                statusOptions={[
                    { label: "Published", value: "published" },
                    { label: "Unpublished", value: "unpublished" },
                    { label: "Selesai", value: "archived" }
                ]}
                badges={
                    <div className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-semibold tracking-wider",
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
                    <SectionHeader title="Detail Webinar" />
                    <div className="space-y-0 pt-6">
                        <PlatformSelector form={form} type="webinar" />

                        <FormRow label="Link Akses" error={errors.link?.message as string}>
                            <FormInput placeholder="https://zoom.us/j/..." {...register("link")} />
                        </FormRow>

                        <FormRow label="Jadwal Webinar" error={(errors.dateStart?.message as string) || (errors.dateEnd?.message as string)}>
                            <DateRangePicker
                                startDate={dateStart}
                                endDate={dateEnd}
                                onChange={({ startDate, endDate }) => {
                                    if (startDate) setValue("dateStart", startDate, { shouldValidate: true, shouldDirty: true });
                                    if (endDate) setValue("dateEnd", endDate, { shouldValidate: true, shouldDirty: true });
                                }}
                                placeholder="Pilih Waktu Mulai & Selesai"
                                disabled={(date) => {
                                    const now = new Date();
                                    return isBefore(date, startOfDay(now));
                                }}
                            />
                        </FormRow>

                        <FormRow label="Batas Pendaftaran" error={errors.dateDeadline?.message as string}>
                            <DateRangePicker
                                startDate={dateDeadline}
                                onChange={({ startDate }) => { 
                                    if (startDate) setValue("dateDeadline", startDate, { shouldValidate: true, shouldDirty: true }); 
                                }}
                                placeholder="Pilih Batas Waktu Pendaftaran"
                                showEndTime={false}
                                disabled={(date) => {
                                    const now = new Date();
                                    if (date.getHours() === 0 && date.getMinutes() === 0) {
                                        if (isBefore(date, startOfDay(now))) return true;
                                    } else {
                                        if (isBefore(date, now)) return true;
                                    }
                                    if (dateStart) {
                                        if (date.getHours() === 0 && date.getMinutes() === 0) {
                                            return date > startOfDay(dateStart);
                                        }
                                        return date > dateStart;
                                    }
                                    return false;
                                }}
                            />
                        </FormRow>

                        <QuotaSection 
                            form={form} 
                            onAdjustQuota={handleQuotaAdjust} 
                            label="Batasi Kuota"
                            placeholder="Masukkan batas kuota peserta"
                        />
                    </div>
                </div>
            </ProductFormLayout>

            <DeleteConfirmDialog
                open={showDeleteConfirm}
                onOpenChange={setShowDeleteConfirm}
                title="Hapus Webinar?"
                itemName={`webinar ${product.name || ""}`.trim()}
                loading={deleteProduct.isPending}
                onConfirm={() => deleteProduct.mutate({ id })}
            />
        </>
    );
}
