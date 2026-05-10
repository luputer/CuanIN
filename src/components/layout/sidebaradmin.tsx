"use client";

import Link from "next/link";
import React, { useState } from "react";
import { SquaresFourIcon, BasketIcon, CreditCardIcon, ListIcon, AddressBookIcon } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";

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
                        ? "bg-yellow-200 text-slate-800 font-semibold text-base border-1 border-slate-800 shadow-[1px_2px_0px_rgba(30,27,75)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition duration-200 ease-out"
                        : textClassName ?? "font-semibold text-base text-slate-800 hover:bg-slate-200"
                    }`}
            >
                {React.cloneElement(icon, {
                    className: `w-5 h-5 shrink-0 ${iconClassName ?? "text-slate-800"}`,
                })}
                {!isCollapsed && <span className="whitespace-nowrap">{label}</span>}
            </div>
        </Link>
    );
}


// Sidebar utama
export default function SidebarAdmin() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <aside className={`sticky top-0 transition-all duration-300 z-50 ease-in-out ${isCollapsed ? "w-20" : "w-64"} h-screen bg-white p-4 text-white border-r-1 border-slate-800 flex flex-col`}>
            {/* Header sidebar + Toggle button */}
            <div className={`flex items-center mb-6 mt-2 ${isCollapsed ? "justify-center" : "justify-between px-2"}`}>
                {!isCollapsed && (
                    <div className="text-yellow-500 text-2xl font-bold">
                        <Link href="/">CuanIN</Link>
                    </div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1 rounded-lg text-slate-500 border-1 border-transparent hover:border-slate-300 hover:bg-slate-100 transition-all duration-200"
                    title={isCollapsed ? "Expand menu" : "Collapse menu"}
                >
                    <ListIcon size={24} weight="bold" />
                </button>
            </div>

            <div className="flex flex-col flex-1 overflow-y-auto overflow-visible no-scrollbar px-1">
                {!isCollapsed ? (
                    <div className="pl-3 text-slate-500 text-sm font-bold mb-3 tracking-wider">
                        MENU
                    </div>
                ) : (
                    <div className="border-t-1 border-slate-200 mb-4 mx-2"></div>
                )}

                <div className="flex flex-col gap-3">
                    <SidebarItem
                        icon={<SquaresFourIcon size={20} weight="fill" />}
                        label="Dashboard"
                        href="/admin/dashboard"
                        active={pathname.startsWith("/admin/dashboard")}
                        isCollapsed={isCollapsed}
                    />
                    <SidebarItem
                        icon={<AddressBookIcon size={20} weight="fill" />}
                        label="Kreator"
                        href="/admin/kreator"
                        active={pathname.startsWith("/admin/kreator")}
                        isCollapsed={isCollapsed}
                    />
                    <SidebarItem
                        icon={<BasketIcon size={20} weight="fill" />}
                        label="Produk"
                        href="/admin/produk"
                        active={pathname.startsWith("/admin/produk")}
                        isCollapsed={isCollapsed}
                    />
                    <SidebarItem
                        icon={<CreditCardIcon size={20} weight="fill" />}
                        label="Transaksi"
                        href="/admin/transaksi"
                        active={pathname.startsWith("/admin/transaksi")}
                        isCollapsed={isCollapsed}
                    />
                </div>
            </div>
        </aside>
    );
}