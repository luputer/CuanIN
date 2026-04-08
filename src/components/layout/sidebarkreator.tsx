"use client";

import Link from "next/link";
import React from "react";
import { SquaresFour, VideoCamera, BookOpen, CloudArrowUp, Users, CreditCard, Storefront } from "phosphor-react";

// 🔹 Component kecil (item menu)
function SidebarItem({
    icon,
    label,
    active,
    href,
    iconClassName,
    textClassName,
}: {
    icon: React.ReactElement<any>;
    label: string;
    active?: boolean;
    href: string;
    iconClassName?: string;
    textClassName?: string;
}) {
    return (
        <Link href={href}>
            <div
                className={`px-4 py-2 rounded-lg cursor-pointer transition
        ${active
                        ? "bg-yellow-200 text-indigo-950 font-semibold text-base border-2 border-indigo-950 shadow-[1px_2px_0px_rgba(30,27,75)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition duration-200 ease-out"
                        : textClassName || "font-semibold text-base text-indigo-950 hover:bg-slate-200"
                    }`}
            >
                <div className="flex items-center gap-3">
                    {React.cloneElement(icon, {
                        className: `w-5 h-5 ${iconClassName
                            ? iconClassName
                            : "text-indigo-950"
                            }`,
                    })}
                    {label}
                </div>
            </div>
        </Link>
    );
}

// 🔹 Sidebar utama
export default function SidebarKreator() {
    return (
        <aside className="sticky top-0 w-64 h-screen bg-white p-6 text-white border-r-2 border-indigo-950">
            <div className="text-yellow-500 text-2xl font-bold">
                <Link href="/">CuanIN</Link>
            </div>

            <div className="mt-10 flex flex-col">
                <div className="pl-2 text-slate-500 text-base font-semibold mb-4">
                    MENU
                </div>
                <div className="flex flex-col gap-4 pb-4 border-b-2 border-cyan-600">
                    <SidebarItem
                        icon={<SquaresFour size={20} weight="fill" />}
                        label="Dashboard"
                        href="/kreator/dashboard"
                        active
                    />
                    <SidebarItem
                        icon={<VideoCamera size={20} weight="fill" />}
                        label="Webinar"
                        href="#"
                    />
                    <SidebarItem
                        icon={<BookOpen size={20} weight="fill" />}
                        label="Kelas"
                        href="#"
                    />
                    <SidebarItem
                        icon={<CloudArrowUp size={20} weight="fill" />}
                        label="Produk Digital"
                        href="#"
                    />
                    <SidebarItem
                        icon={<Users size={20} weight="fill" />}
                        label="Peserta"
                        href="#"
                    />
                    <SidebarItem
                        icon={<CreditCard size={20} weight="fill" />}
                        label="Pembayaran"
                        href="#"
                    />
                </div>
                <div className="mt-4 flex flex-col items-center rounded-lg border-2 border-cyan-600 shadow-[0px_4px_0px_rgba(0,146,184)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition duration-200 ease-out hover:border-cyan-700 hover:bg-cyan-50">
                    <SidebarItem
                        icon={<Storefront size={20} weight="fill" />}
                        label="Katalog Saya"
                        href="#"
                        iconClassName="text-cyan-600 hover:text-cyan-700"
                        textClassName="text-cyan-600 font-semibold text-base hover:text-cyan-700"
                    />
                </div>
            </div>
        </aside>
    );
}