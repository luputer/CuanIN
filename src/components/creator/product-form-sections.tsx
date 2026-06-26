"use client";

import React from "react";
import Image from "next/image";
import {
    PlusIcon,
    TrashIcon,
    X,
    CaretUpIcon,
    CaretDownIcon,
    CircleNotchIcon
} from "@phosphor-icons/react";
import { Controller, useFieldArray } from "react-hook-form";
import type { UseFormReturn, FieldValues, Path, ArrayPath, PathValue, FieldArray } from "react-hook-form";
import { SectionHeader, FormInput, FormTextarea, FormSelect, FormRow } from "~/components/shared/form-layout";
import { DraggableEditor } from "~/components/shared/draggable-editor";
import { VoucherSelector } from "~/components/voucher/selector";
import { formatNumberInput } from "~/lib/utils";
import { ImageCropperDialog } from "~/components/shared/image-cropper-dialog";

/**
 * Shared Basic Information Section
 */
export const BasicInfoSection = <TFieldValues extends FieldValues = FieldValues>({
    form,
    title = "Informasi Dasar",
    namePlaceholder = "Masukkan nama",
    shortDescPlaceholder = "Masukkan ringkasan singkat",
    longDescPlaceholder = "Masukkan deskripsi lengkap"
}: {
    form: UseFormReturn<TFieldValues>;
    title?: string;
    namePlaceholder?: string;
    shortDescPlaceholder?: string;
    longDescPlaceholder?: string;
}) => {
    const { register, watch, setValue, control, formState: { errors } } = form;
    const { fields, append, remove } = useFieldArray({
        control,
        name: "benefit" as ArrayPath<TFieldValues>,
    });

    const anyErrors = errors as Record<string, { message?: string } | undefined>;

    return (
        <div className="space-y-0">
            <SectionHeader title={title} />
            <div className="pt-6">
                <FormRow label="Nama" error={anyErrors.name?.message}>
                    <FormInput placeholder={namePlaceholder} {...register("name" as Path<TFieldValues>)} />
                </FormRow>

                <FormRow label="Ringkasan" error={anyErrors.shortDescription?.message}>
                    <FormTextarea
                        placeholder={shortDescPlaceholder}
                        maxLength={200}
                        {...register("shortDescription" as Path<TFieldValues>)}
                    />
                    <p className="text-xs text-slate-400 mt-1">{(watch("shortDescription" as Path<TFieldValues>) as string)?.length ?? 0}/200 karakter</p>
                </FormRow>

                <FormRow label="Deskripsi Lengkap" error={anyErrors.description?.message}>
                    <DraggableEditor
                        value={(watch("description" as Path<TFieldValues>) as string) ?? ""}
                        onChange={(val) => setValue("description" as Path<TFieldValues>, val as PathValue<TFieldValues, Path<TFieldValues>>, { shouldDirty: true, shouldValidate: true })}
                        placeholder={longDescPlaceholder}
                    />
                </FormRow>

                <FormRow label="Keuntungan" error={anyErrors.benefit?.message}>
                    <div className="flex flex-col space-y-3">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex gap-2">
                                <FormInput
                                    placeholder={`Keuntungan ${index + 1}`}
                                    className="flex-1"
                                    {...register(`benefit.${index}` as Path<TFieldValues>)}
                                />
                                <button
                                    type="button"
                                    className="flex h-[52px] w-[52px] items-center justify-center rounded-lg bg-white border border-slate-300 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                                    onClick={() => remove(index)}
                                >
                                    <TrashIcon className="h-5 w-5" weight="bold" />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => append("" as FieldArray<TFieldValues, ArrayPath<TFieldValues>>)}
                            className="flex justify-center items-center gap-2 bg-white border border-slate-400 rounded-lg py-2 px-4 text-sm font-regular text-slate-800 hover:bg-slate-100 w-fit cursor-pointer"
                        >
                            <PlusIcon className="h-4 w-4" weight="regular" />
                            <span>Tambah Keuntungan</span>
                        </button>
                    </div>
                </FormRow>
            </div>
        </div>
    );
};

/**
 * Shared Pricing Section
 */
