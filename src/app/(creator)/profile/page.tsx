"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    ArrowLeftIcon,
    CircleNotchIcon,
    EyeIcon,
    EyeSlashIcon,
    ImageIcon,
    PencilSimpleIcon,
    TrashIcon,
} from "@phosphor-icons/react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useImageUpload } from "~/hooks/use-upload";
import { SectionHeader, FormInput, FormTextarea } from "~/components/ui/form-layout";
import ButtonSave from "~/components/ui/button-save";
import { Skeleton } from "~/components/ui/skeleton";

const Label = ({ children }: { children: React.ReactNode }) => (
    <div className="w-full text-slate-500 text-sm font-medium leading-6 mb-1">{children}</div>
);

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex flex-col items-start pb-5 gap-0.5 w-full">
        <Label>{label}</Label>
        <div className="flex-1 w-full text-slate-800 text-sm font-medium leading-6">
            {children}
        </div>
    </div>
);

export default function ProfilePage() {
    const utils = api.useUtils();

    const { data: user, isLoading } = api.profile.get.useQuery();
    const { data: catalogData } = api.catalog.getMine.useQuery();

    const updateProfile = api.profile.update.useMutation({
        onSuccess: () => {
            void utils.profile.get.invalidate();
            setPassword("");
        },
        onError: (e) => {
            toast.error(e.message || "Gagal memperbarui profil");
        },
    });

    const upsertCatalog = api.catalog.upsert.useMutation({
        onSuccess: () => {
            void utils.catalog.getMine.invalidate();
        },
        onError: (e) => {
            toast.error(e.message || "Gagal memperbarui catalog name");
        },
    });

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [bio, setBio] = useState("");
    const [catalogName, setCatalogName] = useState("");
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
            if (user.image) avatarUpload.setPreviewUrl(user.image);
            if (user.banner) bannerUpload.setPreviewUrl(user.banner);
            isInitializedRef.current = true;
        }
    }, [user]);

    useEffect(() => {
        if (catalogData?.slug) {
            setCatalogName(catalogData.slug);
        }
    }, [catalogData]);

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        await avatarUpload.handleFileUpload(e);
    };

    const handleSave = async () => {
        try {
            await updateProfile.mutateAsync({
                name,
                phoneNumber,
                image: avatarUpload.previewUrl,
                banner: bannerUpload.previewUrl,
                bio,
                password: password ? password : undefined,
            });

            if (catalogName && catalogName !== catalogData?.slug) {
                await upsertCatalog.mutateAsync({ slug: catalogName });
            }

            toast.success("Profil berhasil diperbarui");
        } catch {
            // error sudah di-handle di masing-masing onError
        }
    };

    const isDirty =
        name !== (user?.name || "") ||
        phoneNumber !== (user?.phoneNumber || "") ||
        bio !== (user?.bio || "") ||
        password !== "" ||
        catalogName !== (catalogData?.slug || "") ||
        (avatarUpload.previewUrl || "") !== (user?.image || "") ||
        (bannerUpload.previewUrl || "") !== (user?.banner || "");

    if (isLoading) {
        return (
            <div className="w-full max-w-7xl mx-auto animate-pulse">
                <div className="space-y-6">
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
                                <Skeleton className="h-10 w-40 rounded-lg" />
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 rounded-xl border border-slate-800 overflow-hidden bg-white">
                        <div className="px-4 py-6 sm:px-8 sm:py-8">
                            <Skeleton className="h-6 w-40 mb-8" />
                            <div className="space-y-5">
                                <div className="flex flex-col gap-1.5">
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-24 w-24 rounded-full" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="w-full aspect-[8/1] rounded-xl" />
                                </div>
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex flex-col gap-1.5">
                                        <Skeleton className="h-4 w-28" />
                                        <Skeleton className="h-[46px] w-full rounded-lg" />
                                    </div>
                                ))}
                                <div className="flex flex-col gap-1.5">
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-24 w-full rounded-lg" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto">
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-slate-50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:sticky sm:top-[74px] bg-slate-50 z-40 -mx-6 px-6 pt-2 pb-0">
                        <div className="flex-1 flex flex-col gap-1">
                            <Link
                                href="/dashboard"
                                className="group flex items-center gap-2 text-sm font-regular text-slate-600 hover:text-slate-800 transition-colors w-fit mb-2"
                            >
                                <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                                <span className="leading-none">Kembali ke Dashboard</span>
                            </Link>
                            <h1 className="text-xl font-medium text-slate-800">Akun Saya</h1>
                        </div>
                    </div>
                </div>

                {/* Content */}
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
                            </Row>

                            {/* Banner Profile */}
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
                            </Row>

                            {/* Nama */}
                            <Row label="Nama">
                                <FormInput
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Masukkan nama lengkap"
                                />
                            </Row>

                            {/* Email */}
                            <Row label="Email">
                                <FormInput
                                    value={email}
                                    disabled
                                    className="bg-slate-100 text-slate-500 cursor-not-allowed border-slate-300"
                                />
                            </Row>

                            {/* Nomor Hp */}
                            <Row label="Nomor Hp">
                                <FormInput
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="Masukkan nomor HP aktif"
                                />
                            </Row>

                            {/* Catalog Name */}
                            <Row label="Catalog Name (URL Toko)">
                                <FormInput
                                    value={catalogName}
                                    onChange={(e) =>
                                        setCatalogName(
                                            e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                                        )
                                    }
                                    placeholder="nama-toko-kamu"
                                />
                                {catalogName && (
                                    <p className="text-xs text-slate-400 mt-2 ml-1">
                                        {process.env.NEXT_PUBLIC_BASE_URL}/<span className="text-cyan-600 font-medium">{catalogName}</span>
                                    </p>
                                )}
                            </Row>

                            {/* Bio */}
                            <Row label="Bio">
                                <FormTextarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Ceritakan tentang tokomu"
                                />
                            </Row>
                        </div>

                        {/* ─── Keamanan ─── */}
                        <div className="pt-6">
                            <SectionHeader title="Keamanan" />
                            <div className="space-y-0 pt-6">
                                <Row label="Password Baru (Opsional)">
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
                                </Row>
                            </div>
                        </div>

                        {/* Footer Form */}
                        <div className="flex flex-col sm:flex-row justify-end sm:items-center mt-4 pt-4 border-t border-slate-200 gap-4 w-full">
                            <div className="w-full sm:w-auto flex justify-end">
                                <ButtonSave
                                    onClick={handleSave}
                                    isLoading={
                                        updateProfile.isPending ||
                                        upsertCatalog.isPending ||
                                        avatarUpload.uploading ||
                                        bannerUpload.uploading
                                    }
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
        </div>
    );
}