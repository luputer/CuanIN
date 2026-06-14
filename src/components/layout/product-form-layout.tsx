"use client";

import React, { useEffect } from "react";
import { FormProvider, type UseFormReturn } from "react-hook-form";
import { ProductDetailTabs, ProductDetailTabContent } from "~/components/layout/product-detail-tabs";
import { DetailHeader } from "~/components/layout/detail-header";
import { FormCustomizer } from "~/components/form-customizer";
import Pembeli from "~/components/pembeli";
import { SidebarMetadataSection } from "~/components/creator/product-form-sections";
import ButtonSave from "~/components/ui/button-save";
import ButtonCancel from "~/components/ui/button-cancel";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface ProductFormLayoutProps {
    form: UseFormReturn<any>;
    title: string;
    backLink: string;
    backLabel: string;
    productId?: string;
    isEdit?: boolean;
    isLoading?: boolean;
    buyerCount?: number;
    createdAt?: Date | string;
    onSubmit: () => void;
    onCancel: () => void;
    isPending: boolean;
    saveLabel?: string;
    saveLoadingLabel?: string;
    saveIcon?: React.ElementType;
    badges?: React.ReactNode;
    actions?: React.ReactNode;
    children: React.ReactNode; // The main form content
    // Sidebar props
    uploading: boolean;
    onFilesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    removeImage: (index: number) => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    statusOptions?: { label: string; value: string }[];
    // Form Customizer props
    customFields?: any[];
    setCustomFields?: (fields: any[]) => void;
}

export function ProductFormLayout({
    form,
    title,
    backLink,
    backLabel,
    productId,
    isEdit = false,
    buyerCount = 0,
    createdAt,
    onSubmit,
    onCancel,
    isPending,
    saveLabel = isEdit ? "Simpan Perubahan" : "Tambah Produk",
    saveLoadingLabel = isEdit ? "Menyimpan..." : "Menambahkan...",
    saveIcon,
    badges,
    actions,
    children,
    uploading,
    onFilesChange,
    removeImage,
    fileInputRef,
    statusOptions,
    customFields,
    setCustomFields
}: ProductFormLayoutProps) {
    const { formState: { isDirty } } = form;

    // Peringatan jika user mencoba keluar dengan perubahan yang belum disimpan
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = "Anda memiliki perubahan yang belum disimpan. Yakin ingin meninggalkan halaman?";
                return e.returnValue;
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isDirty]);

    return (
        <FormProvider {...form}>
            <div className="w-full max-w-7xl mx-auto space-y-6">
                <DetailHeader
                    backLink={backLink}
                    backLabel={backLabel}
                    title={title}
                    badges={badges}
                    actions={actions}
                />

                <div className="rounded-xl border border-slate-800 overflow-hidden">
                    <ProductDetailTabs 
                        defaultTab="detail" 
                        buyerCount={buyerCount} 
                        hidePembeli={!isEdit}
                    >
                        <ProductDetailTabContent value="detail" className="bg-transparent overflow-visible">
                            <div className="flex-1 min-w-0 bg-white rounded-xl px-4 py-2 sm:px-8 sm:py-8">
                                <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">
                                    <div className="flex-1 min-w-0 w-full space-y-0">
                                        {children}
                                    </div>

                                    <SidebarMetadataSection
                                        form={form}
                                        uploading={uploading}
                                        onFilesChange={onFilesChange}
                                        removeImage={removeImage}
                                        fileInputRef={fileInputRef}
                                        statusOptions={statusOptions}
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row justify-between sm:items-center mt-4 pt-4 border-t border-slate-200 gap-4 w-full">
                                    {isEdit && createdAt ? (
                                        <p className="text-slate-500 text-sm text-left w-full sm:w-auto">
                                            Ditambahkan pada {format(new Date(createdAt), "d MMMM yyyy, HH:mm", { locale: idLocale })}
                                        </p>
                                    ) : <div />}
                                    
                                    <div className="w-full sm:w-auto flex justify-end gap-4">
                                        {!isEdit && (
                                            <ButtonCancel
                                                type="button"
                                                onClick={onCancel}
                                            />
                                        )}
                                        <ButtonSave
                                            onClick={onSubmit}
                                            isLoading={isPending}
                                            disabled={isEdit && !isDirty}
                                            label={saveLabel}
                                            loadingLabel={saveLoadingLabel}
                                            icon={saveIcon}
                                            weight="bold"
                                        />
                                    </div>
                                </div>
                            </div>
                        </ProductDetailTabContent>

                        {isEdit && productId && (
                            <ProductDetailTabContent value="user">
                                <Pembeli productId={productId} />
                            </ProductDetailTabContent>
                        )}

                        <ProductDetailTabContent value="form">
                            <FormCustomizer 
                                productId={isEdit ? productId : undefined}
                                value={!isEdit ? customFields : undefined}
                                onChange={!isEdit ? setCustomFields : undefined}
                            />
                        </ProductDetailTabContent>
                    </ProductDetailTabs>
                </div>
            </div>
        </FormProvider>
    );
}
