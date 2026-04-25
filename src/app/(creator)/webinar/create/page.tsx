"use client";

import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, ImageIcon, PlusIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import dynamic from "next/dynamic";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { DateTimePicker } from "~/components/ui/date-time-picker";
import { webinarSchema } from "~/lib/validation";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import Image from "next/image";
import { useState } from "react";
import {
    FormGroup,
    SectionHeader,
    FormInput,
    FormTextarea,
    FormSelect
} from "~/components/ui/form-layout";
import ButtonAdd from "~/components/ui/button-add";
import ButtonCancel from "~/components/ui/button-cancel";

// Import MDEditor secara dynamic karena tidak support SSR
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

type WebinarFormValues = z.infer<typeof webinarSchema>;

export default function CreateWebinarPage() {
    const router = useRouter();
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        control,
        formState: { errors },
    } = useForm<WebinarFormValues>({
        resolver: zodResolver(webinarSchema),
        defaultValues: {
            priceType: "free",
            platform: "zoom",
            status: "published",
            price: 0,
            benefit: ["", "", ""], // Default 3 empty benefits
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "benefit" as never,
    });

    const priceType = watch("priceType");
    const dateStart = watch("dateStart");
    const dateEnd = watch("dateEnd");
    const dateDeadline = watch("dateDeadline");

    const utils = api.useUtils();

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
            name: data.name,
            shortDescription: data.shortDescription,
            description: data.description,
            price: data.priceType === "free" ? 0 : (data.price ?? 0),
            type: "WEBINAR",
            startDate: data.dateStart,
            endDate: data.dateEnd,
            dateDeadline: data.dateDeadline,
            link: data.link ?? undefined,
            status: data.status,
            platform: actualPlatform,
            quota: data.quota,
            benefit: data.benefit?.filter(b => b.trim() !== ""),
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setImagePreview(base64String);
                // setValue("image", base64String); // Jika schema mendukung base64
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-slate-50">
                <div className="sticky top-[74px] bg-slate-50 z-40 -mx-4 px-4 mb-2">
                    <Link
                        href="/webinar"
                        className="group flex items-center gap-2 text-sm font-regular text-slate-600 hover:text-slate-800 transition-colors w-fit mb-2"
                    >
                        <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                        <span className="leading-none">Kembali ke Daftar</span>
                    </Link>
                    <h1 className="text-2xl font-semibold text-slate-800">Tambah Webinar Baru</h1>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-800 overflow-hidden">
                <div className="px-4 sm:px-10 py-6 sm:py-8">

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
                                <div className="relative group shrink-0 w-48 h-48">
                                    <div className="w-full h-full bg-slate-50 border-2 border-dashed border-slate-400 rounded-xl flex flex-col items-center justify-center overflow-hidden transition-colors group-hover:border-slate-400 group-hover:bg-slate-100">
                                        {imagePreview ? (
                                            <>
                                                <Image
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    fill
                                                    className="object-cover rounded-xl group-hover:opacity-80 transition-opacity"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                                                    <div className="bg-white/90 p-2 rounded-full shadow-md text-slate-800">
                                                        <PencilSimpleIcon size={24} weight="bold" />
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-slate-400">
                                                <ImageIcon size={32} weight="light" />
                                                <span className="text-xs font-medium">Upload Gambar</span>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={handleImageChange}
                                        accept="image/*"
                                    />
                                </div>
                                <div className="text-xs text-slate-500 leading-relaxed">
                                    <ul className="list-inside space-y-1 ml-1">
                                        <li>JPG/PNG, 1:1 (square) direkomendasikan</li>
                                    </ul>
                                </div>
                            </div>
                        </FormGroup>
                        <FormGroup label="Deskripsi Singkat" align="start" error={errors.shortDescription?.message}>
                            <FormTextarea
                                placeholder="Masukkan deskripsi singkat webinar"
                                {...register("shortDescription")}
                            />
                        </FormGroup>
                        <FormGroup label="Deskripsi" align="start" error={(errors.description as any)?.message}>
                            <div data-color-mode="light" className="border border-slate-400 rounded-lg overflow-hidden">
                                <MDEditor
                                    value={watch("description") ?? ""}
                                    onChange={(val) => setValue("description", val ?? "")}
                                    height={400}
                                    preview="live"
                                    visibleDragbar={false}
                                    style={{ border: 'none', boxShadow: 'none' }}
                                    previewOptions={{
                                        remarkPlugins: [remarkGfm, remarkBreaks],
                                    }}
                                />
                            </div>
                        </FormGroup>
                        <FormGroup label="Manfaat" align="start" error={(errors.benefit as any)?.message}>
                            <div className="space-y-3 flex flex-col">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2">
                                        <FormInput
                                            placeholder={`Manfaat ${index + 1}`}
                                            className="flex-1"
                                            {...register(`benefit.${index}` as const)}
                                        />
                                        <button
                                            type="button"
                                            className="flex h-[52px] w-[52px] items-center justify-center rounded-lg bg-red-50 text-red-500 hover:text-red-700 hover:bg-red-100 transition-colors border border-transparent shrink-0 cursor-pointer"
                                            onClick={() => remove(index)}
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
                                onChange={(e) =>
                                    setValue("priceType", e.target.value as "free" | "paid", {
                                        shouldValidate: true,
                                    })
                                }
                            >
                                <option value="free">Gratis</option>
                                <option value="paid">Berbayar</option>
                            </FormSelect>
                        </FormGroup>

                        {/* Harga */}
                        {priceType === "paid" && (
                            <FormGroup label="Harga" error={errors.price?.message}>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium group-focus-within:text-cyan-600 transition-colors">Rp</div>
                                    <FormInput
                                        type="number"
                                        placeholder="0"
                                        className="pl-12"
                                        {...register("price", { valueAsNumber: true })}
                                    />
                                </div>
                            </FormGroup>
                        )}

                        <FormGroup label="Platform" error={errors.platform?.message}>
                            <div className="space-y-3">
                                <FormSelect
                                    {...register("platform")}
                                >
                                    <option value="zoom">Zoom</option>
                                    <option value="google-meet">Google Meet</option>
                                    <option value="other">Lainnya</option>
                                </FormSelect>

                                {watch("platform") === "other" && (
                                    <FormInput
                                        placeholder="Sebutkan nama platform (misal: Youtube Live, dsb)"
                                        {...register("platformCustom")}
                                        className="animate-in fade-in slide-in-from-top-1 duration-200"
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
                        <FormGroup label="Catatan" error={errors.notes?.message} align="start">
                            <FormTextarea
                                placeholder="Masukkan catatan untuk pembeli setelah membayar"
                                {...register("notes")}
                            />
                        </FormGroup>

                        {/* Status */}
                        <FormGroup label="Status" error={errors.status?.message}>
                            <FormSelect
                                {...register("status")}
                            >
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                                <option value="archived">Archived</option>
                            </FormSelect>
                        </FormGroup>
                    </div>

                    {/* ─── Jadwal & Harga ─── */}
                    <section className="mt-6">
                        <SectionHeader title="Jadwal" />

                        <div>
                            {/* Waktu Mulai */}
                            <FormGroup label="Waktu Mulai" error={errors.dateStart?.message}>
                                <DateTimePicker
                                    date={dateStart}
                                    setDate={(date) =>
                                        setValue("dateStart", date, { shouldValidate: true })
                                    }
                                    placeholder="Pilih Tanggal & Waktu Mulai"
                                />
                            </FormGroup>

                            {/* Waktu Selesai */}
                            <FormGroup label="Waktu Selesai" error={errors.dateEnd?.message}>
                                <DateTimePicker
                                    date={dateEnd}
                                    setDate={(date) =>
                                        setValue("dateEnd", date, { shouldValidate: true })
                                    }
                                    placeholder="Pilih Tanggal & Waktu Selesai"
                                />
                            </FormGroup>
                        </div>
                    </section>

                    <section className="mt-6">
                        <SectionHeader title="Pendaftaran" />
                        {/* Kuota */}
                        <FormGroup label="Kuota" error={errors.quota?.message}>
                            <FormInput
                                type="number"
                                placeholder="0 (Isi 0 jika tidak terbatas)"
                                {...register("quota", { valueAsNumber: true })}
                            />
                        </FormGroup>

                        {/* Batas Pendaftaran */}
                        <FormGroup label="Batas Pendaftaran" error={errors.dateDeadline?.message}>
                            <DateTimePicker
                                date={dateDeadline}
                                setDate={(date) =>
                                    setValue("dateDeadline", date, { shouldValidate: true })
                                }
                                placeholder="Pilih Batas Waktu Pendaftaran"
                            />
                        </FormGroup>
                    </section>



                </div>

                {/* Footer Actions */}
                <div className="px-4 sm:px-10 pb-8 flex justify-end gap-4">
                    <ButtonCancel
                        type="button"
                        onClick={() => router.push("/webinar")}
                    />
                    <ButtonAdd
                        label="Buat Webinar"
                        weight="bold"
                        onClick={handleSubmit(onSubmit)}
                        isLoading={createWebinar.isPending}
                    />
                </div>
            </div >
        </div >
    );
}