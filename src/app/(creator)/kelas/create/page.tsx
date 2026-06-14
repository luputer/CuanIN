"use client";

import React from "react";
import { ProductSuccessDialog } from "~/components/ui/product-success-dialog";
import { SectionHeader, FormInput, FormRow } from "~/components/ui/form-layout";
import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { useCreateKelas } from "~/hooks/use-create-kelas";
import { BasicInfoSection, PricingSection, QuotaSection, PlatformSelector } from "~/components/creator/product-form-sections";
import { ProductFormLayout } from "~/components/layout/product-form-layout";

export default function CreateKelasPage() {
    const { form, router, state, handlers } = useCreateKelas();
    const { register, formState: { errors } } = form;
    const { linkFields, appendLink, removeLink } = state;

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

                        <FormRow label="Link Akses" error={errors.link?.message ?? errors.links?.message}>
                            <div className="space-y-3 flex flex-col w-full">
                                <FormInput
                                    placeholder="Link utama (wajib)"
                                    {...register("link")}
                                />

                                {linkFields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2">
                                        <FormInput
                                            placeholder={`Link tambahan ${index + 1}`}
                                            className="flex-1"
                                            {...register(`links.${index}` as const)}
                                        />
                                        <button
                                            type="button"
                                            className="flex h-[52px] w-[52px] items-center justify-center rounded-lg bg-white border border-slate-300 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                                            onClick={() => removeLink(index)}
                                        >
                                            <TrashIcon className="size-5 translate-y-[0.5px]" weight="bold" />
                                        </button>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={() => appendLink("")}
                                    className="flex justify-center items-center gap-2 bg-white border border-slate-400 rounded-lg py-2 px-4 text-sm font-regular text-slate-800 hover:bg-slate-100 w-fit cursor-pointer"
                                >
                                    <PlusIcon className="size-4" weight="regular" />
                                    <span>Tambah Link Akses</span>
                                </button>
                            </div>
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