export const PricingSection = <TFieldValues extends FieldValues = FieldValues>({
    form,
    onAdjustPrice,
    onAdjustDiscount
}: {
    form: UseFormReturn<TFieldValues>;
    onAdjustPrice: (step: number) => void;
    onAdjustDiscount: (step: number) => void;
}) => {
    const { register, watch, control, formState: { errors } } = form;
    const anyErrors = errors as Record<string, { message?: string } | undefined>;

    return (
        <div className="space-y-0 pt-4">
            <FormRow
                label="Harga"
                error={anyErrors.price?.message}
                extra={
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-[12px] font-medium text-slate-500 tracking-wider">Diskon</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                {...register("enableDiscount" as Path<TFieldValues>)}
                            />
                            <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-4 rtl:peer-checked:after:-translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-cuan-cyan"></div>
                        </label>
                    </div>
                }
            >
                <Controller
                    control={control}
                    name={"price" as Path<TFieldValues>}
                    render={({ field: { onChange, value, ref } }) => (
                        <FormInput
                            ref={ref}
                            prefix="Rp"
                            type="text"
                            inputMode="numeric"
                            placeholder="0"
                            value={value === 0 ? "" : formatNumberInput((value ?? 0).toString())}
                            onChange={(e) => {
                                const rawValue = e.target.value.replace(/\D/g, "");
                                onChange(rawValue ? Number(rawValue) : 0);
                            }}
                            suffix={
                                <div className="flex flex-col">
                                    <button type="button" onClick={() => onAdjustPrice(1000)} className="cursor-pointer">
                                        <CaretUpIcon weight="fill" className="w-3 h-3 text-slate-400 hover:text-cuan-cyan transition-colors" />
                                    </button>
                                    <button type="button" onClick={() => onAdjustPrice(-1000)} className="cursor-pointer">
                                        <CaretDownIcon weight="fill" className="w-3 h-3 text-slate-400 hover:text-cuan-cyan transition-colors" />
                                    </button>
                                </div>
                            }
                        />
                    )}
                />
            </FormRow>

            {watch("enableDiscount" as Path<TFieldValues>) && (
                <FormRow label="Harga Diskon" error={anyErrors.discountPrice?.message}>
                    <Controller
                        control={control}
                        name={"discountPrice" as Path<TFieldValues>}
                        render={({ field: { onChange, value, ref } }) => (
                            <FormInput
                                ref={ref}
                                prefix="Rp"
                                type="text"
                                inputMode="numeric"
                                placeholder="0"
                                value={value === 0 ? "" : formatNumberInput((value ?? 0).toString())}
                                onChange={(e) => {
                                    const rawValue = e.target.value.replace(/\D/g, "");
                                    onChange(rawValue ? Number(rawValue) : 0);
                                }}
                                suffix={
                                    <div className="flex flex-col">
                                        <button type="button" onClick={() => onAdjustDiscount(1000)} className="cursor-pointer">
                                            <CaretUpIcon weight="fill" className="w-3 h-3 text-slate-400 hover:text-cuan-cyan transition-colors" />
                                        </button>
                                        <button type="button" onClick={() => onAdjustDiscount(-1000)} className="cursor-pointer">
                                            <CaretDownIcon weight="fill" className="w-3 h-3 text-slate-400 hover:text-cuan-cyan transition-colors" />
                                        </button>
                                    </div>
                                }
                            />
                        )}
                    />
                </FormRow>
            )}
        </div>
    );
};

/**
 * Shared Quota/Capacity Section
 */
