"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    ArrowLeftIcon,
    CircleNotchIcon,
    PencilSimpleIcon,
    EyeIcon,
    EyeSlashIcon,
    ImageIcon,
    TrashIcon,
    FloppyDiskIcon
} from "@phosphor-icons/react";

import { api } from "~/trpc/react";
import { creatorSchema, type CreatorFormValues } from "~/lib/validation";
import { useImageUpload } from "~/hooks/use-upload";
import {
    FormGroup,
    FormInput,
    FormTextarea,
    SectionHeader,
} from "~/components/ui/form-layout";
import { Skeleton } from "~/components/ui/skeleton";
import ButtonSave from "~/components/ui/button-save";
import ButtonCancel from "~/components/ui/button-cancel";

export default function EditCreatorPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const utils = api.useUtils();
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
        formState: { errors },
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
            // Hanya set preview jika belum ada atau berubah dari data asli
            if (creator.image) avatarUpload.setPreviewUrl(creator.image);
            if (creator.banner) bannerUpload.setPreviewUrl(creator.banner);
        }
    }, [creator, reset]);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = await avatarUpload.handleFileUpload(e);
        if (url) {
            setValue("image", url, { shouldValidate: true });
        }
    };

    const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = await bannerUpload.handleFileUpload(e);
        if (url) {
            setValue("banner", url, { shouldValidate: true });
        }
    };

    const updateCreator = api.creators.update.useMutation({
        onSuccess: () => {
            void utils.creators.getById.invalidate({ id });
            toast.success("Data kreator berhasil diperbarui");
            router.push(`/admin/kreator/${id}`);
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

    if (isFetching) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-[600px] w-full rounded-xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-slate-50">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sticky top-[74px] bg-slate-50 z-40 -mx-4 px-4 pt-2">
                    <div className="flex-1 flex flex-col gap-1">
                        <Link
                            href={`/admin/kreator/${id}`}
                            className="group flex items-center gap-2 text-sm font-regular text-slate-600 hover:text-slate-800 transition-colors w-fit mb-2"
                        >
                            <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                            <span className="leading-none">Kembali ke Detail Kreator</span>
                        </Link>
                        <h1 className="text-xl font-semibold text-slate-800">Edit Data Kreator</h1>
                    </div>
                </div>
            </div>

            <div className="bg-cyan-50 rounded-xl border border-slate-800 overflow-hidden shadow-[0px_2px_0px_rgba(29,41,61)]">
                {/* Sub-header: nama kreator yang sedang diedit */}
                <div className="bg-cyan-50 px-4 sm:px-10 py-6 border-b border-slate-800">
                    <h2 className="text-lg font-semibold text-cyan-900">{creator?.name}</h2>
                </div>

                <div className="px-4 sm:px-10 py-6 sm:py-8">

                    {/* ─── Informasi User ─── */}
                    <SectionHeader title="Informasi User" />

                    <div className="mt-4">
                        {/* Foto Profil */}
                        <FormGroup label="Foto Profil" align="start">
                            <div className="flex flex-col gap-3">
                                <div
                                    className="relative group shrink-0 w-24 h-24 sm:w-32 sm:h-32 cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="w-full h-full bg-white border-2 border-dashed border-slate-400 rounded-full flex flex-col items-center justify-center overflow-hidden transition-colors group-hover:border-cyan-600 group-hover:bg-slate-50 relative">
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
                                                        <PencilSimpleIcon size={20} weight="bold" />
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-1 text-slate-400">
                                                <ImageIcon size={24} weight="light" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">Upload</span>
                                            </div>
                                        )}
                                        {avatarUpload.uploading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
                                                <CircleNotchIcon size={24} weight="bold" className="animate-spin text-white" />
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
                                            setValue("image", "");
                                        }}
                                        className="flex items-center gap-2 text-red-500 hover:text-red-700 text-xs font-bold transition-colors w-fit cursor-pointer"
                                    >
                                        <TrashIcon size={16} weight="bold" />
                                        <span>Hapus Foto</span>
                                    </button>
                                )}
                                <p className="text-[11px] text-slate-500 italic">Disarankan rasio 1:1 (square)</p>
                            </div>
                        </FormGroup>

                        {/* Banner Profile */}
                        <FormGroup label="Banner Profile" align="start">
                            <div className="flex flex-col gap-3">
                                <div
                                    className="relative group w-full aspect-[6/1] md:aspect-[8/1] cursor-pointer"
                                    onClick={() => bannerInputRef.current?.click()}
                                >
                                    <div className="w-full h-full bg-white border-2 border-dashed border-slate-400 rounded-xl flex flex-col items-center justify-center overflow-hidden transition-colors group-hover:border-cyan-600 group-hover:bg-slate-50 relative">
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
                                                        <PencilSimpleIcon size={20} weight="bold" />
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-slate-400">
                                                <ImageIcon size={28} weight="light" />
                                                <span className="text-xs font-bold uppercase tracking-wider">Upload Banner</span>
                                            </div>
                                        )}
                                        {bannerUpload.uploading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
                                                <CircleNotchIcon size={24} weight="bold" className="animate-spin text-white" />
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
                                            setValue("banner", "");
                                        }}
                                        className="flex items-center gap-2 text-red-500 hover:text-red-700 text-xs font-bold transition-colors w-fit cursor-pointer"
                                    >
                                        <TrashIcon size={16} weight="bold" />
                                        <span>Hapus Banner</span>
                                    </button>
                                )}
                                <p className="text-[11px] text-slate-500 italic">Disarankan rasio 6:1 atau 8:1 (Tipis/Ceper)</p>
                            </div>
                        </FormGroup>

                        {/* Nama */}
                        <FormGroup label="Nama" error={errors.name?.message}>
                            <FormInput
                                placeholder="Masukkan nama lengkap"
                                {...register("name")}
                            />
                        </FormGroup>

                        {/* Email */}
                        <FormGroup label="Email" error={errors.email?.message}>
                            <FormInput
                                type="email"
                                placeholder="Masukkan email aktif"
                                {...register("email")}
                            />
                        </FormGroup>

                        {/* Nomor Hp */}
                        <FormGroup label="Nomor Hp" error={errors.phone?.message}>
                            <FormInput
                                placeholder="Masukkan nomor HP aktif"
                                {...register("phone")}
                            />
                        </FormGroup>

                        {/* Bio */}
                        <FormGroup label="Bio" align="start" error={errors.bio?.message}>
                            <FormTextarea
                                placeholder="Ceritakan sedikit tentang kreator ini..."
                                {...register("bio")}
                            />
                        </FormGroup>
                    </div>

                    {/* ─── Keamanan ─── */}
                    <section className="mt-6">
                        <SectionHeader title="Keamanan" />
                        <div className="mt-4">
                            {/* Password */}
                            <FormGroup label="Password Baru (Opsional)" error={errors.password?.message}>
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
                            </FormGroup>
                        </div>
                    </section>
                </div>

                {/* Footer Actions */}
                <div className="px-4 sm:px-10 pb-8 flex justify-end gap-4">
                    <ButtonCancel
                        type="button"
                        onClick={() => router.push(`/admin/kreator/${id}`)}
                    />
                    <ButtonSave
                        label="Simpan Perubahan"
                        icon={FloppyDiskIcon}
                        onClick={handleSubmit(onSubmit)}
                        isLoading={updateCreator.isPending}
                        disabled={avatarUpload.uploading || bannerUpload.uploading}
                        weight="bold"
                    />
                </div>
            </div>
        </div>
    );
}
