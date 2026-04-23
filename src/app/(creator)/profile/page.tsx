"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronLeft, Pencil, Loader2, Save } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useImageUpload } from "~/hooks/use-upload";

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
    const { uploading, previewUrl, handleFileUpload, setPreviewUrl } = useImageUpload("avatars");

    useEffect(() => {
        if (user) {
            setName(user.name ?? "");
            setEmail(user.email ?? "");
            setPhoneNumber(user.phoneNumber ?? "");
            setBio(user.bio ?? "");
            if (user.image && !previewUrl) {
                setPreviewUrl(user.image);
            }
        }
    }, [user, previewUrl, setPreviewUrl]);

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        await handleFileUpload(e);
    };

    const handleSave = () => {
        updateProfile.mutate({
            name,
            phoneNumber,
            image: previewUrl,
            bio,
            password: password ? password : undefined,
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12 mt-12 bg-[#f0f9fa] border border-[#00B4D8]/20 rounded-xl">
                <Loader2 className="w-8 h-8 animate-spin text-[#00B4D8]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-2 mb-8">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-xl font-bold text-[#00B4D8] hover:text-[#009bc2] w-fit"
                >
                    <ChevronLeft className="h-5 w-5" />
                    <span>Akun Saya</span>
                </Link>
            </div>

            {/* Main Content */}
            <div className="bg-[#f0f9fa] border border-[#00B4D8] rounded-xl p-6 md:p-8">

                {/* Section 1: Informasi User */}
                <div className="mb-6">
                    <h2 className="text-slate-700 font-bold mb-3 text-lg">Informasi User</h2>
                    <div className="border-b-[1.5px] border-[#00B4D8] w-full" />
                </div>

                <div className="space-y-5">
                    {/* Foto Profil */}
                    <div>
                        <Label className="text-slate-600 font-semibold mb-4 block">Foto Profil</Label>
                        <div
                            className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full mb-2 cursor-pointer group"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="w-full h-full rounded-full overflow-hidden bg-slate-200 border-2 border-transparent group-hover:border-[#00B4D8] transition-colors relative">
                                {previewUrl ? (
                                    <Image
                                        src={previewUrl}
                                        alt="Foto Profil"
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full bg-blue-500 text-white flex items-center justify-center font-bold text-4xl uppercase">
                                        {name ? name[0] : "U"}
                                    </div>
                                )}
                                {uploading && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                                    </div>
                                )}
                            </div>
                            <button className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-[#00B4D8] rounded-full flex items-center justify-center text-[#00B4D8] hover:bg-cyan-50 shadow-sm transition-colors z-20">
                                <Pencil className="w-4 h-4" />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={onFileChange}
                            />
                        </div>
                    </div>

                    {/* Nama */}
                    <div>
                        <Label className="text-slate-600 font-semibold mb-2 block">Nama</Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-white h-[46px] border-[#00B4D8]/30 focus-visible:ring-[#00B4D8] text-slate-700"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <Label className="text-slate-600 font-semibold mb-2 block">Email</Label>
                        <Input
                            value={email}
                            disabled
                            className="bg-slate-100 h-[46px] border-[#00B4D8]/30 focus-visible:ring-0 text-slate-500 cursor-not-allowed"
                        />
                    </div>

                    {/* Nomor Hp */}
                    <div>
                        <Label className="text-slate-600 font-semibold mb-2 block">Nomor Hp</Label>
                        <Input
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="bg-white h-[46px] border-[#00B4D8]/30 focus-visible:ring-[#00B4D8] text-slate-700"
                        />
                    </div>

                    {/* Bio */}
                    <div>
                        <Label className="text-slate-600 font-semibold mb-2 block">Bio</Label>
                        <Textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={3}
                            placeholder="Ceritakan sedikit tentang dirimu..."
                            className="bg-white border-[#00B4D8]/30 focus-visible:ring-[#00B4D8] text-slate-700 min-h-[100px]"
                        />
                    </div>
                </div>

                {/* Section 2: Keamanan */}
                <div className="mt-6 mb-6">
                    <h2 className="text-slate-700 font-bold mb-3 text-lg">Keamanan</h2>
                    <div className="border-b-[1.5px] border-[#00B4D8] w-full" />
                </div>

                <div className="space-y-5">
                    {/* Password */}
                    <div>
                        <Label className="text-slate-600 font-semibold mb-2 block">Password Baru</Label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Biarkan kosong jika tidak ingin mengubah password"
                            className="bg-white h-[46px] border-[#00B4D8]/30 focus-visible:ring-[#00B4D8] text-slate-700 placeholder:font-normal placeholder:tracking-normal placeholder:text-sm font-medium tracking-widest text-lg"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-10 pt-6 flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={updateProfile.isPending || uploading}
                        className="bg-[#00B4D8] hover:bg-[#009bc2] text-white px-8 py-6 rounded-xl font-bold flex items-center gap-2"
                    >
                        {updateProfile.isPending ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Menyimpan...</>
                        ) : (
                            <><Save className="w-5 h-5" /> Simpan Perubahan</>
                        )}
                    </Button>
                </div>

            </div>
        </div>
    );
}