export const QuotaSection = <TFieldValues extends FieldValues = FieldValues>({
    form,
    onAdjustQuota,
    label = "Batasi Stok",
    placeholder = "Masukkan batas stok"
}: {
    form: UseFormReturn<TFieldValues>;
    onAdjustQuota: (step: number) => void;
    label?: string;
    placeholder?: string;
}) => {
    const { register, watch, control, setValue, formState: { errors } } = form;
    const anyErrors = errors as Record<string, { message?: string } | undefined>;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">{label}</label>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        {...register("enableQuota" as Path<TFieldValues>, {
                            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                                if (!e.target.checked) setValue("capacity" as Path<TFieldValues>, undefined as PathValue<TFieldValues, Path<TFieldValues>>, { shouldDirty: true, shouldValidate: true });
                                else setValue("capacity" as Path<TFieldValues>, 10 as PathValue<TFieldValues, Path<TFieldValues>>, { shouldDirty: true, shouldValidate: true });
                            }
                        })}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cuan-cyan"></div>
                </label>
            </div>

            {watch("enableQuota" as Path<TFieldValues>) && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <Controller
                        control={control}
                        name={"capacity" as Path<TFieldValues>}
                        render={({ field: { onChange, value, ref } }) => (
                            <FormInput
                                ref={ref}
                                placeholder={placeholder}
                                type="text"
                                inputMode="numeric"
                                value={(value as number | undefined) ?? ""}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, "");
                                    onChange(val === "" ? undefined : Number(val));
                                }}
                                suffix={
                                    <div className="flex flex-col">
                                        <button type="button" onClick={() => onAdjustQuota(1)} className="cursor-pointer">
                                            <CaretUpIcon weight="fill" className="w-3 h-3 text-slate-400 hover:text-cuan-cyan transition-colors" />
                                        </button>
                                        <button type="button" onClick={() => onAdjustQuota(-1)} className="cursor-pointer">
                                            <CaretDownIcon weight="fill" className="w-3 h-3 text-slate-400 hover:text-cuan-cyan transition-colors" />
                                        </button>
                                    </div>
                                }
                            />
                        )}
                    />
                    {anyErrors.capacity?.message && (
                        <span className="text-red-500 text-xs mt-1 block">{anyErrors.capacity.message}</span>
                    )}
                </div>
            )}
        </div>
    );
};

/**
 * Shared Platform/Content Type Selector
 */
export const PlatformSelector = <TFieldValues extends FieldValues = FieldValues>({
    form,
    type = "digital"
}: {
    form: UseFormReturn<TFieldValues>;
    type?: "digital" | "class" | "webinar";
}) => {
    const { register, watch, setValue, formState: { errors } } = form;
    const anyErrors = errors as Record<string, { message?: string } | undefined>;

    const options = {
        digital: [
            { label: "PDF", value: "PDF" },
            { label: "Video", value: "Video" },
            { label: "Template", value: "Template" },
            { label: "E-book", value: "E-book" },
            { label: "ZIP", value: "ZIP" },
            { label: "Lainnya", value: "other" },
        ],
        class: [
            { label: "Zoom", value: "zoom" },
            { label: "Google Meet", value: "google-meet" },
            { label: "Website Kelas", value: "website" },
            { label: "Lainnya", value: "other" },
        ],
        webinar: [
            { label: "Zoom", value: "zoom" },
            { label: "Google Meet", value: "google-meet" },
            { label: "Lainnya", value: "other" },
        ]
    };

    const label = type === "digital" ? "Tipe Konten" : "Platform";
    const otherPlaceholder = type === "digital" ? "Format file (contoh: EPUB, MP4, dll.)" : "Nama platform";

    return (
        <FormRow label={label} error={anyErrors.contentType?.message ?? anyErrors.platformCustom?.message}>
            <div className="space-y-2 w-full">
                <FormSelect
                    {...register("contentType" as Path<TFieldValues>, {
                        onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
                            if (e.target.value !== "other") {
                                setValue("platformCustom" as Path<TFieldValues>, "" as PathValue<TFieldValues, Path<TFieldValues>>, { shouldDirty: true });
                            }
                        }
                    })}
                >
                    <option value="" disabled>Pilih {label}</option>
                    {options[type].map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </FormSelect>
                {watch("contentType" as Path<TFieldValues>) === "other" && (
                    <FormInput
                        placeholder={otherPlaceholder}
                        className="animate-in fade-in slide-in-from-top-1 duration-200"
                        {...register("platformCustom" as Path<TFieldValues>)}
                    />
                )}
            </div>
        </FormRow>
    );
};

/**
 * Shared Sidebar Metadata Section
 */
