"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircleIcon, LinkIcon, SpinnerIcon, StorefrontIcon, ArrowRightIcon, XCircleIcon, CheckIcon, XIcon } from "@phosphor-icons/react";
import { Label } from "~/components/ui/label";
import { api } from "~/trpc/react";
import { toast } from "sonner";

export default function CatalogSetupPage() {
    const router = useRouter();

    // Middleware sudah handle auth — langsung fetch data
    const { data: existing, isLoading } = api.catalog.getMine.useQuery();
    const [slug, setSlug] = useState("");
    const [bio, setBio] = useState("");
    const [debouncedSlug, setDebouncedSlug] = useState("");

    // Debounce input slug 500ms sebelum cek ke server
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSlug(slug), 500);
        return () => clearTimeout(timer);
    }, [slug]);

    // Pre-fill jika sudah ada catalog
    useEffect(() => {
        if (existing?.slug) {
            setSlug(existing.slug);
            setDebouncedSlug(existing.slug);
            setBio(existing.bio ?? "");
        }
    }, [existing]);

    // Cek ketersediaan slug (skip jika slug sama dengan milik sendiri)
    const isOwnSlug = existing?.slug === debouncedSlug;
    const { data: slugCheck, isFetching: isCheckingSlug } = api.catalog.checkSlug.useQuery(
        { slug: debouncedSlug },
        { enabled: debouncedSlug.length >= 3 && !isOwnSlug }
    );
    const slugAvailable = isOwnSlug ? true : slugCheck?.available;

    const upsert = api.catalog.upsert.useMutation({
        onSuccess: (data) => {
            toast.success("Catalog berhasil disimpan!");
            router.push(`/${data.slug}`);
        },
        onError: (err) => {
            toast.error(err.message);
        },
    });

    const handleSubmit = () => {
        if (!slug.trim()) return toast.error("Slug wajib diisi");
        if (!slugAvailable) return toast.error("Slug sudah dipakai, pilih nama lain");
        upsert.mutate({ slug: slug.trim(), bio: bio.trim() || undefined });
    };

    const previewUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${slug || "nama-kamu"}`;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <SpinnerIcon className="w-8 h-8 animate-spin text-blue-400" />
            </div>
        );
    }

    // Slug indicator
    const showIndicator = debouncedSlug.length >= 3;
    const slugIndicator = isCheckingSlug ? (
        <SpinnerIcon className="w-4 h-4 animate-spin text-slate-400" />
    ) : showIndicator && slugAvailable ? (
        <CheckCircleIcon className="w-4 h-4 text-green-500" />
    ) : showIndicator && slugAvailable === false ? (
        <XCircleIcon className="w-4 h-4 text-red-500" />
    ) : null;

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-cyan-50 rounded-full mb-4">
                        <StorefrontIcon className="w-10 h-10 text-cyan-600" />
                    </div>
                    <h1 className="pb-3 text-2xl font-semibold text-cyan-600">Buat Halaman Katalog</h1>
                    <p className="text-md text-slate-800">
                        Bagikan semua produkmu dalam satu halaman yang bisa diakses siapa saja.
                    </p>
                </div>

                {/* Form */}
                <div className="w-full max-w-lg rounded-2xl border-2 border-slate-800 bg-white p-6 shadow-[0px_2px_0px_rgba(29,41,61)] sm:p-10 space-y-4">
                    {/* Slug */}
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-slate-800">
                            URL Katalog <span className="text-red-500">*</span>
                        </Label>
                        <div
                            className={`flex items-center rounded-lg border py-1 px-2 text-sm transition-all outline-none placeholder:text-sm placeholder:text-slate-400
                                    focus-within:ring-2 focus-within:ring-cyan-100 focus-within:border-cyan-600 bg-slate-100
                                    ${showIndicator && slugAvailable === false
                                    ? "border-red-300"
                                    : showIndicator && slugAvailable
                                        ? "border-green-300"
                                        : "border-slate-300"
                                }`}
                        >
                            <span className="px-3 text-slate-400 text-sm whitespace-nowrap border-r border-slate-200">
                                /
                            </span>
                            <input
                                className="flex-1 px-3 py-2.5 text-sm outline-none"
                                placeholder="namatoko"
                                value={slug}
                                onChange={(e) =>
                                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                                }
                            />
                            {/* Indicator */}
                            <span className="pr-3">{slugIndicator}</span>
                        </div>

                        {/* Status pesan */}
                        {showIndicator && (
                            <p className={`text-sm ${slugAvailable === false ? "text-red-500" : "text-slate-400"
                                }`}>
                                {isCheckingSlug
                                    ? "Mengecek ketersediaan..."
                                    : slugAvailable === false
                                        ? <div className="flex items-center gap-2 text-red-600"><XIcon className="w-3 h-3" weight="bold" /> Slug sudah dipakai orang lain, pilih nama lain.</div>
                                        : <div className="flex items-center gap-2 text-green-600"><CheckIcon className="w-3 h-3" weight="bold" /> Link tersedia</div>}
                            </p>
                        )}
                        {!showIndicator && (
                            <p className="text-xs text-slate-400">
                                Huruf kecil, angka, dan tanda hubung saja. Min. 3 karakter.
                            </p>
                        )}
                    </div>

                    {/* Bio */}
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-slate-800">
                            Bio
                        </label>

                        <div className="flex items-start rounded-lg border py-1 px-2 bg-slate-100 focus-within:ring-2 focus-within:ring-cyan-100 focus-within:border-cyan-600 border-slate-300">
                            <textarea
                                rows={5}
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Apa yang kamu jual? Ceritakan di sini"
                                className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent resize-none placeholder:text-sm placeholder:text-slate-400"
                            />
                        </div>
                        <p className="text-xs text-slate-400 ml-auto">
                            {bio.length}/200
                        </p>
                    </div>

                    {/* URL Preview */}
                    {slug.length >= 3 && (
                        <div className="flex items-center gap-2 bg-white border border-cyan-600 rounded-lg px-3 py-2.5">
                            <LinkIcon className="w-4 h-4 text-cyan-600 shrink-0" />
                            <span className="text-sm text-cyan-600 break-all">{previewUrl}</span>
                        </div>
                    )}
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSubmit}
                    disabled={upsert.isPending || slug.length < 3 || slugAvailable === false || isCheckingSlug}
                    className="w-full mt-4 cursor-pointer rounded-lg border-2 border-slate-800 bg-yellow-200 py-3 text-base font-semibold text-slate-800 shadow-[0px_2px_0px_rgba(29,41,61)] transition duration-200 ease-out hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[0px_2px_0px_rgba(29,41,61)] flex items-center justify-center"
                >
                    {upsert.isPending ? (
                        <>
                            <SpinnerIcon className="mr-2 h-5 w-5 animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            Simpan & Lihat Catalog
                            <ArrowRightIcon className="ml-2 h-5 w-5" weight="bold" />
                        </>
                    )}
                </button>
            </div>
        </div >
    );
}
