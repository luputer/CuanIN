"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    ArrowLeftIcon,
    PencilSimpleIcon,
    TrashIcon,
    PlusIcon,
    CircleNotchIcon
} from "@phosphor-icons/react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useImageUpload } from "~/hooks/use-upload";
import {
    FormGroup,
    FormInput,
    FormTextarea,
    SectionHeader
} from "~/components/ui/form-layout";
import ButtonSave from "~/components/ui/button-save";
import { Skeleton } from "~/components/ui/skeleton";

export default function ProfilePage() {
    const utils = api.useUtils();
    const { data: user, isLoading } = api.profile.get.useQuery();

    const updateProfile = api.profile.update.useMutation({
        onSuccess: () => {
            toast.success("Profil berhasil diperbarui");
            void utils.profile.get.invalidate();
            setPassword(""); // Clear password field after save
        },
        onError: (e) => {
            toast.error(e.message || "Gagal memperbarui profil");
        }
    });

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [bio, setBio] = useState("");

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
            password: password ? password : undefined,
        });
    };

    const isDirty = 
        name !== (user?.name || "") ||
        phoneNumber !== (user?.phoneNumber || "") ||
        bio !== (user?.bio || "") ||
        password !== "" ||
        (avatarUpload.previewUrl || "") !== (user?.image || "") ||
        (bannerUpload.previewUrl || "") !== (user?.banner || "");

    if (isLoading) {
        return (
            <div className="w-full max-w-7xl mx-auto space-y-6">
                {/* Header Skeleton */}
                <div className="bg-slate-50">
                    <div className="sticky top-[74px] bg-slate-50 z-40 -mx-4 px-4 mb-2">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-8 w-48" />
                    </div>
                </div>

                <div className="bg-cyan-50 rounded-xl border border-slate-800 overflow-hidden">
                    <div className="px-4 sm:px-10 py-6 sm:py-8">
                        <div className="flex items-center justify-between border-b border-cyan-600 pb-2 mb-6">
                            <Skeleton className="h-6 w-48" />
                        </div>

                        <div className="mt-4">
                            {/* Foto Profil Skeleton */}
                            <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-start py-2">
                                <Skeleton className="h-4 w-full md:w-[140px] shrink-0" />
                                <Skeleton className="h-24 w-24 sm:w-32 sm:h-32 rounded-full shrink-0" />
                            </div>

                            {/* Banner Profile Skeleton */}
                            <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-start py-2">
                                <Skeleton className="h-4 w-full md:w-[140px] shrink-0" />
                                <Skeleton className="w-full aspect-[6/1] md:aspect-[8/1] rounded-xl" />
                            </div>

                            {/* Input Skeletons */}
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex flex-col md:flex-row gap-2 md:gap-4 items-start md:items-center py-2">
                                    <Skeleton className="h-4 w-full md:w-[140px] shrink-0" />
                                    <Skeleton className="flex-1 h-[52px] w-full rounded-lg" />
                                </div>
                            ))}

                            {/* Bio Skeleton */}
                            <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-start py-2">
                                <Skeleton className="h-4 w-full md:w-[140px] shrink-0" />
                                <Skeleton className="flex-1 min-h-[100px] w-full rounded-lg" />
                            </div>
                        </div>

                        <div className="mt-8">
                            <div className="flex items-center justify-between border-b border-cyan-600 pb-2 mb-6">
                                <Skeleton className="h-6 w-32" />
                            </div>
                            <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-start md:items-center py-2">
                                <Skeleton className="h-4 w-full md:w-[140px] shrink-0" />
                                <Skeleton className="flex-1 h-[52px] w-full rounded-lg" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-slate-50">
                <div className="sticky top-[74px] bg-slate-50 z-40 -mx-4 px-4 mb-2">
                    <Link
                        href="/dashboard"
                        className="group flex items-center gap-2 text-sm font-regular text-slate-600 hover:text-slate-800 transition-colors w-fit mb-2"
                    >
                        <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                        <span className="leading-none">Kembali ke Dashboard</span>
                    </Link>
                    <h1 className="text-2xl font-semibold text-slate-800">Akun Saya</h1>
                </div>
            </div>

            <div className="bg-cyan-50 rounded-xl border border-slate-800 overflow-hidden">
                <div className="px-4 sm:px-10 py-6 sm:py-8">

                    {/* ── Section 1: Informasi User ── */}
                    <SectionHeader title="Informasi User" />

                    <div className="mt-4">
                        {/* Foto Profil */}
                        <FormGroup label="Foto Profil" align="start" className="py-1.5 md:py-2 gap-2 md:gap-4" labelWidth="md:w-[140px]">
                            <div className="flex flex-col gap-3">
                                <div
                                    className="relative group shrink-0 w-24 h-24 sm:w-32 sm:h-32 cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="w-full h-full bg-white border-2 border-dashed border-slate-300 rounded-full flex flex-col items-center justify-center overflow-hidden transition-colors group-hover:border-cyan-500 group-hover:bg-cyan-50 relative">
                                        {avatarUpload.uploading ? (
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                                                <CircleNotchIcon className="animate-spin text-cyan-600" size={24} />
                                            </div>
                                        ) : avatarUpload.previewUrl ? (
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
                                                <PlusIcon size={24} weight="bold" />
                                                <span className="text-[10px] font-medium">Tambah</span>
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
                                        className="flex items-center gap-2 text-red-500 hover:text-red-700 text-xs font-medium transition-colors w-fit cursor-pointer"
                                    >
                                        <TrashIcon size={16} weight="bold" />
                                        <span>Hapus Foto</span>
                                    </button>
                                )}
                                <p className="text-xs text-slate-500 italic">Disarankan rasio 1:1 (square)</p>
                            </div>
                        </FormGroup>

                        {/* Banner Profile */}
                        <FormGroup label="Banner Profile" align="start" className="py-1.5 md:py-2 gap-2 md:gap-4" labelWidth="md:w-[140px]">
                            <div className="flex flex-col gap-3">
                                <div
                                    className="relative group w-full aspect-[6/1] md:aspect-[8/1] cursor-pointer"
                                    onClick={() => bannerInputRef.current?.click()}
                                >
                                    <div className="w-full h-full bg-white border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center overflow-hidden transition-colors group-hover:border-cyan-500 group-hover:bg-cyan-50 relative">
                                        {bannerUpload.uploading ? (
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                                                <CircleNotchIcon className="animate-spin text-cyan-600" size={24} />
                                            </div>
                                        ) : bannerUpload.previewUrl ? (
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
                                            <div className="flex flex-col items-center gap-1 text-slate-400">
                                                <PlusIcon size={24} weight="bold" />
                                                <span className="text-[10px] font-medium">Tambah</span>
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
                                        className="flex items-center gap-2 text-red-500 hover:text-red-700 text-xs font-medium transition-colors w-fit cursor-pointer"
                                    >
                                        <TrashIcon size={16} weight="bold" />
                                        <span>Hapus Banner</span>
                                    </button>
                                )}
                                <p className="text-xs text-slate-500 italic">Disarankan rasio 6:1 atau 8:1 (Tipis/Ceper)</p>
                            </div>
                        </FormGroup>

                        {/* Nama */}
                        <FormGroup label="Nama" className="py-1.5 md:py-2 gap-2 md:gap-4" labelWidth="md:w-[140px]">
                            <FormInput
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Masukkan nama lengkap"
                            />
                        </FormGroup>

                        {/* Email */}
                        <FormGroup label="Email" className="py-1.5 md:py-2 gap-2 md:gap-4" labelWidth="md:w-[140px]">
                            <FormInput
                                value={email}
                                disabled
                                className="bg-slate-100 text-slate-500 cursor-not-allowed border-slate-300"
                            />
                        </FormGroup>

                        {/* Nomor Hp */}
                        <FormGroup label="Nomor Hp" className="py-1.5 md:py-2 gap-2 md:gap-4" labelWidth="md:w-[140px]">
                            <FormInput
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="Masukkan nomor HP aktif"
                            />
                        </FormGroup>

                        {/* Bio */}
                        <FormGroup label="Bio" align="start" className="py-1.5 md:py-2 gap-2 md:gap-4" labelWidth="md:w-[140px]">
                            <FormTextarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Ceritakan tentang tokomu"
                            />
                        </FormGroup>
                    </div>

                    {/* ── Section 2: Keamanan ── */}
                    <div className="mt-8">
                        <SectionHeader title="Keamanan" />
                        <div className="mt-4">
                            {/* Password */}
                            <FormGroup label="Password Baru" className="py-1.5 md:py-2 gap-2 md:gap-4" labelWidth="md:w-[140px]">
                                <FormInput
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Biarkan kosong jika tidak ingin mengubah password"
                                />
                            </FormGroup>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col sm:flex-row justify-end sm:items-center mt-4 pt-4 border-t border-slate-200 gap-4 w-full">
                        <div className="w-full sm:w-auto">
                            <ButtonSave
                                onClick={handleSave}
                                isLoading={updateProfile.isPending || avatarUpload.uploading || bannerUpload.uploading}
                                disabled={!isDirty}
                                label="Simpan Perubahan"
                                loadingLabel="Menyimpan..."
                                weight="bold"
                            />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
