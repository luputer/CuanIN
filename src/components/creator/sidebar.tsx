"use client";

import Link from "next/link";
import Image from "next/image";
import React from "react";
import { SquaresFourIcon, VideoCameraIcon, BookOpenIcon, CloudArrowUpIcon, UsersIcon, CreditCardIcon, StorefrontIcon, TagIcon, XIcon } from "@phosphor-icons/react";
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
                className={`group flex items-center ${isCollapsed ? "justify-center px-0 py-3" : "gap-3 px-4 py-2"} rounded-lg cursor-pointer transition-all duration-300 ease-out
        ${active
                        ? "bg-cuan-blue text-white font-semibold text-base border-1 border-slate-800 shadow-[1px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition duration-200 ease-out"
                        : textClassName ?? "font-semibold text-base text-slate-800 hover:bg-cuan-blue/10 hover:text-cuan-blue"
                    }`}
            >
                {React.cloneElement(icon, {
                    className: `w-5 h-5 shrink-0 transition-colors duration-200 ${active ? "text-white" : (iconClassName ?? "text-slate-800 group-hover:text-cuan-blue")}`,
                })}
                {!isCollapsed && <span className="whitespace-nowrap">{label}</span>}
            </div>
        </Link>
    );
}


// Sidebar utama
export default function SidebarKreator({
    isMobile = false,
    onCloseMobile,
    isCollapsed: controlledIsCollapsed = false,
}: {
    isMobile?: boolean;
    onCloseMobile?: () => void;
    isCollapsed?: boolean;
} = {}) {
    const pathname = usePathname();

    // Fetch data katalog untuk menentukan link
    const { data: catalog } = api.catalog.getMine.useQuery();
    const catalogHref = catalog?.slug ? `/${catalog.slug}` : "/setup";

    const isCollapsed = isMobile ? false : controlledIsCollapsed;
    const asideWidth = isCollapsed ? "w-20" : "w-64";
    const showCollapsed = isCollapsed;

    return (
        <aside className={`transition-all duration-300 z-50 ease-in-out ${asideWidth} h-screen bg-white p-4 text-white border-r-1 border-slate-800 flex flex-col ${!isMobile ? "sticky top-0" : ""}`}>
            {/* Header sidebar + Toggle button */}
            <div className={`flex items-center mb-6 mt-2 ${showCollapsed ? "justify-center" : "justify-between px-2"}`}>
                {showCollapsed ? (
                    <Link href="/">
                        <Image
                            src="/icon cuanin.svg"
                            alt="CuanIN"
                            width={32}
                            height={32}
                            className="h-8 w-8 object-contain"
                        />
                    </Link>
                ) : (
                    <div className="flex items-center pl-2">
                        <Link href="/">
                            <Image
                                src="/logo-cuanin.svg"
                                alt="CuanIN"
                                width={120}
                                height={40}
                                className="h-8 w-auto object-contain"
                            />
                        </Link>
                    </div>
                )}
                {isMobile && (
                    <button type="button"
                        onClick={onCloseMobile}
                        className="p-1 rounded-lg text-slate-500 border-1 border-transparent hover:border-slate-300 hover:bg-slate-100 transition-all duration-200 cursor-pointer"
                        title="Tutup Menu"
                    >
                        <XIcon size={24} className="text-slate-800" weight="bold" />
                    </button>
                )}
            </div>

            <div className="flex flex-col flex-1 overflow-y-auto overflow-visible no-scrollbar px-1">
                {!isCollapsed ? (
                    <div className="pl-3 text-slate-500 text-sm font-bold mb-3 tracking-wider">
                        MENU
                    </div>
                ) : (
                    <div className="border-t-1 border-slate-200 mb-4 mx-2"></div>
                )}

                <div className="flex flex-col gap-3 pb-6 border-b-1 border-slate-200">
                    <SidebarItem
                        icon={<SquaresFourIcon size={20} weight="fill" />}
                        label="Dashboard"
                        href="/dashboard"
                        active={pathname.startsWith("/dashboard")}
                        isCollapsed={isCollapsed}
                    />
                    <SidebarItem
                        icon={<VideoCameraIcon size={20} weight="fill" />}
                        label="Webinar"
                        href="/webinar"
                        active={pathname.startsWith("/webinar")}
                        isCollapsed={isCollapsed}
                    />
                    <SidebarItem
                        icon={<BookOpenIcon size={20} weight="fill" />}
                        label="Kelas"
                        href="/kelas"
                        active={pathname.startsWith("/kelas")}
                        isCollapsed={isCollapsed}
                    />
                    <SidebarItem
                        icon={<CloudArrowUpIcon size={20} weight="fill" />}
                        label="Produk Digital"
                        href="/produk-digital"
                        active={pathname.startsWith("/produk-digital")}
                        isCollapsed={isCollapsed}
                    />
                    <SidebarItem
                        icon={<UsersIcon size={20} weight="fill" />}
                        label="User"
                        href="/peserta"
                        active={pathname.startsWith("/peserta")}
                        isCollapsed={isCollapsed}
                    />

                    {!isCollapsed ? (
                        <div className="mt-4 pl-3 text-slate-500 text-sm font-bold tracking-wider">
                            PENJUALAN
                        </div>
                    ) : (
                        <div className="border-t-1 border-slate-200 mt-2 mx-2"></div>
                    )}

                    <SidebarItem
                        icon={<CreditCardIcon size={20} weight="fill" />}
                        label="Transaksi"
                        href="/pembayaran"
                        active={pathname.startsWith("/pembayaran")}
                        isCollapsed={isCollapsed}
                    />
                    <SidebarItem
                        icon={<TagIcon size={20} weight="fill" />}
                        label="Voucher"
                        href="/voucher"
                        active={pathname.startsWith("/voucher")}
                        isCollapsed={isCollapsed}
                    />
                </div>
                <div className={`mt-6 w-full flex flex-col items-center rounded-lg bg-white border-1 border-cuan-cyan shadow-[0px_2px_0px_#00B8F1] transition duration-200 ease-out hover:translate-y-[2px] hover:shadow-none`}>
                    <SidebarItem
                        icon={<StorefrontIcon size={20} weight="fill" />}
                        label="Katalog Saya"
                        href={catalogHref}
                        iconClassName="text-cuan-cyan"
                        textClassName="text-cuan-cyan font-semibold text-base"
                        isCollapsed={isCollapsed}
                    />
                </div>
            </div>
        </aside>
    );
}
