"use client";
import { ArrowRightIcon, BellIcon, CaretDownIcon, CheckIcon, ListIcon, ShoppingBagIcon, SignOutIcon, UserIcon } from "@phosphor-icons/react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import PusherClient from "pusher-js";
import { useEffect, useRef, useState } from "react";
import { useNotificationSound } from "~/hooks/shared/useNotificationSound";
import { api } from "~/trpc/react";

export default function HeaderKreator({
    onMenuClick,
}: {
    onMenuClick?: () => void;
} = {}) {
    const [open, setOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const { data: session } = useSession();

    const { play: playNotifSound } = useNotificationSound();
    const prevUnreadCount = useRef<number | null>(null);


    const { data: userProfile } = api.profile.get.useQuery(undefined, {
        enabled: !!session?.user,
    });

    const { data: notifData, refetch } = api.notification.list.useQuery(undefined, {
        enabled: !!session?.user,

    });
    const markReadMutation = api.notification.markRead.useMutation({ onSuccess: () => refetch() });
    // const markAllReadMutation = api.notification.markAllRead.useMutation({ onSuccess: () => refetch() });

    const notifications = notifData?.items ?? [];
    const unreadCount = notifData?.unreadCount ?? 0;

    const user = userProfile ?? session?.user;
    const dropdownRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setNotifOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (prevUnreadCount.current === null) {
            // Skip pertama kali, cuma set initial value
            prevUnreadCount.current = unreadCount;
            return;
        }
        if (unreadCount > prevUnreadCount.current) {
            playNotifSound();
        }
        prevUnreadCount.current = unreadCount;
    }, [unreadCount, playNotifSound]);


    // Taruh setelah useEffect sound, sebelum formatTimeAgo
    useEffect(() => {
        if (!session?.user?.id) return;

        const pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        });

        const channel = pusherClient.subscribe(`user-${session.user.id}`);

        channel.bind("new-notification", () => {
            // Refetch tRPC query biar data fresh
            void refetch();
        });

        return () => {
            channel.unbind_all();
            pusherClient.unsubscribe(`user-${session.user.id}`);
            pusherClient.disconnect();
        };
    }, [session?.user?.id, refetch]);

    function formatTimeAgo(date: Date): string {
        const diff = Date.now() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        if (days > 0) return `${days} days ago`;
        if (hours > 0) return `${hours} hours ago`;
        return "Just now";
    }

    return (
        <header className="sticky top-0 z-50 bg-white px-4 sm:px-6 py-3 flex items-center justify-between border-b border-slate-800">
            {/* Hamburger */}
            <button
                type="button"
                onClick={onMenuClick}
                className="p-2 -ml-2 rounded-lg text-slate-700 hover:bg-slate-100 border border-transparent hover:border-slate-300 transition cursor-pointer"
            >
                <ListIcon size={24} weight="bold" />
            </button>

            <div className="flex items-center gap-3">
                {/* ── Notification Bell ── */}
                <div className="relative" ref={notifRef}>
                    <button
                        type="button"
                        onClick={() => { setNotifOpen(!notifOpen); setOpen(false); }}
                        className="relative p-2 rounded-full border border-slate-800 text-slate-700 hover:bg-slate-100 transition cursor-pointer active:scale-95"
                        aria-label="Notifikasi"
                    >
                        <BellIcon size={22} weight="bold" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-cuan-cyan text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {notifOpen && (
                        <div className="absolute right-0 top-12 w-[340px] bg-white border border-slate-800 rounded-xl shadow-[0px_1.5px_0px_#000] overflow-hidden z-50">
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                                <span className="font-semibold text-sm text-slate-800">Notifikasi Terbaru</span>
                                {unreadCount > 0 && (
                                    <span className="text-[11px] font-bold bg-cuan-cyan/10 text-cuan-cyan border border-cuan-cyan rounded-full px-2 py-0.5">
                                        {unreadCount} Unread
                                    </span>
                                )}
                            </div>

                            {/* Notification List */}
                            <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-100">
                                {notifications.length === 0 ? (
                                    <p className="text-sm text-slate-500 text-center py-8">Tidak ada notifikasi</p>
                                ) : (
                                    notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            className={`px-4 py-3 transition hover:bg-slate-50 ${!notif.isRead ? "bg-blue-50/40" : ""}`}
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-0.5">
                                                <span className="text-sm font-medium text-slate-800 leading-snug">
                                                    {notif.title}
                                                </span>
                                                <span className="text-[11px] text-slate-400 whitespace-nowrap mt-0.5 shrink-0">
                                                    {formatTimeAgo(notif.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                                                {notif.message}
                                            </p>
                                            {!notif.isRead && (
                                                <button
                                                    type="button"
                                                    onClick={() => markReadMutation.mutate({ id: notif.id })}
                                                    className="mt-1.5 flex items-center gap-1 text-xs font-medium text-cuan-blue hover:underline cursor-pointer"
                                                >
                                                    <CheckIcon size={12} weight="bold" />
                                                    Tandai Dibaca
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Lihat Semua */}
                            <Link
                                href="/notifikasi"
                                onClick={() => setNotifOpen(false)}
                                className="flex items-center justify-center gap-1 w-full border-t border-slate-200 px-4 py-2.5 text-xs font-medium text-cuan-blue hover:bg-slate-50 transition-colors"
                            >
                                Lihat Semua Notifikasi
                                <ArrowRightIcon size={12} weight="bold" />
                            </Link>
                        </div>
                    )}
                </div>

                {/* ── Profile Dropdown ── */}
                <div className="relative w-60" ref={dropdownRef}>
                    <div
                        onClick={() => { setOpen(!open); setNotifOpen(false); }}
                        className="flex items-center justify-between cursor-pointer border border-slate-800 rounded-full py-2 px-4 w-full gap-3 transition-transform duration-150 active:scale-95 select-none"
                    >
                        <div className="flex items-center gap-2">
                            {user?.image ? (
                                <Image
                                    src={user.image}
                                    alt={user.name ?? "User"}
                                    width={32}
                                    height={32}
                                    className="rounded-full object-cover size-8 aspect-square shrink-0"
                                    unoptimized
                                />
                            ) : (
                                <div className="size-8 p-1 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs uppercase">
                                    {user?.name?.[0] ?? "U"}
                                </div>
                            )}
                            <span className="text-sm font-regular text-slate-800 truncate max-w-30">
                                {user?.name ?? "User"}
                            </span>
                        </div>
                        <CaretDownIcon
                            size={16}
                            className={`text-slate-600 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                            suppressHydrationWarning
                        />
                    </div>

                    {open && (
                        <div className="absolute left-1/2 top-14 -translate-x-1/2 w-56 bg-white border border-slate-800 rounded-xl shadow-[0px_1.5px_0px_#000] py-2 px-3 z-50">
                            <Link
                                href="/profile"
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-cuan-blue/10 hover:text-cuan-blue transition cursor-pointer"
                            >
                                <UserIcon size={20} />
                                <span>Akun Saya</span>
                            </Link>

                            {/* Portal Pelanggan */}
                            <Link
                                href="/portal/dashboard?ref=/dashboard"
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-cuan-blue/10 hover:text-cuan-blue transition cursor-pointer"
                            >
                                <ShoppingBagIcon size={20} />
                                <span>Portal Pelanggan</span>
                            </Link>
                            <div className="my-2 border-t border-slate-400" />
                            <button
                                type="button"
                                onClick={() => signOut({ callbackUrl: "/sign-in" })}
                                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-cuan-blue/10 hover:text-cuan-blue transition cursor-pointer"
                            >
                                <SignOutIcon size={20} />
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}