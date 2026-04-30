"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    SquaresFourIcon,
    VideoCameraIcon,
    BookOpenIcon,
    CloudArrowUpIcon,
    UsersIcon,
    CreditCardIcon,
    StorefrontIcon,
    ListIcon,
    CopyIcon,
    EyeIcon,
    TrashIcon,
} from "@phosphor-icons/react";

import HeaderKreator from "~/components/layout/headerkreator";
import ActionButton from "~/components/ui/button-add";
import SearchInput from "~/components/ui/search";
import ButtonFilter from "~/components/ui/filter";
import {
    Table,
    TableHead,
    TableHeader,
    TableRow,
    TableBody,
    TableCell,
    TablePagination,
} from "~/components/ui/table";
import { usePathname } from "next/navigation";

/* ───────── SIDEBAR ITEM (SAMA PERSIS PUNYAMU) ───────── */
function SidebarItem({
    icon,
    label,
    active,
}: {
    icon: React.ReactElement<{ className?: string }>;
    label: string;
    active?: boolean;
}) {
    return (
        <div
            className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-all duration-300 ease-out
        ${active
                    ? "bg-yellow-200 text-slate-800 font-semibold text-base border-1 border-slate-800 shadow-[1px_2px_0px_rgba(30,27,75)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition duration-200 ease-out"
                    : "font-semibold text-base text-slate-800 hover:bg-slate-200"
                }`}
        >
            {React.cloneElement(icon, {
                className: "w-5 h-5 shrink-0 text-slate-800",
            })}
            <span className="whitespace-nowrap">{label}</span>
        </div>
    );
}

/* ───────── PREVIEW ───────── */
export default function DashboardPreview() {
    const pathname = usePathname();

    return (
        <div className="w-full pb-4 pl-2 lg:h-[640px] border-2 border-slate-800 rounded-xl bg-white shadow-[0px_3px_0px_rgba(30,27,75)] overflow-hidden flex">

            {/* ───────── SIDEBAR (FIXED 1:1) ───────── */}
            <div className="w-52 bg-white border-r border-slate-800 p-4 flex flex-col">

                <div className="pt-2 text-yellow-500 text-2xl font-bold mb-6">
                    CuanIN
                </div>

                <div className="text-xs font-bold text-slate-500 mb-3 tracking-wider">
                    MENU
                </div>

                <div className="flex flex-col gap-2">

                    <SidebarItem
                        icon={<SquaresFourIcon weight="fill" />}
                        label="Dashboard"
                    />
                    <SidebarItem
                        icon={<VideoCameraIcon weight="fill" />}
                        label="Webinar"
                        active
                    />
                    <SidebarItem
                        icon={<BookOpenIcon weight="fill" />}
                        label="Kelas"
                    />
                    <SidebarItem
                        icon={<CloudArrowUpIcon weight="fill" />}
                        label="Produk Digital"
                    />
                    <SidebarItem
                        icon={<UsersIcon weight="fill" />}
                        label="User"
                    />
                    <SidebarItem
                        icon={<CreditCardIcon weight="fill" />}
                        label="Transaksi"
                    />
                </div>

                <div className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg border border-cyan-600 text-cyan-600 font-semibold text-sm shadow-[0px_2px_0px_rgba(0,146,184)] hover:bg-cyan-50 transition">
                    <StorefrontIcon weight="fill" />
                    Katalog Saya
                </div>
            </div>

            {/* ───────── MAIN ───────── */}
            <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">

                <HeaderKreator />

                {/* TITLE (dipadatkan) */}
                <div className="px-6 pt-3">
                    <div className="text-xl font-semibold text-cyan-600">
                        Webinar
                    </div>
                    <div className="text-xs text-slate-600">
                        Pantau dan kelola webinar kamu.
                    </div>
                </div>

                {/* TOOLBAR (dipadatkan) */}
                <div className="flex justify-between items-center gap-3 px-6 py-3">

                    <SearchInput
                        placeholder="Cari webinar..."
                        value={""}
                        onChange={() => { }}
                        className="w-60"
                    />

                    <div className="flex gap-2">
                        <ButtonFilter label="Tipe: Semua" />
                        <ButtonFilter label="Status: Semua" />
                        <ActionButton label="Tambah Webinar" />
                    </div>
                </div>

                {/* TABLE WRAPPER BIAR FIT */}
                <div className="px-6 flex-1 min-h-0 min-w-0 overflow-hidden">

                    <div className="h-full overflow-hidden rounded-lg">

                        <Table className="w-full table-fixed"
                            pagination={
                                <div className="pointer-events-none opacity-70">
                                    <TablePagination
                                        page={1}
                                        totalPages={3}
                                        limit={10}
                                        total={30}
                                        onPageChange={() => { }}
                                        onLimitChange={() => { }}
                                    />
                                </div>
                            }
                        >
                            <TableHeader>
                                <TableRow className="h-14">
                                    <TableHead className="text-xs truncate w-10">No</TableHead>
                                    <TableHead className="text-xs truncate w-26">Nama</TableHead>
                                    <TableHead className="text-xs truncate w-32">Thumbnail</TableHead>
                                    <TableHead className="text-xs truncate">Waktu</TableHead>
                                    <TableHead className="text-xs truncate">Tipe</TableHead>
                                    <TableHead className="text-xs truncate">Harga</TableHead>
                                    <TableHead className="text-xs truncate w-26">Pembeli</TableHead>
                                    <TableHead className="text-xs truncate">Status</TableHead>
                                    <TableHead className="text-xs truncate">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {[
                                    "Webinar Bisnis Online",
                                    "UI/UX Masterclass",
                                    "Digital Marketing 101",
                                ].map((name, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="py-2 text-xs">{i + 1}</TableCell>
                                        <TableCell className="py-2 text-xs truncate">
                                            {name}
                                        </TableCell>

                                        <TableCell className="py-2">
                                            <div className="w-8 h-8 bg-slate-200 rounded-md" />
                                        </TableCell>

                                        <TableCell className="text-xs">12 Mei 2026 19:00</TableCell>
                                        <TableCell className="text-xs">Webinar</TableCell>
                                        <TableCell className="text-xs">Rp 50.000</TableCell>
                                        <TableCell className="text-xs">24</TableCell>

                                        <TableCell>
                                            <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-100 text-amber-700">
                                                Published
                                            </span>
                                        </TableCell>

                                        <TableCell className="pr-1">
                                            <div className="flex items-center gap-1">

                                                <button className="text-cyan-600">
                                                    <EyeIcon size={16} />
                                                </button>

                                                <button className="text-yellow-500">
                                                    <CopyIcon size={16} />
                                                </button>

                                                <button className="text-red-500">
                                                    <TrashIcon size={16} />
                                                </button>

                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>

                        </Table>

                    </div>
                </div>
            </div>
        </div >
    );
}