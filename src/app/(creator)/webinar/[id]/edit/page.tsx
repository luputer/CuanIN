"use client";

// React
import { useRef } from "react";

// Next.js
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

// Third-party
import { isBefore, startOfDay } from "date-fns";
import { Controller } from "react-hook-form";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

// Icons
import {
    ArrowLeftIcon,
    CaretDownIcon,
    CaretUpIcon,
    CircleNotchIcon,
    ImageIcon,
    PencilSimpleIcon,
    PlusIcon,
    TrashIcon,
} from "@phosphor-icons/react";

// Internal
import { useWebinar } from "~/hooks/use-webinar";
import { formatNumberInput } from "~/lib/utils";
import { DateTimePicker } from "~/components/ui/date-time-picker";
import {
    FormGroup,
    FormInput,
    FormSelect,
    FormTextarea,
    SectionHeader,
} from "~/components/ui/form-layout";
import ButtonCancel from "~/components/ui/button-cancel";
import ButtonSave from "~/components/ui/button-save";

// Dynamic import — MDEditor tidak support SSR
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function EditWebinarPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        form,
        fields,
        append,
        remove,
        uploading,
        previewUrl,
        onFileChange,
        onSubmit,
        isPending,
        isLoadingProduct,
        product,
    } = useWebinar({ id, isEdit: true });

    const { register, watch, setValue, getValues, control, formState: { errors } } = form;

    // Watched values
    const priceType = watch("priceType");
    const dateStart = watch("dateStart");
    const dateEnd = watch("dateEnd");
    const dateDeadline = watch("dateDeadline");

    // ─── Handlers ────────────────────────────────────────────────────────────

    const handlePriceAdjust = (amount: number) => {
        const current = Number(getValues("price")?.toString() ?? "0");
        const newPrice = Math.max(0, current + amount);
        setValue("price", newPrice, { shouldValidate: true });
    };

    const handleQuotaAdjust = (amount: number) => {
        const currentQuota = Number(getValues("quota") || 0);
        const newQuota = Math.max(0, currentQuota + amount);
        setValue("quota", newQuota, { shouldValidate: true });
    };

    // ─── Loading & Error States ───────────────────────────────────────────────

    if (isLoadingProduct) {
        return (
            <div className="flex justify-center py-20">
                <CircleNotchIcon className="animate-spin text-cyan-500" size={32} />
            </div>
        );
    }

    if (!product) {
        return <p className="text-center py-20">Webinar tidak ditemukan</p>;
    }

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="bg-slate-50">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sticky top-[74px] bg-slate-50 z-40 -mx-4 px-4 pt-2">
                    <div className="flex-1 flex flex-col gap-1">
                        <Link
                            href={`/webinar/${id}`}
                            className="group flex items-center gap-2 text-sm font-regular text-slate-600 hover:text-slate-800 transition-colors w-fit mb-2"
                        >
                            <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                            <span className="leading-none">Kembali ke Detail</span>
                        </Link>
                        <h1 className="text-xl font-semibold text-slate-800">Edit Webinar</h1>
                    </div>
                </div>
            </div>

            <div className="bg-cyan-50 rounded-xl border border-slate-800 overflow-hidden">
                {/* Sub-header: nama webinar yang sedang diedit */}
                <div className="bg-cyan-50 px-4 sm:px-10 py-6 border-b border-slate-800">
                    <h2 className="text-lg font-semibold text-cyan-900">{product.name}</h2>
                </div>

                <div className="px-4 sm:px-10 py-6 sm:py-8">

                    {/* ─── Informasi Webinar ─── */}
                    <SectionHeader title="Informasi Webinar" />

                    <div>
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
                                    onClick={() => fileInputRef.current?.click()}
                                    className="relative group shrink-0 w-48 h-48 cursor-pointer"
                                >
                                    <div className="w-full h-full bg-slate-50 border-2 border-dashed border-slate-400 rounded-xl flex flex-col items-center justify-center overflow-hidden transition-colors group-hover:border-slate-400 group-hover:bg-slate-100">
                                        {previewUrl ? (
                                            <>
                                                <Image
                                                    src={previewUrl}
                                                    alt="Preview"
                                                    fill
                                                    unoptimized
                                                    className="object-cover rounded-xl group-hover:opacity-80 transition-opacity"
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
                                            <div className="flex flex-col items-center gap-2 text-slate-400">
                                                <ImageIcon size={32} weight="light" />
                                                <span className="text-xs font-medium">Upload Gambar</span>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={onFileChange}
                                    />
                                </div>
                                <p className="text-xs text-slate-500">JPG/PNG, 1:1 (square) direkomendasikan</p>
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
                        <FormGroup label="Deskripsi Lengkap" align="start" error={errors.description?.message}>
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

                        {/* Manfaat */}
                        <FormGroup label="Manfaat" align="start" error={errors.benefit?.message}>
                            <div className="flex flex-col space-y-3">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2">
                                        <FormInput
                                            placeholder={`Manfaat ${index + 1}`}
                                            className="flex-1"
                                            {...register(`benefit.${index}` as const)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="flex h-[52px] w-[52px] items-center justify-center rounded-lg bg-white border border-slate-300 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
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
                                    <span>Tambah Manfaat</span>
                                </button>
                            </div>
                        </FormGroup>

                        {/* Tipe Harga */}
                        <FormGroup label="Tipe" error={errors.priceType?.message}>
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
                        <FormGroup label="Link" error={errors.link?.message}>
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
                        <div>
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
                        <div>
                            {/* Kuota */}
                            <FormGroup label="Kuota" error={errors.quota?.message}>
                                <Controller
                                    control={control}
                                    name="quota"
                                    render={({ field: { onChange, value, ref } }) => (
                                        <FormInput
                                            ref={ref}
                                            placeholder="0 (Isi 0 jika tidak terbatas)"
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
                        onClick={() => router.push(`/webinar/${id}`)}
                    />
                    <ButtonSave
                        onClick={onSubmit}
                        isLoading={isPending}
                        label="Simpan Perubahan"
                        loadingLabel="Menyimpan..."
                        weight="bold"
                    />
                </div>
            </div>
        </div>
    );
}
