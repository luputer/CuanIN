"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
    ArrowLeftIcon,
    BasketIcon,
    CircleNotchIcon,
    EyeIcon,
    EyeSlashIcon,
    FloppyDiskIcon,
    ImageIcon,
    PencilSimpleIcon,
    TrashIcon,
    UsersIcon,
    WalletIcon,
} from "@phosphor-icons/react";

import { api } from "~/trpc/react";
import { creatorSchema, type CreatorFormValues } from "~/lib/validation";
import { useImageUpload } from "~/hooks/use-upload";
import {
    SectionHeader,
    FormInput,
    FormTextarea,
} from "~/components/ui/form-layout";
import { Skeleton } from "~/components/ui/skeleton";
import ButtonSave from "~/components/ui/button-save";

// ─── Local Components ────────────────────────────────────────────────────────

const Label = ({ children }: { children: React.ReactNode }) => (
    <div className="w-full text-slate-500 text-sm font-medium leading-6 mb-1">{children}</div>
);

const Row = ({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) => (
    <div className="flex flex-col items-start pb-5 gap-0.5 w-full">
        <Label>{label}</Label>
        <div className="flex-1 w-full text-slate-800 text-sm font-medium leading-6">
            {children}
            {error && <span className="text-red-500 text-xs mt-1 block">{error}</span>}
        </div>
    </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CreatorDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const utils = api.useUtils();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const [showPassword, setShowPassword] = useState(false);

    const { data: creator, isLoading: isFetching } = api.creators.getById.useQuery(
        { id },
        { enabled: !!id }
    );

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors, isDirty },
    } = useForm<CreatorFormValues>({
        resolver: zodResolver(creatorSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            password: "",
            image: "",
            banner: "",
            bio: "",
        },
    });

    const avatarUpload = useImageUpload("avatars");
    const bannerUpload = useImageUpload("banners");

    useEffect(() => {
        if (creator) {
            reset({
                name: creator.name ?? "",
                email: creator.email ?? "",
                phone: creator.phoneNumber ?? "",
                password: "",
                image: creator.image ?? "",
                banner: creator.banner ?? "",
                bio: creator.bio ?? "",
            });
            if (creator.image) avatarUpload.setPreviewUrl(creator.image);
            if (creator.banner) bannerUpload.setPreviewUrl(creator.banner);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [creator]);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = await avatarUpload.handleFileUpload(e);
        if (url) setValue("image", url, { shouldValidate: true });
    };

    const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = await bannerUpload.handleFileUpload(e);
        if (url) setValue("banner", url, { shouldValidate: true });
    };

    const updateCreator = api.creators.update.useMutation({
        onSuccess: () => {
            void utils.creators.getById.invalidate({ id });
            toast.success("Data kreator berhasil diperbarui");
        },
        onError: (error) => {
            toast.error(`Gagal memperbarui data: ${error.message}`);
        },
    });

    const onSubmit = (data: CreatorFormValues) => {
        updateCreator.mutate({
            id,
            name: data.name,
            email: data.email,
            phoneNumber: data.phone,
            password: data.password || undefined,
            image: data.image,
            banner: data.banner,
            bio: data.bio,
        });
    };

    // ─── Loading Skeleton ──────────────────────────────────────────────────────

    if (isFetching) {
        return (
            <div className="w-full max-w-7xl mx-auto animate-pulse">
                <div className="space-y-6">
                    {/* Header Skeleton */}
                    <div className="bg-slate-50">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:sticky sm:top-[74px] bg-slate-50 z-40 -mx-6 px-6 pt-2 pb-0">
                            <div className="flex-1 flex flex-col gap-1.5">
                                <div className="flex items-center gap-2 mb-2">
                                    <Skeleton className="h-4 w-4" />
                                    <Skeleton className="h-4 w-36" />
                                </div>
                                <Skeleton className="h-7 w-56 rounded-md" />
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                                <Skeleton className="h-10 w-36 rounded-lg" />
                                <Skeleton className="h-10 w-40 rounded-lg" />
                            </div>
                        </div>
                    </div>

                    {/* Content Skeleton */}
                    <div className="flex flex-col lg:flex-row gap-6 items-start">
                        <div className="flex-1 rounded-xl border border-slate-800 overflow-hidden bg-white">
                            <div className="px-4 py-6 sm:px-8 sm:py-8">
                                <Skeleton className="h-6 w-40 mb-8" />
                                <div className="space-y-5">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="flex flex-col gap-1.5">
                                            <Skeleton className="h-4 w-28" />
                                            <Skeleton className="h-[46px] w-full rounded-lg" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-80 space-y-4">
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-800 space-y-4">
                                <Skeleton className="h-5 w-24" />
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-[76px] w-full rounded-2xl" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!creator) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <p className="text-slate-500">Kreator tidak ditemukan</p>
                <Link href="/admin/kreator" className="text-cyan-600 font-bold mt-2 hover:underline">
                    Kembali ke Daftar
                </Link>
            </div>
        );
    }

    // ─── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="w-full max-w-7xl mx-auto">
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-slate-50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:sticky sm:top-[74px] bg-slate-50 z-40 -mx-6 px-6 pt-2 pb-0">
                        <div className="flex-1 flex flex-col gap-1">
                            <Link
                                href="/admin/kreator"
                                className="group flex items-center gap-2 text-sm font-regular text-slate-600 hover:text-slate-800 transition-colors w-fit mb-2"
                            >
                                <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                                <span className="leading-none">Kembali ke Daftar Kreator</span>
                            </Link>
                            <h1 className="text-xl font-medium text-slate-800">Detail Akun Kreator</h1>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                            <button
                                onClick={() => router.push(`/admin/kreator/${id}/produk`)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-cyan-600 hover:bg-cyan-50 hover:shadow-sm h-10 px-4 rounded-lg transition-all cursor-pointer"
                            >
                                <span className="text-sm font-medium text-cyan-600 whitespace-nowrap">
                                    Lihat Produk Kreator
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* ─── Left Column: Edit Form ──── */}
                    <div className="flex-1 min-w-0 bg-white rounded-xl border border-slate-800 overflow-hidden w-full">
                        <div className="px-4 py-6 sm:px-8 sm:py-8">
                            <SectionHeader title="Informasi User" />

                            <div className="space-y-0 pt-6">
                                {/* Foto Profil */}
                                <Row label="Foto Profil">
                                    <div className="flex flex-col gap-3">
                                        <div
                                            className="relative group shrink-0 w-24 h-24 sm:w-32 sm:h-32 cursor-pointer"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <div className="w-full h-full bg-white border-2 border-dashed border-slate-300 rounded-full flex flex-col items-center justify-center overflow-hidden transition-colors group-hover:border-cyan-500 group-hover:bg-cyan-50 relative">
                                                {avatarUpload.previewUrl ? (
                                                    <>
                                                        <Image
                                                            src={avatarUpload.previewUrl}
                                                            alt="Foto Profil"
                                                            fill
                                                            className="object-cover transition-opacity group-hover:opacity-80"
                                                            unoptimized
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                                                            <div className="bg-white/90 p-1.5 rounded-full shadow-md text-slate-800">
                                                                <PencilSimpleIcon size={18} weight="bold" />
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-1 text-slate-400">
                                                        <ImageIcon size={22} weight="light" />
                                                        <span className="text-[10px] font-bold uppercase tracking-wider">Upload</span>
                                                    </div>
                                                )}
                                                {avatarUpload.uploading && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
                                                        <CircleNotchIcon size={22} weight="bold" className="animate-spin text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleAvatarChange}
                                            />
                                        </div>
                                        {avatarUpload.previewUrl && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    avatarUpload.setPreviewUrl(null);
                                                    setValue("image", "", { shouldDirty: true });
                                                }}
                                                className="flex items-center gap-1.5 text-red-500 hover:text-red-700 text-xs font-semibold transition-colors w-fit cursor-pointer"
                                            >
                                                <TrashIcon size={14} weight="bold" />
                                                <span>Hapus Foto</span>
                                            </button>
                                        )}
                                        <p className="text-[11px] text-slate-400 italic">Disarankan rasio 1:1 (square)</p>
                                    </div>
                                </Row>

                                {/* Banner */}
                                <Row label="Banner Profil">
                                    <div className="flex flex-col gap-3">
                                        <div
                                            className="relative group w-full aspect-[6/1] md:aspect-[8/1] cursor-pointer"
                                            onClick={() => bannerInputRef.current?.click()}
                                        >
                                            <div className="w-full h-full bg-white border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center overflow-hidden transition-colors group-hover:border-cyan-500 group-hover:bg-cyan-50 relative">
                                                {bannerUpload.previewUrl ? (
                                                    <>
                                                        <Image
                                                            src={bannerUpload.previewUrl}
                                                            alt="Banner Preview"
                                                            fill
                                                            className="object-cover transition-opacity group-hover:opacity-80"
                                                            unoptimized
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                                                            <div className="bg-white/90 p-1.5 rounded-full shadow-md text-slate-800">
                                                                <PencilSimpleIcon size={18} weight="bold" />
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2 text-slate-400">
                                                        <ImageIcon size={26} weight="light" />
                                                        <span className="text-xs font-bold uppercase tracking-wider">Upload Banner</span>
                                                    </div>
                                                )}
                                                {bannerUpload.uploading && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
                                                        <CircleNotchIcon size={22} weight="bold" className="animate-spin text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                ref={bannerInputRef}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleBannerChange}
                                            />
                                        </div>
                                        {bannerUpload.previewUrl && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    bannerUpload.setPreviewUrl(null);
                                                    setValue("banner", "", { shouldDirty: true });
                                                }}
                                                className="flex items-center gap-1.5 text-red-500 hover:text-red-700 text-xs font-semibold transition-colors w-fit cursor-pointer"
                                            >
                                                <TrashIcon size={14} weight="bold" />
                                                <span>Hapus Banner</span>
                                            </button>
                                        )}
                                        <p className="text-[11px] text-slate-400 italic">Disarankan rasio 6:1 atau 8:1 (Tipis/Ceper)</p>
                                    </div>
                                </Row>

                                {/* Nama */}
                                <Row label="Nama" error={errors.name?.message}>
                                    <FormInput
                                        placeholder="Masukkan nama lengkap"
                                        {...register("name")}
                                    />
                                </Row>

                                {/* Email */}
                                <Row label="Email" error={errors.email?.message}>
                                    <FormInput
                                        type="email"
                                        placeholder="Masukkan email aktif"
                                        {...register("email")}
                                    />
                                </Row>

                                {/* Nomor HP */}
                                <Row label="Nomor HP" error={errors.phone?.message}>
                                    <FormInput
                                        placeholder="Masukkan nomor HP aktif"
                                        {...register("phone")}
                                    />
                                </Row>

                                {/* Bio */}
                                <Row label="Bio" error={errors.bio?.message}>
                                    <FormTextarea
                                        placeholder="Ceritakan sedikit tentang kreator ini..."
                                        {...register("bio")}
                                    />
                                </Row>
                            </div>

                            {/* ─── Keamanan ─── */}
                            <div className="pt-6">
                                <SectionHeader title="Keamanan" />
                                <div className="space-y-0 pt-6">
                                    <Row label="Password Baru (Opsional)" error={errors.password?.message}>
                                        <FormInput
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Kosongkan jika tidak ingin mengubah password"
                                            {...register("password")}
                                            suffix={
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="text-slate-400 hover:text-cyan-600 transition-colors px-2"
                                                >
                                                    {showPassword ? <EyeSlashIcon size={20} /> : <EyeIcon size={20} />}
                                                </button>
                                            }
                                        />
                                    </Row>
                                </div>
                            </div>

                            {/* Footer Form */}
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center mt-4 pt-4 border-t border-slate-200 gap-4 w-full">
                                <p className="text-slate-500 text-sm text-left w-full sm:w-auto">
                                    Bergabung pada {format(new Date(creator.createdAt), "d MMMM yyyy, HH:mm", { locale: idLocale })}
                                </p>
                                <div className="w-full sm:w-auto flex justify-end">
                                    <ButtonSave
                                        onClick={handleSubmit(onSubmit)}
                                        isLoading={updateCreator.isPending}
                                        disabled={avatarUpload.uploading || bannerUpload.uploading || !isDirty}
                                        label="Simpan Perubahan"
                                        loadingLabel="Menyimpan..."
                                        weight="bold"
                                    />
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* ─── Right Column: Sidebar Performa ──── */}
                    <div className="w-full lg:w-80 flex flex-col gap-2">
                        <div className="bg-slate-50 rounded-xl border border-slate-800 overflow-hidden p-6 space-y-4">
                            <div className="text-cyan-600 text-md font-semibold mb-4">Performa</div>

                            <div className="space-y-2">
                                {/* Total Produk */}
                                <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-500 shrink-0">
                                        <BasketIcon size={24} weight="fill" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-slate-600 tracking-wider truncate">Total Produk</p>
                                        <h3 className="text-lg font-medium text-slate-800">{creator.metrics.totalProducts || 0}</h3>
                                    </div>
                                </div>

                                {/* Total Pembeli */}
                                <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 shrink-0">
                                        <UsersIcon size={24} weight="fill" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-slate-600 tracking-wider truncate">Total Pembeli</p>
                                        <h3 className="text-lg font-medium text-slate-800 truncate">{creator.metrics.totalUsers || 0}</h3>
                                    </div>
                                </div>

                                {/* Total Pendapatan */}
                                <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-500 shrink-0">
                                        <WalletIcon size={24} weight="fill" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-slate-600 tracking-wider truncate">Total Pendapatan</p>
                                        <h3 className="text-lg font-medium text-slate-800 truncate">
                                            Rp {(creator.metrics.totalEarnings || 0).toLocaleString("id-ID")}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
