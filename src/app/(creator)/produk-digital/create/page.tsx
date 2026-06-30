"use client";

import React from "react";
import { ProductSuccessDialog } from "~/components/shared/product-success-dialog";
import { SectionHeader, FormInput, FormRow } from "~/components/shared/form-layout";
import { PlusIcon } from "@phosphor-icons/react";
import { useCreateProdukDigital } from "~/hooks/creator/use-create-produk-digital";
import { BasicInfoSection, PricingSection, QuotaSection, PlatformSelector } from "~/components/creator/product-form-sections";
import { ProductFormLayout } from "~/components/shared/product-form-layout";

export default function CreateProdukDigitalPage() {
    const { form, router, state, handlers } = useCreateProdukDigital();
    const { register, formState: { errors } } = form;

    return (
        <>
            <ProductFormLayout
                form={form}
                title="Tambah Produk Digital Baru"
                backLink="/produk-digital"
                backLabel="Kembali ke Daftar"
                onSubmit={handlers.onSubmit}
                onCancel={() => router.push("/produk-digital")}
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
                    title="Informasi Produk"
                    namePlaceholder="Masukkan nama produk"
                    shortDescPlaceholder="Masukkan ringkasan tentang produk ini"
                    longDescPlaceholder="Masukkan deskripsi lengkap tentang produk ini"
                />
                
                <PricingSection 
                    form={form} 
                    onAdjustPrice={handlers.handlePriceAdjust} 
                    onAdjustDiscount={handlers.handleDiscountPriceAdjust} 
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
                            onAdjustQuota={handlers.handleQuotaAdjust} 
                            label="Batasi Stok"
                            placeholder="Masukkan batas stok"
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
                    redirectUrl="/produk-digital"
                    status={state.createdProduct.status}
                />
            )}
        </>
    );
}
