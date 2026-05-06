"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    SpinnerIcon,
    ArrowLeftIcon,
    PencilSimpleIcon,
    ImageIcon,
    FloppyDiskIcon,
    TrashIcon
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

    useEffect(() => {
        if (user) {
            setName(user.name ?? "");
            setEmail(user.email ?? "");
            setPhoneNumber(user.phoneNumber ?? "");
            setBio(user.bio ?? "");
            if (user.image && !avatarUpload.previewUrl) {
                avatarUpload.setPreviewUrl(user.image);
            }
            if (user.banner && !bannerUpload.previewUrl) {
                bannerUpload.setPreviewUrl(user.banner);
            }
        }
    }, [user, avatarUpload, bannerUpload]);

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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12 mt-12 bg-cyan-50 border border-slate-800 rounded-xl">
                <SpinnerIcon className="w-8 h-8 text-cyan-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
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
                        <FormGroup label="Foto Profil" align="start">
                            <div className="flex flex-col gap-3">
                                <div
                                    className="relative group shrink-0 w-24 h-24 sm:w-32 sm:h-32 cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="w-full h-full bg-slate-50 border-2 border-dashed border-slate-400 rounded-full flex flex-col items-center justify-center overflow-hidden transition-colors group-hover:border-cyan-600 group-hover:bg-cyan-50 relative">
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
                                                <span className="text-[10px] font-medium uppercase tracking-wider">Upload</span>
                                            </div>
                                        )}
                                        {avatarUpload.uploading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
                                                <SpinnerIcon size={24} weight="bold" className="text-white" />
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
                        <FormGroup label="Banner Profile" align="start">
                            <div className="flex flex-col gap-3">
                                <div
                                    className="relative group w-full aspect-[6/1] md:aspect-[8/1] cursor-pointer"
                                    onClick={() => bannerInputRef.current?.click()}
                                >
                                    <div className="w-full h-full bg-slate-50 border-2 border-dashed border-slate-400 rounded-xl flex flex-col items-center justify-center overflow-hidden transition-colors group-hover:border-cyan-600 group-hover:bg-cyan-50 relative">
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
                                                <span className="text-xs font-medium">Upload Banner</span>
                                            </div>
                                        )}
                                        {bannerUpload.uploading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
                                                <SpinnerIcon size={24} weight="bold" className="text-white" />
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
                        <FormGroup label="Nama">
                            <FormInput
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Masukkan nama lengkap"
                            />
                        </FormGroup>

                        {/* Email */}
                        <FormGroup label="Email">
                            <FormInput
                                value={email}
                                disabled
                                className="bg-slate-100 text-slate-500 cursor-not-allowed border-slate-300"
                            />
                        </FormGroup>

                        {/* Nomor Hp */}
                        <FormGroup label="Nomor Hp">
                            <FormInput
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="Masukkan nomor HP aktif"
                            />
                        </FormGroup>

                        {/* Bio */}
                        <FormGroup label="Bio" align="start">
                            <FormTextarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Ceritakan sedikit tentang dirimu..."
                            />
                        </FormGroup>
                    </div>

                    {/* ── Section 2: Keamanan ── */}
                    <div className="mt-8">
                        <SectionHeader title="Keamanan" />
                        <div className="mt-4">
                            {/* Password */}
                            <FormGroup label="Password Baru">
                                <FormInput
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Biarkan kosong jika tidak ingin mengubah password"
                                />
                            </FormGroup>
                        </div>
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="px-4 sm:px-10 pb-8 flex justify-end">
                    <ButtonSave
                        label="Simpan Perubahan"
                        icon={FloppyDiskIcon}
                        onClick={handleSave}
                        isLoading={updateProfile.isPending}
                        disabled={avatarUpload.uploading || bannerUpload.uploading}
                        className="w-full sm:w-fit"
                        weight="fill"
                    />
                </div>
            </div>
        </div>
    );
}
