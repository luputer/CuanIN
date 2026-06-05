"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
    ArrowLeftIcon,
    EyeIcon,
    EyeSlashIcon,
} from "@phosphor-icons/react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { SectionHeader, FormInput } from "~/components/ui/form-layout";
import ButtonSave from "~/components/ui/button-save";
import { Skeleton } from "~/components/ui/skeleton";

// ─── Local Components ────────────────────────────────────────────────────────

const Label = ({ children }: { children: React.ReactNode }) => (
    <div className="w-full text-slate-500 text-sm font-medium leading-6 mb-1">{children}</div>
);

const Row = ({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) => (
    <div className="flex flex-col items-start pb-5 gap-0.5 w-full">
        <Label>{label}</Label>
        <div className="flex-1 w-full text-slate-800 text-sm font-medium leading-6">
            {children}
        </div>
    </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminProfilePage() {
    const utils = api.useUtils();
    const { data: user, isLoading } = api.profile.get.useQuery();

    const updateProfile = api.profile.update.useMutation({
        onSuccess: () => {
            toast.success("Profil berhasil diperbarui");
            void utils.profile.get.invalidate();
            setPassword("");
        },
        onError: (e) => {
            toast.error(e.message || "Gagal memperbarui profil");
        },
    });

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const isInitializedRef = useRef(false);

    useEffect(() => {
        if (user && !isInitializedRef.current) {
            setName(user.name ?? "");
            setEmail(user.email ?? "");
            isInitializedRef.current = true;
        }
    }, [user]);

    const handleSave = () => {
        updateProfile.mutate({
            name,
            password: password ? password : undefined,
        });
    };

    const isDirty =
        name !== (user?.name || "") ||
        password !== "";

    // ─── Loading Skeleton ──────────────────────────────────────────────────────

    if (isLoading) {
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
                        </div>
                    </div>

                    {/* Content Skeleton */}
                    <div className="flex-1 rounded-xl border border-slate-800 overflow-hidden bg-white">
                        <div className="px-4 py-6 sm:px-8 sm:py-8">
                            <Skeleton className="h-6 w-40 mb-8" />
                            <div className="space-y-5">
                                {[1, 2].map((i) => (
                                    <div key={i} className="flex flex-col gap-1.5">
                                        <Skeleton className="h-4 w-28" />
                                        <Skeleton className="h-[46px] w-full rounded-lg" />
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8">
                                <Skeleton className="h-6 w-32 mb-6" />
                                <div className="flex flex-col gap-1.5">
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-[46px] w-full rounded-lg" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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
                                href="/admin/dashboard"
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
                                    isLoading={updateProfile.isPending}
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