export const SidebarMetadataSection = <TFieldValues extends FieldValues = FieldValues>({
    form,
    uploading,
    onFilesChange,
    removeImage,
    fileInputRef,
    statusOptions = [
        { label: "Published", value: "published" },
        { label: "Unpublished", value: "unpublished" }
    ]
}: {
    form: UseFormReturn<TFieldValues>;
    uploading: boolean;
    onFilesChange: (fileOrEvent: File | React.ChangeEvent<HTMLInputElement>) => void;
    removeImage: (index: number) => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    statusOptions?: { label: string; value: string }[];
}) => {
    const { register, watch, setValue, formState: { errors } } = form;
    const anyErrors = errors as Record<string, { message?: string } | undefined>;
    const images = (watch("images" as Path<TFieldValues>) as string[]) || [];

    const [cropperOpen, setCropperOpen] = React.useState(false);
    const [selectedImageSrc, setSelectedImageSrc] = React.useState("");
    const [fileName, setFileName] = React.useState("");

    const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setSelectedImageSrc(reader.result as string);
            setFileName(file.name);
            setCropperOpen(true);
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    return (
        <div className="shrink-0 w-full lg:w-[400px] space-y-6">
            {/* Thumbnail */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-slate-700 text-sm font-semibold mb-3">Thumbnail</p>
                <div className="flex flex-wrap gap-3 items-start">
                    {images.map((img: string, index: number) => (
                        <div key={index} className="relative group shrink-0 w-24 aspect-square">
                            <Image
                                src={img}
                                alt={`Thumbnail ${index + 1}`}
                                fill
                                unoptimized
                                className="object-cover rounded-xl border border-slate-200"
                            />
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md border border-slate-200 text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                                <X size={12} weight="bold" />
                            </button>
                        </div>
                    ))}

                    {images.length < 4 && (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="relative group shrink-0 w-24 aspect-square cursor-pointer"
                        >
                            <div className="w-full h-full bg-white border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center overflow-hidden transition-colors group-hover:border-cuan-cyan/100 group-hover:bg-cuan-cyan/10">
                                {uploading ? (
                                    <CircleNotchIcon className="animate-spin text-cuan-cyan" size={24} />
                                ) : (
                                    <div className="flex flex-col items-center gap-1 text-slate-400">
                                        <PlusIcon size={24} weight="bold" />
                                        <span className="text-[10px] font-medium">Tambah</span>
                                    </div>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleLocalFileChange}
                            />
                        </div>
                    )}
                </div>
                <p className="text-[12px] text-slate-400 mt-3 leading-tight italic">Maksimal 4 gambar. JPG/PNG, 1:1 direkomendasikan</p>
            </div>

            <ImageCropperDialog
                isOpen={cropperOpen}
                imageSrc={selectedImageSrc}
                fileName={fileName}
                onClose={() => setCropperOpen(false)}
                onCrop={(croppedFile) => {
                    onFilesChange(croppedFile);
                }}
            />

            {/* Status */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-slate-700 text-sm font-semibold mb-3">Status</p>
                <FormSelect {...register("status" as Path<TFieldValues>)}>
                    {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </FormSelect>
                {anyErrors.status?.message && (
                    <span className="text-red-500 text-xs mt-1 block">{anyErrors.status.message}</span>
                )}
            </div>

            {/* Pengaturan Tambahan */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-slate-700 text-sm font-semibold mb-3">Pengaturan Tambahan</p>
                <div className="space-y-4 pt-2">
                    {/* Voucher Toggle */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-slate-700">Aktifkan Voucher</label>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    {...register("enableVoucher" as Path<TFieldValues>)}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cuan-cyan"></div>
                            </label>
                        </div>

                        {watch("enableVoucher" as Path<TFieldValues>) && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                <VoucherSelector
                                    selectedIds={(watch("vouchers" as Path<TFieldValues>) as string[]) || []}
                                    onChange={(ids) => setValue("vouchers" as Path<TFieldValues>, ids as PathValue<TFieldValues, Path<TFieldValues>>, { shouldDirty: true, shouldValidate: true })}
                                />
                            </div>
                        )}
                    </div>

                    {/* Notes Toggle */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-slate-700">Catatan Khusus di Email</label>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    {...register("enableNotes" as Path<TFieldValues>)}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cuan-cyan"></div>
                            </label>
                        </div>

                        {watch("enableNotes" as Path<TFieldValues>) && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-200 space-y-1">
                                <FormTextarea
                                    placeholder="Masukkan catatan khusus yang akan dikirim ke email pembeli"
                                    className="min-h-[60px]"
                                    {...register("notes" as Path<TFieldValues>)}
                                />
                                {anyErrors.notes?.message && (
                                    <span className="text-red-500 text-xs mt-1 block">{anyErrors.notes.message}</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Portal Toggle */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-slate-700">Portal Akses</label>
                                <span className="text-xs text-slate-400">Buyer bisa akses semua link via 1 halaman portal</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    {...register("enablePortal" as Path<TFieldValues>)}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cuan-cyan"></div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

