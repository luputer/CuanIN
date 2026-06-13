"use client";

import React from "react";
import { ProductSuccessDialog } from "~/components/ui/product-success-dialog";
import { SectionHeader, FormInput, FormRow } from "~/components/ui/form-layout";
import { PlusIcon } from "@phosphor-icons/react";
import { useCreateKelas } from "~/hooks/use-create-kelas";
import { BasicInfoSection, PricingSection, QuotaSection, PlatformSelector } from "~/components/creator/product-form-sections";
import { ProductFormLayout } from "~/components/layout/product-form-layout";

export default function CreateKelasPage() {
    const { form, router, state, handlers } = useCreateKelas();
    const { register, formState: { errors } } = form;

    return (
        <>
            <ProductFormLayout
                form={form}
                title="Tambah Kelas Online Baru"
                backLink="/kelas"
                backLabel="Kembali ke Daftar"
                onSubmit={handlers.onSubmit}
                onCancel={() => router.push("/kelas")}
                isPending={state.isPending}
                saveIcon={PlusIcon}
                uploading={state.uploading}
                onFilesChange={handlers.onFilesChange}
                removeImage={handlers.removeImage}
                fileInputRef={state.fileInputRef}
                customFields={state.customFields}
                setCustomFields={state.setCustomFields}
            >
                <BasicInfoSection 
                    form={form} 
                    title="Informasi Kelas"
                    namePlaceholder="Masukkan nama kelas"
                    shortDescPlaceholder="Masukkan ringkasan tentang kelas ini"
                    longDescPlaceholder="Masukkan deskripsi lengkap tentang kelas ini"
                />
                
                <PricingSection 
                    form={form} 
                    onAdjustPrice={handlers.handlePriceAdjust} 
                    onAdjustDiscount={handlers.handleDiscountPriceAdjust} 
                />

                <div className="pt-8">
                    <SectionHeader title="Detail Kelas" />
                    <div className="space-y-0 pt-6">
                        <PlatformSelector form={form} type="class" />

                        <FormRow label="Link Akses" error={errors.link?.message as string}>
                            <FormInput placeholder="https://..." {...register("link")} />
                        </FormRow>

                        <FormRow label="Durasi" error={errors.duration?.message as string}>
                            <FormInput
                                placeholder="Contoh: 12 Jam Materi, 30 Hari Akses, dsb"
                                {...register("duration")}
                            />
                        </FormRow>

                        <QuotaSection 
                            form={form} 
                            onAdjustQuota={handlers.handleQuotaAdjust} 
                            label="Batasi Kuota"
                            placeholder="Masukkan batas kuota peserta"
                        />
                    </div>
                </div>
            </ProductFormLayout>

            {/* Success Dialog */}
            {state.createdProduct && (
                <ProductSuccessDialog
                    open={state.successDialogOpen}
                    onOpenChange={state.setSuccessDialogOpen}
                    productName={state.createdProduct.name}
                    productSlug={state.createdProduct.slug}
                    redirectUrl="/kelas"
                />
            )}
        </>
    );
}
