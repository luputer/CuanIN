"use client";

import React from "react";
import { isBefore, startOfDay } from "date-fns";
import { PlusIcon } from "@phosphor-icons/react";
import { ProductSuccessDialog } from "~/components/shared/product-success-dialog";
import { SectionHeader, FormInput, FormRow } from "~/components/shared/form-layout";
import { DateRangePicker } from "~/components/shared/date-range-picker";
import { useCreateWebinar } from "~/hooks/creator/use-create-webinar";
import { BasicInfoSection, PricingSection, QuotaSection, PlatformSelector } from "~/components/creator/product-form-sections";
import { ProductFormLayout } from "~/components/shared/product-form-layout";

export default function CreateWebinarPage() {
    const { form, router, state, handlers } = useCreateWebinar();
    const { register, formState: { errors }, setValue } = form;

    return (
        <>
            <ProductFormLayout
                form={form}
                title="Tambah Webinar Baru"
                backLink="/webinar"
                backLabel="Kembali ke Daftar"
                onSubmit={handlers.onSubmit}
                onCancel={() => router.push("/webinar")}
                isPending={state.isPending}
                saveIcon={PlusIcon}
                uploading={state.uploading}
                onFilesChange={handlers.onFilesChange}
                removeImage={handlers.removeImage}
                fileInputRef={state.fileInputRef}
                statusOptions={[
                    { label: "Published", value: "published" },
                    { label: "Unpublished", value: "unpublished" },
                    { label: "Selesai", value: "archived" }
                ]}
                customFields={state.customFields}
                setCustomFields={state.setCustomFields}
            >
                <BasicInfoSection 
                    form={form} 
                    title="Informasi Webinar"
                    namePlaceholder="Masukkan nama webinar"
                    shortDescPlaceholder="Masukkan ringkasan tentang webinar ini"
                    longDescPlaceholder="Masukkan deskripsi lengkap tentang webinar ini"
                />
                
                <PricingSection 
                    form={form} 
                    onAdjustPrice={handlers.handlePriceAdjust} 
                    onAdjustDiscount={handlers.handleDiscountPriceAdjust} 
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
                                startDate={state.dateStart}
                                endDate={state.dateEnd}
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
                                startDate={state.dateDeadline}
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
                                    if (state.dateStart) {
                                        if (date.getHours() === 0 && date.getMinutes() === 0) {
                                            return date > startOfDay(state.dateStart);
                                        }
                                        return date > state.dateStart;
                                    }
                                    return false;
                                }}
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
                    redirectUrl="/webinar"
                    status={state.createdProduct.status}
                />
            )}
        </>
    );
}
