"use client";

import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    CircleNotchIcon,
    EyeIcon,
    EyeSlashIcon,
    ImageIcon,
    PencilSimpleIcon,
    PlusIcon,
    TrashIcon,
} from "@phosphor-icons/react";

import { api } from "~/trpc/react";
import { createCreatorFormSchema, type CreateCreatorFormValues } from "~/lib/validation";
import { useImageUpload } from "~/hooks/shared/use-upload";
import {
    SectionHeader,
    FormInput,
    FormTextarea,
    FormRow,
} from "~/components/shared/form-layout";
import ButtonSave from "~/components/shared/button-save";
import ButtonCancel from "~/components/shared/button-cancel";
import { DetailHeader } from "~/components/shared/detail-header";
import { useImageDrop } from "~/hooks/shared/use-image-drop";
import { ImageCropperDialog } from "~/components/shared/image-cropper-dialog";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CreateCreatorPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const utils = api.useUtils();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<CreateCreatorFormValues>({
        resolver: zodResolver(createCreatorFormSchema),
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

    const [originalAvatarFile, setOriginalAvatarFile] = useState<File | null>(null);
    const [originalBannerFile, setOriginalBannerFile] = useState<File | null>(null);

    const [cropperOpen, setCropperOpen] = useState(false);
    const [cropperMode, setCropperMode] = useState<"avatar" | "banner" | null>(null);
    const [selectedImageSrc, setSelectedImageSrc] = useState("");
    const [fileName, setFileName] = useState("");

    const openCropperWithFile = useCallback((file: File, mode: "avatar" | "banner") => {
        if (mode === "avatar") {
            setOriginalAvatarFile(file);
        } else {
            setOriginalBannerFile(file);
        }
        const reader = new FileReader();
        reader.onload = () => {
            setSelectedImageSrc(reader.result as string);
            setFileName(file.name);
            setCropperMode(mode);
            setCropperOpen(true);
        };
        reader.readAsDataURL(file);
    }, []);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        openCropperWithFile(file, "avatar");
        e.target.value = "";
    };

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        openCropperWithFile(file, "banner");
        e.target.value = "";
    };

    const avatarDrop = useImageDrop(useCallback((file: File) => openCropperWithFile(file, "avatar"), [openCropperWithFile]));
    const bannerDrop = useImageDrop(useCallback((file: File) => openCropperWithFile(file, "banner"), [openCropperWithFile]));

    const createCreator = api.creators.create.useMutation({
        onSuccess: () => {
            void utils.creators.getAll.invalidate();
            toast.success("Kreator berhasil ditambahkan");
            router.push("/admin/kreator");
        },
        onError: (error) => {
            toast.error(`Gagal menambahkan kreator: ${error.message}`);
        },
    });

    const onSubmit = (data: CreateCreatorFormValues) => {
        createCreator.mutate({
            name: data.name,
            email: data.email,
            phoneNumber: data.phone,
            password: data.password,
            image: data.image,
            banner: data.banner,
            bio: data.bio,
        });
    };

    // ─── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="w-full max-w-7xl mx-auto">
            <div className="space-y-6">
                {/* Header */}
                <DetailHeader
                    backLink="/admin/kreator"
                    backLabel="Kembali ke Daftar Kreator"
                    title="Tambah Kreator Baru"
                />

                {/* Content */}
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* ─── Left Column: Edit Form ──── */}
                    <div className="flex-1 min-w-0 bg-white rounded-xl border border-slate-800 overflow-hidden w-full">
                        <div className="px-4 py-6 sm:px-8 sm:py-8">
                            <SectionHeader title="Informasi User" />

                            <div className="space-y-0 pt-6">
                                {/* Foto Profil */}
                                <FormRow label="Foto Profil">
                                    <div className="flex flex-col gap-3">
                                        <div
                                            className={`relative group shrink-0 w-24 h-24 sm:w-32 sm:h-32 cursor-pointer transition-transform ${avatarDrop.isDragging ? "scale-105" : ""}`}
                                            onClick={() => {
                                                if (avatarUpload.previewUrl) {
                                                    if (originalAvatarFile) {
                                                        const reader = new FileReader();
                                                        reader.onload = () => {
                                                            setSelectedImageSrc(reader.result as string);
                                                            setFileName(originalAvatarFile.name);
                                                            setCropperMode("avatar");
                                                            setCropperOpen(true);
                                                        };
                                                        reader.readAsDataURL(originalAvatarFile);
                                                    } else {
                                                        const originalUrl = avatarUpload.previewUrl.includes("/avatars/")
                                                            ? avatarUpload.previewUrl.replace("/avatars/", "/avatars/original-")
                                                            : avatarUpload.previewUrl;
                                                        setSelectedImageSrc(originalUrl);
                                                        setFileName("avatar.jpg");
                                                        setCropperMode("avatar");
                                                        setCropperOpen(true);
                                                    }
                                                } else {
                                                    fileInputRef.current?.click();
                                                }
                                            }}
                                            {...avatarDrop.dragHandlers}
                                        >
                                            <div className={`w-full h-full bg-white border-2 border-dashed rounded-full flex flex-col items-center justify-center overflow-hidden transition-colors relative ${avatarDrop.isDragging ? "border-cuan-cyan bg-cuan-cyan/10" : "border-slate-300 group-hover:border-cuan-cyan/100 group-hover:bg-cuan-cyan/10"}`}>
                                                {avatarUpload.previewUrl ? (
                                                    <>
                                                        <Image
                                                            src={avatarUpload.previewUrl}
                                                            alt="Foto Profil"
                                                            fill
                                                            className="object-cover transition-opacity group-hover:opacity-80"
                                                            unoptimized
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/15">
                                                            <div className="bg-white/90 px-2 py-1 rounded-full shadow-md text-xs font-semibold text-slate-800 flex items-center gap-1">
                                                                <PencilSimpleIcon size={14} weight="bold" />
                                                                <span>Atur Crop</span>
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
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        fileInputRef.current?.click();
                                                    }}
                                                    className="flex items-center gap-1 text-cuan-cyan hover:text-cuan-cyan/85 text-xs font-semibold transition-colors cursor-pointer"
                                                >
                                                    <PencilSimpleIcon size={14} weight="bold" />
                                                    <span>Ganti Foto</span>
                                                </button>
                                                <span className="text-slate-300 text-xs">|</span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        avatarUpload.setPreviewUrl(null);
                                                        setOriginalAvatarFile(null);
                                                        setValue("image", "", { shouldDirty: true });
                                                    }}
                                                    className="flex items-center gap-1 text-red-500 hover:text-red-700 text-xs font-semibold transition-colors cursor-pointer"
                                                >
                                                    <TrashIcon size={14} weight="bold" />
                                                    <span>Hapus Foto</span>
                                                </button>
                                            </div>
                                        )}
                                        <p className="text-[11px] text-slate-400 italic">Disarankan rasio 1:1 (square)</p>
                                    </div>
                                </FormRow>

                                {/* Banner */}
                                <FormRow label="Banner Profil">
                                    <div className="flex flex-col gap-3">
                                        <div
                                            className={`relative group w-full aspect-[4/1] md:max-h-[240px] max-h-[160px] cursor-pointer transition-transform ${bannerDrop.isDragging ? "scale-[1.02]" : ""}`}
                                            onClick={() => {
                                                if (bannerUpload.previewUrl) {
                                                    if (originalBannerFile) {
                                                        const reader = new FileReader();
                                                        reader.onload = () => {
                                                            setSelectedImageSrc(reader.result as string);
                                                            setFileName(originalBannerFile.name);
                                                            setCropperMode("banner");
                                                            setCropperOpen(true);
                                                        };
                                                        reader.readAsDataURL(originalBannerFile);
                                                    } else {
                                                        const originalUrl = bannerUpload.previewUrl.includes("/banners/")
                                                            ? bannerUpload.previewUrl.replace("/banners/", "/banners/original-")
                                                            : bannerUpload.previewUrl;
                                                        setSelectedImageSrc(originalUrl);
                                                        setFileName("banner.jpg");
                                                        setCropperMode("banner");
                                                        setCropperOpen(true);
                                                    }
                                                } else {
                                                    bannerInputRef.current?.click();
                                                }
                                            }}
                                            {...bannerDrop.dragHandlers}
                                        >
                                            <div className={`w-full h-full bg-white border-2 border-dashed rounded-xl flex flex-col items-center justify-center overflow-hidden transition-colors relative ${bannerDrop.isDragging ? "border-cuan-cyan bg-cuan-cyan/10" : "border-slate-300 group-hover:border-cuan-cyan/100 group-hover:bg-cuan-cyan/10"}`}>
                                                {bannerUpload.previewUrl ? (
                                                    <>
                                                        <Image
                                                            src={bannerUpload.previewUrl}
                                                            alt="Banner Preview"
                                                            fill
                                                            className="object-cover transition-opacity group-hover:opacity-80"
                                                            unoptimized
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/15">
                                                            <div className="bg-white/90 px-3 py-1.5 rounded-full shadow-md text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                                                                <PencilSimpleIcon size={14} weight="bold" />
                                                                <span>Atur Crop Banner</span>
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
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        bannerInputRef.current?.click();
                                                    }}
                                                    className="flex items-center gap-1 text-cuan-cyan hover:text-cuan-cyan/85 text-xs font-semibold transition-colors cursor-pointer"
                                                >
                                                    <PencilSimpleIcon size={14} weight="bold" />
                                                    <span>Ganti Banner</span>
                                                </button>
                                                <span className="text-slate-300 text-xs">|</span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        bannerUpload.setPreviewUrl(null);
                                                        setOriginalBannerFile(null);
                                                        setValue("banner", "", { shouldDirty: true });
                                                    }}
                                                    className="flex items-center gap-1 text-red-500 hover:text-red-700 text-xs font-semibold transition-colors cursor-pointer"
                                                >
                                                    <TrashIcon size={14} weight="bold" />
                                                    <span>Hapus Banner</span>
                                                </button>
                                            </div>
                                        )}
                                        <p className="text-[11px] text-slate-400 italic">Disarankan rasio 6:1 atau 8:1 (Tipis/Ceper)</p>
                                    </div>
                                </FormRow>

                                {/* Nama */}
                                <FormRow label="Nama" error={errors.name?.message}>
                                    <FormInput
                                        placeholder="Masukkan nama lengkap"
                                        {...register("name")}
                                    />
                                </FormRow>

                                {/* Email */}
                                <FormRow label="Email" error={errors.email?.message}>
                                    <FormInput
                                        type="email"
                                        placeholder="Masukkan email aktif"
                                        {...register("email")}
                                    />
                                </FormRow>

                                {/* Nomor HP */}
                                <FormRow label="Nomor HP" error={errors.phone?.message}>
                                    <FormInput
                                        placeholder="Masukkan nomor HP aktif"
                                        {...register("phone")}
                                    />
                                </FormRow>

                                {/* Bio */}
                                <FormRow label="Bio" error={errors.bio?.message}>
                                    <FormTextarea
                                        placeholder="Ceritakan sedikit tentang kreator ini..."
                                        {...register("bio")}
                                    />
                                </FormRow>
                            </div>

                            {/* ─── Keamanan ─── */}
                            <div className="pt-6">
                                <SectionHeader title="Keamanan" />
                                <div className="space-y-0 pt-6">
                                    <FormRow label="Password" error={errors.password?.message}>
                                        <FormInput
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Minimal 8 karakter"
                                            {...register("password")}
                                            suffix={
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="text-slate-400 hover:text-cuan-cyan transition-colors px-2"
                                                >
                                                    {showPassword ? <EyeSlashIcon size={20} /> : <EyeIcon size={20} />}
                                                </button>
                                            }
                                        />
                                    </FormRow>
                                </div>
                            </div>

                            {/* Footer Form */}
                            <div className="flex flex-col sm:flex-row justify-end sm:items-center mt-4 pt-4 border-t border-slate-200 gap-4 w-full">
                                <div className="w-full sm:w-auto flex justify-end gap-4">
                                    <ButtonCancel
                                        type="button"
                                        onClick={() => router.push("/admin/kreator")}
                                    />
                                    <ButtonSave
                                        onClick={handleSubmit(onSubmit)}
                                        isLoading={createCreator.isPending}
                                        disabled={avatarUpload.uploading || bannerUpload.uploading}
                                        label="Tambah Kreator"
                                        loadingLabel="Menambahkan..."
                                        icon={PlusIcon}
                                        weight="bold"
                                    />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            <ImageCropperDialog
                isOpen={cropperOpen}
                imageSrc={selectedImageSrc}
                fileName={fileName}
                onClose={() => {
                    setCropperOpen(false);
                    setCropperMode(null);
                }}
                onCrop={async (croppedFile) => {
                    if (cropperMode === "avatar") {
                        const url = await avatarUpload.handleFileUpload(croppedFile, originalAvatarFile as File);
                        if (url) {
                            setValue("image", url, { shouldValidate: true });
                        }
                    } else if (cropperMode === "banner") {
                        const url = await bannerUpload.handleFileUpload(croppedFile, originalBannerFile as File);
                        if (url) {
                            setValue("banner", url, { shouldValidate: true });
                        }
                    }
                }}
                cropShape={cropperMode === "avatar" ? "circle" : "rect"}
                cropWidth={cropperMode === "avatar" ? 300 : 640}
                cropHeight={cropperMode === "avatar" ? 300 : 160}
                outputWidth={cropperMode === "avatar" ? 400 : 1600}
                outputHeight={cropperMode === "avatar" ? 400 : 400}
            />
        </div>
    );
}
