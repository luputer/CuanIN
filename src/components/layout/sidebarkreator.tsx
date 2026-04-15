"use client";

import Link from "next/link";
import React, { useState } from "react";
import { SquaresFour, VideoCamera, BookOpen, CloudArrowUp, Users, CreditCard, Storefront, List } from "phosphor-react";
import { usePathname } from "next/navigation";
import { api } from "~/trpc/react";

// Component kecil (item menu)
function SidebarItem({
    icon,
    label,
    active,
    href,
    iconClassName,
    textClassName,
    isCollapsed,
}: {
    icon: React.ReactElement<{ className?: string }>;
    label: string;
    active?: boolean;
    href: string;
    iconClassName?: string;
    textClassName?: string;
    isCollapsed?: boolean;
}) {
    return (
        <Link href={href} className="block" title={isCollapsed ? label : undefined}>
            <div
                className={`flex items-center ${isCollapsed ? "justify-center px-0 py-3" : "gap-3 px-4 py-2"} rounded-lg cursor-pointer transition-all duration-300 ease-out
        ${active
                        ? "bg-yellow-200 text-indigo-950 font-semibold text-base border-2 border-indigo-950 shadow-[1px_2px_0px_rgba(30,27,75)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition duration-200 ease-out"
                        : textClassName ?? "font-semibold text-base text-indigo-950 hover:bg-slate-200"
                    }`}
            >
                {React.cloneElement(icon, {
                    className: `w-5 h-5 shrink-0 ${iconClassName ?? "text-indigo-950"}`,
                })}
                {!isCollapsed && <span className="whitespace-nowrap">{label}</span>}
            </div>
        </Link>
    );
}


// Sidebar utama
export default function SidebarKreator() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Fetch data katalog untuk menentukan link
    const { data: catalog } = api.catalog.getMine.useQuery();
    const catalogHref = catalog?.slug ? `/${catalog.slug}` : "/catalog/setup";

    return (
        <aside className={`sticky top-0 transition-all duration-300 z-50 ease-in-out ${isCollapsed ? "w-20" : "w-64"} h-screen bg-white p-4 text-white border-r-2 border-indigo-950 flex flex-col`}>
            {/* Header sidebar + Toggle button */}
            <div className={`flex items-center mb-6 mt-2 ${isCollapsed ? "justify-center" : "justify-between px-2"}`}>
                {!isCollapsed && (
                    <div className="text-yellow-500 text-2xl font-bold">
                        <Link href="/">CuanIN</Link>
                    </div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1 rounded-md text-slate-500 border-2 border-transparent hover:border-slate-300 hover:bg-slate-100 transition-all duration-200"
                    title={isCollapsed ? "Expand menu" : "Collapse menu"}
                >
                    <List size={24} weight="bold" />
                </button>
            </div>

            <div className="flex flex-col flex-1 overflow-y-auto overflow-visible no-scrollbar px-1">
                {!isCollapsed ? (
                    <div className="pl-3 text-slate-500 text-sm font-bold mb-3 tracking-wider">
                        MENU
                    </div>
                ) : (
                    <div className="border-t-2 border-slate-200 mb-4 mx-2"></div>
                )}

                <div className="flex flex-col gap-3 pb-4 border-b-2 border-cyan-600">
                    <SidebarItem
                        icon={<SquaresFour size={20} weight="fill" />}
                        label="Dashboard"
                        href="/dashboard"
                        active={pathname.startsWith("/dashboard")}
                        isCollapsed={isCollapsed}
                    />
                    <SidebarItem
                        icon={<VideoCamera size={20} weight="fill" />}
                        label="Webinar"
                        href="/webinar"
                        active={pathname.startsWith("/webinar")}
                        isCollapsed={isCollapsed}
                    />
                    <SidebarItem
                        icon={<BookOpen size={20} weight="fill" />}
                        label="Kelas"
                        href="/kelas"
                        active={pathname.startsWith("/kelas")}
                        isCollapsed={isCollapsed}
                    />
                    <SidebarItem
                        icon={<CloudArrowUp size={20} weight="fill" />}
                        label="Produk Digital"
                        href="/produk-digital"
                        active={pathname.startsWith("/produk-digital")}
                        isCollapsed={isCollapsed}
                    />
                    <SidebarItem
                        icon={<Users size={20} weight="fill" />}
                        label="Peserta"
                        href="/peserta"
                        active={pathname.startsWith("/peserta")}
                        isCollapsed={isCollapsed}
                    />
                    <SidebarItem
                        icon={<CreditCard size={20} weight="fill" />}
                        label="Pembayaran"
                        href="/pembayaran"
                        active={pathname.startsWith("/pembayaran")}
                        isCollapsed={isCollapsed}
                    />
                </div>
                <div className={`mt-4 w-full flex flex-col rounded-lg border-2 border-cyan-600 shadow-[0px_4px_0px_rgba(0,146,184)] hover:-translate-y-[2px] transition duration-200 ease-out hover:border-cyan-700 bg-white hover:bg-cyan-50`}>
                    <SidebarItem
                        icon={<Storefront size={20} weight="fill" />}
                        label="Katalog Saya"
                        href={catalogHref}
                        iconClassName="text-cyan-600"
                        textClassName="text-cyan-600 font-semibold text-base"
                        isCollapsed={isCollapsed}
                    />
                </div>
            </div>
        </aside>
    );
}