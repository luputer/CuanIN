"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
    ArrowLeftIcon,
    PencilSimpleIcon,
    UsersIcon,
    ImageIcon,
    BasketIcon,
    WalletIcon,
} from "@phosphor-icons/react";

import { api } from "~/trpc/react";
import { Skeleton } from "~/components/ui/skeleton";
import {
    SectionHeader,
} from "~/components/ui/form-layout";
import { Button } from "~/components/ui/button";

export default function CreatorDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const { data: creator, isLoading: isFetching } = api.creators.getById.useQuery(
        { id },
        { enabled: !!id }
    );

    // ─── Local Components (Matching Webinar Detail Style) ───
    const Label = ({ children }: { children: React.ReactNode }) => (
        <div className="w-full sm:w-48 md:w-56 shrink-0 text-slate-500 text-sm font-medium leading-6">{children}</div>
    );

    const Value = ({ children }: { children: React.ReactNode }) => (
        <div className="flex-1 text-slate-800 text-sm font-medium leading-6">
            {children || <span className="text-slate-400">-</span>}
        </div>
    );

    const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
        <div className="flex flex-col sm:flex-row items-start pb-6 gap-1 sm:gap-8">
            <Label>{label}</Label>
            <Value>{children}</Value>
        </div>
    );

    if (isFetching) {
        return (
            <div className="space-y-6">
                <div className="bg-slate-50">
                    <div className="flex flex-col gap-1 sticky top-[74px] bg-slate-50 z-40 -mx-4 px-4 pt-2">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-8 w-64" />
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-8 space-y-8">
                    <Skeleton className="h-[600px] w-full" />
                </div>
            </div>
        );
    }

    if (!creator) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <p className="text-slate-500">Kreator tidak ditemukan</p>
                <Link href="/admin/kreator" className="text-cyan-600 font-bold mt-2 hover:underline">
                    Kembali ke Daftar
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-slate-50">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sticky top-[74px] bg-slate-50 z-40 -mx-4 px-4 pt-2">
                    <div className="flex-1 flex flex-col gap-1">
                        <Link
                            href="/admin/kreator"
                            className="group flex items-center gap-2 text-sm font-regular text-slate-600 hover:text-slate-800 transition-colors w-fit mb-2"
                        >
                            <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                            <span className="leading-none">Kembali ke Daftar Kreator</span>
                        </Link>
                        <h1 className="text-xl font-semibold text-slate-800">Detail Akun Kreator</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border-cyan-600 hover:bg-cyan-50 h-10 px-4 rounded-lg cursor-pointer"
                            onClick={() => router.push(`/admin/kreator/${id}/produk`)}
                        >
                            <span className="text-sm font-medium text-cyan-600 whitespace-nowrap">
                                Lihat Produk Kreator
                            </span>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Kolom Kiri: Informasi User (Main) */}
                <div className="flex-1 bg-white rounded-xl border border-slate-800 overflow-hidden shadow-[0px_2px_0px_rgba(29,41,61)] w-full">
                    {/* Sub-header: nama kreator & tombol edit */}
                    <div className="bg-cyan-50 px-4 sm:px-10 py-6 border-b border-slate-800 flex items-center justify-between gap-4">
                        <h2 className="text-lg font-semibold text-cyan-900">{creator.name}</h2>
                        <Link
                            href={`/admin/kreator/${id}/edit`}
                            className="flex items-center gap-1.5 text-sm text-cyan-600 font-medium transition-colors hover:text-cyan-700 cursor-pointer"
                        >
                            <PencilSimpleIcon className="w-4 h-4" />
                            Edit
                        </Link>
                    </div>

                    <div className="px-4 sm:px-10 py-6 sm:py-8">

                        {/* ─── Informasi User ─── */}
                        <SectionHeader title="Informasi User" />

                        <div className="mt-8">
                            {/* Foto Profil */}
                            <Row label="Foto Profil">
                                <div className="relative shrink-0 w-24 h-24 sm:w-32 sm:h-32">
                                    <div className="w-full h-full bg-white border-2 border-slate-200 rounded-full flex flex-col items-center justify-center overflow-hidden relative shadow-sm">
                                        {creator.image ? (
                                            <Image
                                                src={creator.image}
                                                alt={creator.name ?? ""}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center gap-1 text-slate-200">
                                                <span className="text-xs font-medium text-slate-400 text-center">Belum ada foto profil</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Row>

                            {/* Banner Profile */}
                            <Row label="Banner Profil">
                                <div className="relative w-full aspect-[6/1] md:aspect-[8/1] bg-slate-50 border-2 border-slate-200 rounded-xl overflow-hidden">
                                    {creator.banner ? (
                                        <Image
                                            src={creator.banner}
                                            alt="Banner"
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-200">
                                            <span className="text-xs font-medium text-slate-400">Belum ada banner</span>
                                        </div>
                                    )}
                                </div>
                            </Row>

                            {/* Nama */}
                            <Row label="Nama">
                                {creator.name}
                            </Row>

                            {/* Email */}
                            <Row label="Email">
                                {creator.email}
                            </Row>

                            {/* Nomor Hp */}
                            <Row label="Nomor Hp">
                                {creator.phoneNumber}
                            </Row>

                            {/* Bio */}
                            <Row label="Bio">
                                <div className="whitespace-pre-wrap">
                                    {creator.bio}
                                </div>
                            </Row>
                        </div>

                        {/* ─── Keamanan ─── */}
                        <section className="mt-4">
                            <SectionHeader title="Keamanan" />
                            <div className="mt-8">
                                <Row label="Password">
                                    <span className="tracking-widest">********</span>
                                </Row>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Kolom Kanan: Informasi Performa (Sidebar) */}
                <div className="w-full lg:w-80 flex flex-col gap-4">
                    <div className="bg-cyan-50 rounded-xl border border-slate-800 overflow-hidden shadow-[0px_2px_0px_rgba(29,41,61)] p-6 space-y-6">
                        <SectionHeader title="Performa" />

                        <div className="space-y-4">
                            {/* Total Produk */}
                            <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-500 shrink-0">
                                    <BasketIcon size={24} weight="fill" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-slate-800 tracking-wider truncate">Total Produk</p>
                                    <h3 className="text-xl font-medium text-slate-800">{creator.metrics.totalProducts || 0}</h3>
                                </div>
                            </div>

                            {/* Total Pembeli */}
                            <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 shrink-0">
                                    <UsersIcon size={24} weight="fill" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-800 tracking-wider truncate">Total Pembeli</p>
                                    <h3 className="text-xl font-medium text-slate-800 truncate">{creator.metrics.totalUsers || 0}</h3>
                                </div>
                            </div>

                            {/* Total Pendapatan */}
                            <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-500 shrink-0">
                                    <WalletIcon size={24} weight="fill" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-800 tracking-wider truncate">Total Pendapatan</p>
                                    <h3 className="text-xl font-medium text-slate-800 truncate">
                                        Rp {(creator.metrics.totalEarnings || 0).toLocaleString("id-ID")}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
