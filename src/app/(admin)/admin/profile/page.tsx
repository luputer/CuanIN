"use client";

import { useEffect, useState, useRef } from "react";
import {
    EyeIcon,
    EyeSlashIcon,
} from "@phosphor-icons/react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { SectionHeader, FormInput, FormRow } from "~/components/shared/form-layout";
import ButtonSave from "~/components/shared/button-save";
import { AdminProfileSkeleton } from "~/components/shared/detail-skeletons";
import { DetailHeader } from "~/components/shared/detail-header";

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
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const isInitializedRef = useRef(false);

    useEffect(() => {
        if (user && !isInitializedRef.current) {
            setName(user.name ?? "");
            setPhoneNumber(user.phoneNumber ?? "");
            setEmail(user.email ?? "");
            isInitializedRef.current = true;
        }
    }, [user]);

    const handleSave = () => {
        updateProfile.mutate({
            name,
            phoneNumber,
            password: password ? password : undefined,
        });
    };

    const isDirty =
        name !== (user?.name || "") ||
        phoneNumber !== (user?.phoneNumber || "") ||
        password !== "";

    // ─── Loading Skeleton ──────────────────────────────────────────────────────

    if (isLoading) {
        return <AdminProfileSkeleton />;
    }

    // ─── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="w-full max-w-7xl mx-auto">
            <div className="space-y-6">
                {/* Header */}
                <DetailHeader
                    backLink="/admin/dashboard"
                    backLabel="Kembali ke Dashboard"
                    title="Akun Saya"
                />

                {/* Content */}
                <div className="flex-1 min-w-0 bg-white rounded-xl border border-slate-800 overflow-hidden w-full">
                    <div className="px-4 py-6 sm:px-8 sm:py-8">
                        <SectionHeader title="Informasi User" />

                        <div className="space-y-0 pt-6">
                            {/* Nama */}
                            <FormRow label="Nama">
                                <FormInput
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Masukkan nama lengkap"
                                />
                            </FormRow>

                            {/* Nomor HP */}
                            <FormRow label="Nomor HP">
                                <FormInput
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="Masukkan nomor HP"
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
                        </div>

                        {/* ─── Keamanan ─── */}
                        <div className="pt-6">
                            <SectionHeader title="Keamanan" />
                            <div className="space-y-0 pt-6">
                                <FormRow label="Password Baru (Opsional)">
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
