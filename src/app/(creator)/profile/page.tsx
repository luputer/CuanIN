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
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import ButtonSave from "~/components/shared/button-save";
import { DetailHeader } from "~/components/shared/detail-header";
import { CreatorProfileSkeleton } from "~/components/shared/detail-skeletons";
import { FormInput, FormRow, FormTextarea, SectionHeader } from "~/components/shared/form-layout";
import { useImageUpload } from "~/hooks/shared/use-upload";
import { api } from "~/trpc/react";

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
            } else if (e.message === "Link sudah dipakai orang lain, pilih link lain." || 
                       e.message === "Anda hanya bisa mengubah link setiap 7 hari sekali.") {
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

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        await avatarUpload.handleFileUpload(e);
    };

    const handleSave = () => {
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
                                            onChange={onFileChange}
                                        />
                                    </div>
                                    {avatarUpload.previewUrl && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                avatarUpload.setPreviewUrl(null);
                                            }}
                                            className="flex items-center gap-1.5 text-red-500 hover:text-red-700 text-xs font-semibold transition-colors w-fit cursor-pointer"
                                        >
                                            <TrashIcon size={14} weight="bold" />
                                            <span>Hapus Foto</span>
                                        </button>
                                    )}
                                    <p className="text-[11px] text-slate-400 italic">Disarankan rasio 1:1 (square)</p>
                                </div>
                            </FormRow>

                            {/* Banner Profile */}
                            <FormRow label="Banner Profil">
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
                                            onChange={(e) => bannerUpload.handleFileUpload(e)}
                                        />
                                    </div>
                                    {bannerUpload.previewUrl && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                bannerUpload.setPreviewUrl(null);
                                            }}
                                            className="flex items-center gap-1.5 text-red-500 hover:text-red-700 text-xs font-semibold transition-colors w-fit cursor-pointer"
                                        >
                                            <TrashIcon size={14} weight="bold" />
                                            <span>Hapus Banner</span>
                                        </button>
                                    )}
                                    <p className="text-[11px] text-slate-400 italic">Disarankan rasio 6:1 atau 8:1 (Tipis/Ceper)</p>
                                </div>
                            </FormRow>

                            {/* Nama */}
                            <FormRow label="Nama" error={errors.name?.[0]}>
                                <FormInput
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
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

                            {/* Nomor Hp */}
                            <FormRow label="Nomor Hp" error={errors.phoneNumber?.[0]}>
                                <FormInput
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="Masukkan nomor HP aktif"
                                />
                            </FormRow>

                            {/* Bio */}
                            <FormRow label="Bio" error={errors.bio?.[0]}>
                                <FormTextarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Ceritakan tentang tokomu"
                                />
                            </FormRow>

                            {/* Link */}
                            <FormRow label="Link Toko" error={errors.slug?.[0]}>
                                <FormInput
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    placeholder="Masukkan link toko unik"
                                    prefix="cuanin.id/"
                                />
                            </FormRow>
                        </div>

                        {/* ─── Keamanan ─── */}
                        <div className="pt-6">
                            <SectionHeader title="Keamanan" />
                            <div className="space-y-0 pt-6">
                                <FormRow label="Password Baru (Opsional)" error={errors.password?.[0]}>
                                    <FormInput
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Biarkan kosong jika tidak ingin mengubah password"
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
                                </FormRow>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
