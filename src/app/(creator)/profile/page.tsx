"use client";

import {
    CircleNotchIcon,
    EyeIcon,
    EyeSlashIcon,
    ImageIcon,
    PencilSimpleIcon,
    TrashIcon
} from "@phosphor-icons/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import ButtonSave from "~/components/shared/button-save";
import { DetailHeader } from "~/components/shared/detail-header";
import { CreatorProfileSkeleton } from "~/components/shared/detail-skeletons";
import { FormInput, FormRow, FormTextarea, SectionHeader } from "~/components/shared/form-layout";
import { useImageUpload } from "~/hooks/shared/use-upload";
import { useImageDrop } from "~/hooks/shared/use-image-drop";
import { api } from "~/trpc/react";
import { ImageCropperDialog } from "~/components/shared/image-cropper-dialog";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
    const utils = api.useUtils();
    const { data: user, isLoading } = api.profile.get.useQuery();

    const [errors, setErrors] = useState<Record<string, string[]>>({});

    const updateProfile = api.profile.update.useMutation({
        onSuccess: () => {
            toast.success("Profil berhasil diperbarui");
            setErrors({}); // Clear errors on success
            void utils.profile.get.invalidate();
            setPassword(""); // Clear password field after save
        },
        onError: (e) => {
            // Check if it's a zod error (validation error)
            if (e.data?.zodError) {
                setErrors(e.data.zodError.fieldErrors as Record<string, string[]>);
            } else if (e.message === "Link sudah dipakai orang lain, pilih link lain.") {
                setErrors({ slug: [e.message] });
                // Do not show toast for mapped field errors
            } else {
                toast.error(e.message || "Gagal memperbarui profil");
                setErrors({});
            }
        }
    });

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [bio, setBio] = useState("");
    const [slug, setSlug] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);
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

    const avatarDrop = useImageDrop(useCallback((file: File) => openCropperWithFile(file, "avatar"), [openCropperWithFile]));
    const bannerDrop = useImageDrop(useCallback((file: File) => openCropperWithFile(file, "banner"), [openCropperWithFile]));

    const isInitializedRef = useRef(false);

    useEffect(() => {
        if (user && !isInitializedRef.current) {
            setName(user.name ?? "");
            setEmail(user.email ?? "");
            setPhoneNumber(user.phoneNumber ?? "");
            setBio(user.bio ?? "");
            setSlug(user.catalog?.slug ?? "");
            if (user.image) {
                avatarUpload.setPreviewUrl(user.image);
            }
            if (user.banner) {
                bannerUpload.setPreviewUrl(user.banner);
            }
            isInitializedRef.current = true;
        }
    }, [user]);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setOriginalAvatarFile(file);

        const reader = new FileReader();
        reader.onload = () => {
            setSelectedImageSrc(reader.result as string);
            setFileName(file.name);
            setCropperMode("avatar");
            setCropperOpen(true);
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setOriginalBannerFile(file);

        const reader = new FileReader();
        reader.onload = () => {
            setSelectedImageSrc(reader.result as string);
            setFileName(file.name);
            setCropperMode("banner");
            setCropperOpen(true);
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    const clearError = (field: string) => {
        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const handleSave = () => {
        const newErrors: Record<string, string[]> = {};

        if (!name || name.trim().length < 2) {
            newErrors.name = ["Nama minimal 2 karakter"];
        }
        if (!phoneNumber || phoneNumber.trim().length < 10) {
            newErrors.phoneNumber = ["Nomor HP minimal 10 digit"];
        } else if (!/^(\+62|62|0)8[1-9][0-9]{6,9}$/.test(phoneNumber.trim())) {
            newErrors.phoneNumber = ["Format nomor HP tidak valid (contoh: 08123456789)"];
        }
        if (password && password.length < 8) {
            newErrors.password = ["Password minimal 8 karakter"];
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        updateProfile.mutate({
            name,
            phoneNumber,
            image: avatarUpload.previewUrl,
            banner: bannerUpload.previewUrl,
            bio,
            slug,
            password: password ? password : undefined,
        });
    };

    const isDirty =
        name !== (user?.name || "") ||
        phoneNumber !== (user?.phoneNumber || "") ||
        bio !== (user?.bio || "") ||
        slug !== (user?.catalog?.slug || "") ||
        password !== "" ||
        (avatarUpload.previewUrl || "") !== (user?.image || "") ||
        (bannerUpload.previewUrl || "") !== (user?.banner || "");

    useEffect(() => {
        const errorKeys = Object.keys(errors);
        let timerId: NodeJS.Timeout; // Letakkan penampung ID di sini

        if (errorKeys.length > 0) {
            const firstErrorKey = errorKeys[0];

            // Masukkan ke dalam variabel timerId
            timerId = setTimeout(() => {
                const el = document.getElementById(firstErrorKey || "");
                if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                    el.focus();
                }
            }, 100);
        }

        // TUKANG BERSIH-BERSIH: Batalkan timeout jika state error berubah atau komponen unmount
        return () => {
            if (timerId) clearTimeout(timerId);
        };
    }, [errors]);

    // ─── Loading Skeleton ──────────────────────────────────────────────────────

    if (isLoading) {
        return <CreatorProfileSkeleton />;
    }

    // ─── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="w-full max-w-7xl mx-auto">
            <div className="space-y-6">
                {/* Header */}
                <DetailHeader
                    backLink="/dashboard"
                    backLabel="Kembali ke Dashboard"
                    title="Akun Saya"
                    actions={
                        <ButtonSave
                            onClick={handleSave}
                            isLoading={updateProfile.isPending || avatarUpload.uploading || bannerUpload.uploading}
                            disabled={!isDirty}
                            label="Simpan Perubahan"
                            loadingLabel="Menyimpan..."
                            weight="bold"
                        />
                    }
                />

                {/* Content */}
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
                                                const originalUrl = avatarUpload.previewUrl.includes("/avatars/")
                                                    ? avatarUpload.previewUrl.replace("/avatars/", "/avatars/original-")
                                                    : avatarUpload.previewUrl;
                                                setSelectedImageSrc(originalUrl);
                                                setFileName("avatar.jpg");
                                                setCropperMode("avatar");
                                                setCropperOpen(true);
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
                                            onChange={onFileChange}
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

                            {/* Banner Profile */}
                            <FormRow label="Banner Profil">
                                <div className="flex flex-col gap-3">
                                    <div
                                        className={`relative group w-full aspect-[4/1] md:max-h-[240px] max-h-[160px] cursor-pointer transition-transform ${bannerDrop.isDragging ? "scale-[1.02]" : ""}`}
                                        onClick={() => {
                                            if (bannerUpload.previewUrl) {
                                                const originalUrl = bannerUpload.previewUrl.includes("/banners/")
                                                    ? bannerUpload.previewUrl.replace("/banners/", "/banners/original-")
                                                    : bannerUpload.previewUrl;
                                                setSelectedImageSrc(originalUrl);
                                                setFileName("banner.jpg");
                                                setCropperMode("banner");
                                                setCropperOpen(true);
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
                                            onChange={handleBannerFileChange}
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

                            <FormRow label="Nama" error={errors.name?.[0]}>
                                <FormInput
                                    id="name"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        clearError("name");
                                    }}
                                    placeholder="Masukkan nama lengkap"
                                />
                            </FormRow>

                            {/* Email */}
                            <FormRow label="Email">
                                <FormInput
                                    value={email}
                                    disabled
                                    className="bg-slate-100 text-slate-500 cursor-not-allowed border-slate-300"
                                />
                            </FormRow>

                            <FormRow label="Nomor Hp" error={errors.phoneNumber?.[0]}>
                                <FormInput
                                    id="phoneNumber"
                                    value={phoneNumber}
                                    onChange={(e) => {
                                        setPhoneNumber(e.target.value);
                                        clearError("phoneNumber");
                                    }}
                                    placeholder="Masukkan nomor HP aktif"
                                />
                            </FormRow>

                            <FormRow label="Bio" error={errors.bio?.[0]}>
                                <FormTextarea
                                    id="bio"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Ceritakan tentang tokomu"
                                />
                            </FormRow>

                            <FormRow label="Link Toko" error={errors.slug?.[0]}>
                                <FormInput
                                    id="slug"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    placeholder="Masukkan link toko unik"
                                    prefix="cuanin.my.id/"
                                />
                                {slug && (
                                    <a
                                        href={`/${slug}`}
                                        target="_blank"
                                        className="mt-1.5 inline-flex items-center gap-1 text-sm text-cuan-cyan hover:underline"
                                    >
                                        cuanin.my.id/{slug}
                                    </a>
                                )}
                                <p className="mt-1.5 text-xs text-gray-500">
                                    Link hanya bisa diganti maksimal 2 kali seminggu.
                                </p>
                            </FormRow>
                        </div>

                        {/* ─── Keamanan ─── */}
                        <div className="pt-6">
                            <SectionHeader title="Keamanan" />
                            <div className="space-y-0 pt-6">
                                <FormRow label="Password Baru (Opsional)" error={errors.password?.[0]}>
                                    <FormInput
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            clearError("password");
                                        }}
                                        placeholder="Kosongkan jika tidak ingin mengubah password"
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
                        let originalFile = originalAvatarFile;
                        if (!originalFile && avatarUpload.previewUrl?.includes("/avatars/")) {
                            const originalUrl = avatarUpload.previewUrl.replace("/avatars/", "/avatars/original-");
                            try {
                                const res = await fetch(originalUrl);
                                if (res.ok) {
                                    const blob = await res.blob();
                                    originalFile = new File([blob], fileName, { type: blob.type });
                                }
                            } catch (err) {
                                console.error("Failed to fetch original avatar image:", err);
                            }
                        }
                        await avatarUpload.handleFileUpload(croppedFile, originalFile as File);
                    } else if (cropperMode === "banner") {
                        let originalFile = originalBannerFile;
                        if (!originalFile && bannerUpload.previewUrl?.includes("/banners/")) {
                            const originalUrl = bannerUpload.previewUrl.replace("/banners/", "/banners/original-");
                            try {
                                const res = await fetch(originalUrl);
                                if (res.ok) {
                                    const blob = await res.blob();
                                    originalFile = new File([blob], fileName, { type: blob.type });
                                }
                            } catch (err) {
                                console.error("Failed to fetch original banner image:", err);
                            }
                        }
                        await bannerUpload.handleFileUpload(croppedFile, originalFile as File);
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
