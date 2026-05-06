"use client";

// React
import React, { useRef, useEffect } from "react";

// Next.js
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Third-party
import { zodResolver } from "@hookform/resolvers/zod";
import { isBefore, startOfDay } from "date-fns";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import type { z } from "zod";

// Icons
import {
    ArrowLeftIcon,
    CaretDownIcon,
    CaretUpIcon,
    CircleNotchIcon,
    PencilSimpleIcon,
    PlusIcon,
    TrashIcon,
} from "@phosphor-icons/react";

// Internal & Utils
import { api } from "~/trpc/react";
import { webinarSchema } from "~/lib/validation";
import { formatNumberInput } from "~/lib/utils";
import { useImageUpload } from "~/hooks/use-upload";

// Components
import { DateTimePicker } from "~/components/ui/date-time-picker";
import {
    FormGroup,
    FormInput,
    FormSelect,
    FormTextarea,
    SectionHeader,
} from "~/components/ui/form-layout";
import ButtonAdd from "~/components/ui/button-add";
import ButtonCancel from "~/components/ui/button-cancel";

// Dynamic import — MDEditor tidak support SSR
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

type WebinarFormValues = z.infer<typeof webinarSchema>;

export default function CreateWebinarPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const utils = api.useUtils();

    const {
        previewUrl,
        uploading,
        handleFileUpload,
    } = useImageUpload("products");

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        getValues,
        control,
        formState: { errors },
    } = useForm<WebinarFormValues>({
        resolver: zodResolver(webinarSchema),
        defaultValues: {
            priceType: "free",
            platform: "zoom",
            status: "published",
            price: 0,
            quota: 0,
            notes: "",
            benefit: ["", "", ""],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "benefit" as never,
    });

    // Watched values
    const priceType = watch("priceType");
    const dateStart = watch("dateStart");
    const dateEnd = watch("dateEnd");
    const dateDeadline = watch("dateDeadline");

    // ─── Effects ─────────────────────────────────────────────────────────────

    // Format initial price value or when priceType changes to paid
    useEffect(() => {
        if (priceType === "paid") {
            const input = document.getElementById("price-input-create") as HTMLInputElement;
            if (input) {
                const currentVal = getValues("price")?.toString() ?? "0";
                input.value = formatNumberInput(currentVal);
            }
        }
    }, [priceType, getValues]);

    // ─── Handlers ────────────────────────────────────────────────────────────

    const handlePriceAdjust = (amount: number) => {
        const currentPrice = Number(getValues("price")?.toString() ?? "0");
        const newPrice = Math.max(0, currentPrice + amount);
        setValue("price", newPrice, { shouldValidate: true });

        const input = document.getElementById("price-input-create") as HTMLInputElement;
        if (input) {
            input.value = formatNumberInput(newPrice.toString());
        }
    };

    const handleQuotaAdjust = (amount: number) => {
        const currentQuota = Number(getValues("quota") ?? 0);
        const newQuota = Math.max(0, currentQuota + amount);
        setValue("quota", newQuota, { shouldValidate: true });

        const input = document.getElementById("quota-input-create") as HTMLInputElement;
        if (input) {
            input.value = newQuota.toString();
        }
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = await handleFileUpload(e);
        if (url) {
            setValue("image", url, { shouldValidate: true });
        }
    };

    // ─── API ─────────────────────────────────────────────────────────────────

    const createWebinar = api.products.create.useMutation({
        onSuccess: () => {
            void utils.products.getAll.invalidate();
            toast.success("Webinar berhasil dibuat");
            router.push("/webinar");
        },
        onError: (error) => {
            toast.error(`Gagal membuat webinar: ${error.message}`);
        },
    });

    const onSubmit = (data: WebinarFormValues) => {
        const actualPlatform = data.platform === "other" ? data.platformCustom : data.platform;

        createWebinar.mutate({
            type: "WEBINAR",
            name: data.name,
            shortDescription: data.shortDescription,
            description: data.description,
            price: data.priceType === "free" ? 0 : (data.price ?? 0),
            platform: actualPlatform,
            link: data.link ?? undefined,
            notes: data.notes ?? undefined,
            status: data.status,
            startDate: data.dateStart,
            endDate: data.dateEnd,
            dateDeadline: data.dateDeadline,
            quota: data.quota,
            benefit: data.benefit?.filter((b) => b.trim() !== ""),
            image: data.image,
        });
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-slate-50">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sticky top-[74px] bg-slate-50 z-40 -mx-4 px-4 pt-2">
                    <div className="flex-1 flex flex-col gap-1">
                        <Link
                            href="/webinar"
                            className="group flex items-center gap-2 text-sm font-regular text-slate-600 hover:text-slate-800 transition-colors w-fit mb-2"
                        >
                            <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                            <span className="leading-none">Kembali ke Daftar Webinar</span>
                        </Link>
                        <h1 className="text-xl font-semibold text-slate-800">Tambah Webinar Baru</h1>
                    </div>
                </div>
            </div>

            <div className="bg-cyan-50 rounded-xl border border-slate-800 overflow-hidden shadow-[0px_2px_0px_rgba(29,41,61)]">
                <div className="px-4 sm:px-10 py-6 sm:py-8">
                    {/* ─── Informasi Webinar ─── */}
                    <SectionHeader title="Informasi Webinar" />

                    <div className="mt-4">
                        {/* Nama */}
                        <FormGroup label="Nama" error={errors.name?.message}>
                            <FormInput
                                placeholder="Masukkan nama webinar"
                                {...register("name")}
                            />
                        </FormGroup>

                        {/* Gambar */}
                        <FormGroup label="Gambar" align="start">
                            <div className="flex flex-col gap-3">
                                <div
                                    className="relative group shrink-0 w-48 h-48 cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="w-full h-full bg-white border-2 border-dashed border-slate-400 hover:bg-slate-100 rounded-xl flex flex-col items-center justify-center overflow-hidden relative">
                                        {previewUrl ? (
                                            <>
                                                <Image
                                                    src={previewUrl}
                                                    alt="Preview"
                                                    fill
                                                    className="object-cover group-hover:opacity-80 transition-opacity"
                                                    unoptimized
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                                                    <div className="bg-white/90 p-2 rounded-full shadow-md text-slate-800">
                                                        <PencilSimpleIcon size={24} weight="bold" />
                                                    </div>
                                                </div>
                                                {uploading && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                        <CircleNotchIcon className="animate-spin text-white" size={32} />
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-cyan-600 transition-colors">
                                                <PlusIcon size={32} weight="bold" />
                                                <span className="text-xs font-medium">Unggah Gambar</span>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </div>
                                <p className="text-xs text-slate-500 italic">Disarankan rasio 1:1 (square)</p>
                            </div>
                        </FormGroup>

                        {/* Ringkasan */}
                        <FormGroup
                            label="Ringkasan"
                            align="start"
                            error={errors.shortDescription?.message}
                            description={`${watch("shortDescription")?.length ?? 0}/200 karakter`}
                        >
                            <FormTextarea
                                placeholder="Masukkan ringkasan tentang webinar ini"
                                {...register("shortDescription")}
                            />
                        </FormGroup>

                        {/* Deskripsi Lengkap */}
                        <FormGroup label="Deskripsi" align="start" error={errors.description?.message}>
                            <div data-color-mode="light" className="border border-slate-400 rounded-lg overflow-hidden">
                                <MDEditor
                                    textareaProps={{ placeholder: "Masukkan deskripsi lengkap tentang webinar" }}
                                    value={watch("description") ?? ""}
                                    onChange={(val) => setValue("description", val ?? "")}
                                    height={400}
                                    preview="live"
                                    visibleDragbar={false}
                                    style={{ border: "none", boxShadow: "none" }}
                                    previewOptions={{ remarkPlugins: [remarkGfm, remarkBreaks] }}
                                />
                            </div>
                        </FormGroup>

                        {/* Benefit */}
                        <FormGroup label="Benefit" align="start" error={errors.benefit?.message}>
                            <div className="flex flex-col space-y-3">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2">
                                        <FormInput
                                            placeholder={`Benefit ${index + 1}`}
                                            className="flex-1"
                                            {...register(`benefit.${index}` as const)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="flex h-[52px] w-[52px] items-center justify-center rounded-lg bg-white border border-slate-400 text-red-500 hover:text-red-700 hover:bg-red-100 transition-colors shrink-0 cursor-pointer"
                                        >
                                            <TrashIcon className="h-5 w-5 translate-y-[0.5px]" weight="bold" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => append("")}
                                    className="flex justify-center items-center gap-2 bg-white border border-slate-400 rounded-lg py-2 px-4 text-sm font-regular text-slate-800 hover:bg-slate-100 w-fit cursor-pointer"
                                >
                                    <PlusIcon className="h-4 w-4" weight="regular" />
                                    <span>Tambah Benefit</span>
                                </button>
                            </div>
                        </FormGroup>

                        {/* Tipe Harga */}
                        <FormGroup label="Tipe">
                            <FormSelect
                                value={priceType}
                                onChange={(e) => {
                                    const val = e.target.value as "free" | "paid";
                                    setValue("priceType", val, { shouldValidate: true });
                                    if (val === "free") {
                                        setValue("price", 0, { shouldValidate: true });
                                    }
                                }}
                            >
                                <option value="free">Gratis</option>
                                <option value="paid">Berbayar</option>
                            </FormSelect>
                        </FormGroup>

                        {/* Harga — hanya muncul jika berbayar */}
                        {priceType === "paid" && (
                            <FormGroup label="Harga" error={errors.price?.message}>
                                <Controller
                                    control={control}
                                    name="price"
                                    render={({ field: { onChange, value, ref } }) => (
                                        <FormInput
                                            ref={ref}
                                            id="price-input-create"
                                            prefix="Rp"
                                            value={formatNumberInput((value ?? 0).toString())}
                                            onChange={(e) => {
                                                const rawValue = e.target.value.replace(/\D/g, "");
                                                onChange(rawValue ? Number(rawValue) : 0);
                                            }}
                                            suffix={
                                                <div className="flex flex-col">
                                                    <button type="button" onClick={() => handlePriceAdjust(1000)} className="cursor-pointer">
                                                        <CaretUpIcon weight="fill" className="w-3 h-3 text-slate-400 hover:text-cyan-600 transition-colors" />
                                                    </button>
                                                    <button type="button" onClick={() => handlePriceAdjust(-1000)} className="cursor-pointer">
                                                        <CaretDownIcon weight="fill" className="w-3 h-3 text-slate-400 hover:text-cyan-600 transition-colors" />
                                                    </button>
                                                </div>
                                            }
                                        />
                                    )}
                                />
                            </FormGroup>
                        )}

                        {/* Platform */}
                        <FormGroup label="Platform" error={errors.platform?.message ?? errors.platformCustom?.message}>
                            <div className="space-y-3">
                                <FormSelect
                                    {...register("platform", {
                                        onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
                                            if (e.target.value !== "other") {
                                                setValue("platformCustom", "");
                                            }
                                        }
                                    })}
                                >
                                    <option value="zoom">Zoom</option>
                                    <option value="google-meet">Google Meet</option>
                                    <option value="other">Lainnya</option>
                                </FormSelect>
                                {watch("platform") === "other" && (
                                    <FormInput
                                        placeholder="Sebutkan nama platform (misal: Youtube Live, dsb)"
                                        className="animate-in fade-in slide-in-from-top-1 duration-200"
                                        {...register("platformCustom")}
                                    />
                                )}
                            </div>
                        </FormGroup>

                        {/* Link */}
                        <FormGroup label="Link Akses" error={errors.link?.message}>
                            <FormInput
                                placeholder="https://zoom.us/j/..."
                                {...register("link")}
                            />
                        </FormGroup>

                        {/* Catatan */}
                        <FormGroup label="Catatan" align="start" error={errors.notes?.message}>
                            <FormTextarea
                                placeholder="Masukkan catatan untuk pembeli setelah membayar"
                                {...register("notes")}
                            />
                        </FormGroup>

                        {/* Status */}
                        <FormGroup label="Status" error={errors.status?.message}>
                            <FormSelect {...register("status")}>
                                <option value="published">Published</option>
                                <option value="unpublished">Unpublished</option>
                                <option value="archived">Selesai</option>
                            </FormSelect>
                        </FormGroup>
                    </div>

                    {/* ─── Jadwal ─── */}
                    <section className="mt-6">
                        <SectionHeader title="Jadwal" />
                        <div className="mt-4">
                            {/* Waktu Mulai */}
                            <FormGroup label="Waktu Mulai" error={errors.dateStart?.message}>
                                <DateTimePicker
                                    date={dateStart}
                                    setDate={(date) => setValue("dateStart", date, { shouldValidate: true })}
                                    placeholder="Pilih Tanggal & Waktu Mulai"
                                    disabled={(date) => {
                                        const now = new Date();
                                        if (date.getHours() === 0 && date.getMinutes() === 0) {
                                            return isBefore(date, startOfDay(now));
                                        }
                                        return isBefore(date, now);
                                    }}
                                />
                            </FormGroup>

                            {/* Waktu Selesai */}
                            <FormGroup label="Waktu Selesai" error={errors.dateEnd?.message}>
                                <DateTimePicker
                                    date={dateEnd}
                                    setDate={(date) => setValue("dateEnd", date, { shouldValidate: true })}
                                    placeholder="Pilih Tanggal & Waktu Selesai"
                                    disabled={(date) => {
                                        const now = new Date();
                                        // Referensi: gunakan dateStart jika sudah dipilih dan lebih dari sekarang
                                        const reference = dateStart && isBefore(now, dateStart) ? dateStart : now;
                                        if (date.getHours() === 0 && date.getMinutes() === 0) {
                                            return isBefore(date, startOfDay(reference));
                                        }
                                        return isBefore(date, reference);
                                    }}
                                />
                            </FormGroup>
                        </div>
                    </section>

                    {/* ─── Pendaftaran ─── */}
                    <section className="mt-6">
                        <SectionHeader title="Pendaftaran" />
                        <div className="mt-4">
                            {/* Kuota */}
                            <FormGroup
                                label="Kuota"
                                error={errors.quota?.message}
                                description="Isi 0 jika tidak ada batas kuota"
                            >
                                <Controller
                                    control={control}
                                    name="quota"
                                    render={({ field: { onChange, value, ref } }) => (
                                        <FormInput
                                            ref={ref}
                                            id="quota-input-create"
                                            placeholder="Masukkan jumlah kuota"
                                            value={value ?? ""}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/[^0-9]/g, "");
                                                onChange(val === "" ? undefined : Number(val));
                                            }}
                                            suffix={
                                                <div className="flex flex-col">
                                                    <button type="button" onClick={() => handleQuotaAdjust(1)} className="cursor-pointer">
                                                        <CaretUpIcon weight="fill" className="w-3 h-3 text-slate-400 hover:text-cyan-600 transition-colors" />
                                                    </button>
                                                    <button type="button" onClick={() => handleQuotaAdjust(-1)} className="cursor-pointer">
                                                        <CaretDownIcon weight="fill" className="w-3 h-3 text-slate-400 hover:text-cyan-600 transition-colors" />
                                                    </button>
                                                </div>
                                            }
                                        />
                                    )}
                                />
                            </FormGroup>

                            {/* Batas Pendaftaran */}
                            <FormGroup label="Batas Pendaftaran" error={errors.dateDeadline?.message}>
                                <DateTimePicker
                                    date={dateDeadline}
                                    setDate={(date) => setValue("dateDeadline", date, { shouldValidate: true })}
                                    placeholder="Pilih Batas Waktu Pendaftaran"
                                    disabled={(date) => {
                                        const now = new Date();
                                        // Harus setelah sekarang
                                        if (date.getHours() === 0 && date.getMinutes() === 0) {
                                            if (isBefore(date, startOfDay(now))) return true;
                                        } else {
                                            if (isBefore(date, now)) return true;
                                        }
                                        // Tidak boleh setelah waktu mulai
                                        if (dateStart) {
                                            if (date.getHours() === 0 && date.getMinutes() === 0) {
                                                return date > startOfDay(dateStart);
                                            }
                                            return date > dateStart;
                                        }
                                        return false;
                                    }}
                                />
                            </FormGroup>
                        </div>
                    </section>
                </div>

                {/* Footer Actions */}
                <div className="px-4 sm:px-10 pb-8 flex justify-end gap-4">
                    <ButtonCancel
                        type="button"
                        onClick={() => router.push("/webinar")}
                    />
                    <ButtonAdd
                        label="Tambah Webinar"
                        weight="bold"
                        onClick={handleSubmit(onSubmit)}
                        isLoading={createWebinar.isPending}
                    />
                </div>
            </div>
        </div>
    );
}