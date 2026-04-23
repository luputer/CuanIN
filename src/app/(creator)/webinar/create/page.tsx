"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

// Import MDEditor secara dynamic karena tidak support SSR
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { DateTimePicker } from "~/components/ui/date-time-picker";
import { webinarSchema } from "~/lib/validation";
import remarkGfm from "remark-gfm";

// ============================================================
// Schema Zod
// ============================================================

type WebinarFormValues = z.infer<typeof webinarSchema>;

// ============================================================
// Sub-components
// ============================================================
const FormGroup = ({
    label,
    children,
    error,
}: {
    label: string;
    children: React.ReactNode;
    error?: string;
}) => (
    <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 items-start">
        <Label className="mt-2 text-slate-700 font-medium text-base">{label}</Label>
        <div className="w-full">
            {children}
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    </div>
);

const SectionHeader = ({ title }: { title: string }) => (
    <div className="border-b-2 border-blue-500 pb-2 mb-6">
        <h2 className="text-lg font-bold text-slate-700">{title}</h2>
    </div>
);

// ============================================================
// Main Page
// ============================================================
export default function CreateWebinarPage() {
    const router = useRouter();

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
        },
    });

    const priceType = watch("priceType");
    const dateStart = watch("dateStart");
    const dateEnd = watch("dateEnd");
    const dateDeadline = watch("dateDeadline");

    const utils = api.useUtils();

    const createWebinar = api.products.create.useMutation({
        onSuccess: () => {
            // Invalidate di background — tidak blocking navigasi
            void utils.products.getAll.invalidate();
            toast.success("Webinar berhasil dibuat");
            router.push("/webinar");
        },
        onError: (error) => {
            toast.error(`Gagal membuat webinar: ${error.message}`);
        },
    });

    const onSubmit = (data: WebinarFormValues) => {
        createWebinar.mutate({
            name: data.name,
            description: data.description,
            price: data.priceType === "free" ? 0 : (data.price ?? 0),
            type: "WEBINAR",
            startDate: data.dateStart,
            endDate: data.dateEnd,
            link: data.link ?? undefined,
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-2 mb-8">
                <Link
                    href="/webinar"
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 w-fit"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Kembali ke Daftar Webinar</span>
                </Link>
                <h1 className="text-2xl font-bold text-blue-600">Tambah Webinar Baru</h1>
            </div>

            <div className="bg-blue-50 p-6 rounded-xl space-y-8 border-2 border-blue-200">
                {/* ─── Informasi Produk ─── */}
                <section>
                    <SectionHeader title="Informasi Produk" />
                    <div className="space-y-5">
                        {/* Nama */}
                        <FormGroup label="Nama" error={errors.name?.message}>
                            <Input
                                placeholder="Masukkan nama webinar"
                                className="bg-white h-[52px] border-blue-200 focus-visible:ring-blue-500"
                                {...register("name")}
                            />
                        </FormGroup>

                        <FormGroup label="Deskripsi" error={errors.description?.message}>
                            <div data-color-mode="light">
                                <Controller
                                    name="description"
                                    control={control}
                                    render={({ field }) => (
                                        <MDEditor
                                            value={field.value ?? ""}
                                            onChange={(val) => field.onChange(val ?? "")}
                                            preview="live"
                                            height={300}
                                            visibleDragbar={false}
                                            previewOptions={{
                                                remarkPlugins: [[remarkGfm]],
                                                className: "prose prose-sm prose-slate max-w-none text-slate-600",
                                                wrapperElement: {
                                                    "data-color-mode": "light",
                                                },
                                            }}
                                        />
                                    )}
                                />
                            </div>
                        </FormGroup>

                        {/* Gambar */}
                        <FormGroup label="Gambar">
                            <div className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center border border-blue-300 bg-white hover:bg-blue-50 text-blue-500 transition-colors">
                                <Plus className="h-8 w-8" />
                                <span className="text-xs mt-1">Upload</span>
                                <input type="file" className="hidden" accept="image/*" />
                            </div>
                        </FormGroup>

                        {/* Tipe (free / paid) */}
                        <FormGroup label="Tipe" error={errors.priceType?.message}>
                            <Select
                                value={priceType}
                                onValueChange={(val) =>
                                    setValue("priceType", val as "free" | "paid", {
                                        shouldValidate: true,
                                    })
                                }
                            >
                                <SelectTrigger className="bg-white w-full border-blue-200 focus:ring-blue-500">
                                    <SelectValue placeholder="Pilih Salah Satu" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="free">Gratis</SelectItem>
                                    <SelectItem value="paid">Berbayar</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormGroup>

                        {/* Harga — hanya muncul kalau paid */}
                        {priceType === "paid" && (
                            <FormGroup label="Harga" error={errors.price?.message}>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-slate-500">Rp</span>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        className="pl-10 bg-white border-blue-200 focus-visible:ring-blue-500"
                                        {...register("price", { valueAsNumber: true })}
                                    />
                                </div>
                            </FormGroup>
                        )}

                        {/* Platform */}
                        <FormGroup label="Platform" error={errors.platform?.message}>
                            <Select
                                defaultValue="zoom"
                                onValueChange={(val) =>
                                    setValue("platform", val, { shouldValidate: true })
                                }
                            >
                                <SelectTrigger className="bg-white w-full h-[52px] border-blue-200 focus:ring-blue-500">
                                    <SelectValue placeholder="Pilih Platform" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="zoom">Zoom</SelectItem>
                                    <SelectItem value="google-meet">Google Meet</SelectItem>
                                    <SelectItem value="other">Lainnya</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormGroup>

                        {/* Link */}
                        <FormGroup label="Link" error={errors.link?.message}>
                            <Input
                                placeholder="https://zoom.us/j/..."
                                className="bg-white border-blue-200 focus-visible:ring-blue-500"
                                {...register("link")}
                            />
                        </FormGroup>

                        {/* Catatan */}
                        <FormGroup label="Catatan" error={errors.notes?.message}>
                            <Textarea
                                placeholder="Masukkan catatan (opsional)"
                                className="min-h-[120px] bg-white border-blue-200 focus-visible:ring-blue-500"
                                {...register("notes")}
                            />
                        </FormGroup>

                        {/* Status */}
                        <FormGroup label="Status" error={errors.status?.message}>
                            <Select
                                defaultValue="published"
                                onValueChange={(val) =>
                                    setValue("status", val, { shouldValidate: true })
                                }
                            >
                                <SelectTrigger className="bg-white w-full h-[52px] border-blue-200 focus:ring-blue-500">
                                    <SelectValue placeholder="Pilih Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="published" className="text-amber-600 font-medium">
                                        Published
                                    </SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormGroup>
                    </div>
                </section>

                {/* ─── Jadwal ─── */}
                <section>
                    <SectionHeader title="Jadwal" />
                    <div className="space-y-5">
                        {/* Waktu Mulai */}
                        <FormGroup label="Waktu Mulai" error={errors.dateStart?.message}>
                            <DateTimePicker
                                date={dateStart}
                                setDate={(date) =>
                                    setValue("dateStart", date, { shouldValidate: true })
                                }
                                placeholder="Pilih Tanggal Mulai"
                            />
                        </FormGroup>

                        {/* Waktu Selesai */}
                        <FormGroup label="Waktu Selesai" error={errors.dateEnd?.message}>
                            <DateTimePicker
                                date={dateEnd}
                                setDate={(date) =>
                                    setValue("dateEnd", date, { shouldValidate: true })
                                }
                                placeholder="Pilih Tanggal Selesai"
                            />
                        </FormGroup>

                        {/* Waktu Deadline */}
                        <FormGroup label="Waktu Deadline" error={errors.dateDeadline?.message}>
                            <DateTimePicker
                                date={dateDeadline}
                                setDate={(date) =>
                                    setValue("dateDeadline", date, { shouldValidate: true })
                                }
                                placeholder="Pilih Tanggal Deadline"
                            />
                        </FormGroup>
                    </div>
                </section>

                {/* ─── Pendaftaran ─── */}
                <section>
                    <SectionHeader title="Pendaftaran" />
                    <div className="space-y-5">
                        {/* Kuota */}
                        <FormGroup label="Kuota" error={errors.quota?.message}>
                            <Input
                                type="number"
                                placeholder="0"
                                className="bg-white border-blue-200 focus-visible:ring-blue-500"
                                {...register("quota", { valueAsNumber: true })}
                            />
                        </FormGroup>
                    </div>
                </section>
            </div>

            <Button
                onClick={handleSubmit(onSubmit)}
                disabled={createWebinar.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-lg shadow-md shadow-blue-200"
            >
                {createWebinar.isPending ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Menyimpan...
                    </>
                ) : (
                    <>
                        Tambah <Plus className="ml-2 h-5 w-5" />
                    </>
                )}
            </Button>
        </div>
    );
}