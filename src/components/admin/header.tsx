"use client";
import { CaretDownIcon, UserIcon, SignOutIcon, ListIcon, BellIcon, CheckIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useEffect } from "react";
import Link from "next/link";
import { api } from "~/trpc/react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import PusherClient from "pusher-js";
import { useNotificationSound } from "~/hooks/shared/useNotificationSound";

function formatTimeAgo(date: Date | string) {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return format(d, "d MMM yyyy", { locale: id });
}

export default function HeaderAdmin({
    onMenuClick,
}: {
    onMenuClick?: () => void;
} = {}) {
    const [open, setOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const { data: session } = useSession();

    // Sync with the latest database info to reflect manual profile changes
    const { data: userProfile } = api.profile.get.useQuery(undefined, {
        enabled: !!session?.user,
    });

    const { data: notifData, refetch: refetchNotif } = api.notification.list.useQuery(undefined, {
        enabled: !!session?.user,
    });
    const markReadMutation = api.notification.markRead.useMutation({
        onSuccess: () => refetchNotif(),
    });

    const notifications = notifData?.items ?? [];
    const unreadCount = notifData?.unreadCount ?? 0;

    const user = userProfile ?? session?.user;

    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);

    // Sound effect untuk notifikasi baru
    const { play: playNotifSound } = useNotificationSound();
    const prevUnreadCount = useRef(unreadCount);
    useEffect(() => {
        if (prevUnreadCount.current === undefined) {
            prevUnreadCount.current = unreadCount;
            return;
        }
        if (unreadCount > prevUnreadCount.current) {
            playNotifSound();
        }
        prevUnreadCount.current = unreadCount;
    }, [unreadCount, playNotifSound]);

    // Pusher realtime
    useEffect(() => {
        if (!session?.user?.id) return;

        const pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        });

        const channel = pusherClient.subscribe(`user-${session.user.id}`);

        channel.bind("new-notification", () => {
            void refetchNotif();
        });

        return () => {
            channel.unbind_all();
            pusherClient.unsubscribe(`user-${session.user.id}`);
            pusherClient.disconnect();
        };
    }, [session?.user?.id, refetchNotif]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
            if (
                notifRef.current &&
                !notifRef.current.contains(event.target as Node)
            ) {
                setNotifOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <header className="sticky top-0 z-50 bg-white px-4 sm:px-6 py-3 flex items-center justify-between border-b border-slate-800">
            {/* Hamburger Menu Button */}
            <button
                onClick={onMenuClick}
                className="p-2 -ml-2 rounded-lg text-slate-700 hover:bg-slate-100 border border-transparent hover:border-slate-300 transition cursor-pointer"
            >
                <ListIcon size={24} weight="bold" />
            </button>

            <div className="flex items-center gap-3">
                {/* Notification Bell */}
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

                    {/* Dropdown */}
                    {notifOpen && (
                        <div className="absolute right-0 top-12 w-[340px] bg-white border border-slate-800 rounded-xl shadow-[0px_1.5px_0px_#000] overflow-hidden z-50">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                                <span className="font-semibold text-sm text-slate-800">Notifikasi Terbaru</span>
                                {unreadCount > 0 && (
                                    <span className="text-[11px] font-bold bg-cuan-cyan/10 text-cuan-cyan border border-cuan-cyan rounded-full px-2 py-0.5">
                                        {unreadCount} Unread
                                    </span>
                                )}
                            </div>
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
                                href="/admin/notifikasi"
                                onClick={() => setNotifOpen(false)}
                                className="flex items-center justify-center gap-1 w-full border-t border-slate-200 px-4 py-2.5 text-xs font-medium text-cuan-blue hover:bg-slate-50 transition-colors"
                            >
                                Lihat Semua Notifikasi
                                <ArrowRightIcon size={12} weight="bold" />
                            </Link>
                        </div>
                    )}
                </div>

                <div className="relative w-60" ref={dropdownRef}>

                    {/* Profile */}
                    <div
                        onClick={() => setOpen(!open)}
                        className="flex items-center justify-between cursor-pointer border border-slate-800 rounded-full py-2 px-4 w-full gap-3 transition-transform duration-150 active:scale-95 select-none"
                    >
                        <div className="flex items-center gap-2">
                            {user?.image ? (
                                <Image
                                    src={user.image}
                                    alt={user.name ?? "User"}
                                    width={32}
                                    height={32}
                                    className="rounded-full object-cover w-8 h-8 aspect-square shrink-0"
                                    unoptimized
                                />
                            ) : (
                                <div className="w-8 h-8 p-1 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs uppercase">
                                    {user?.name?.[0] ?? "U"}
                                </div>
                            )}
                            <span className="text-sm font-regular text-slate-800 truncate max-w-30">
                                {user?.name ?? "User"}
                            </span>
                        </div>

                        <CaretDownIcon size={16} className={`text-slate-600 transition-transform duration-200 ${open ? "rotate-180" : ""}`} suppressHydrationWarning />

                    </div>

                    {/* Dropdown */}
                    {open && (
                        <div className="absolute left-1/2 top-14 -translate-x-1/2 w-56 bg-white border border-slate-800 rounded-xl shadow-[0px_1.5px_0px_#000] py-2 px-3">

                            {/* Akun Saya */}
                            <button
                                onClick={() => router.push('/admin/profile')}
                                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-cuan-blue/10 hover:text-cuan-blue transition cursor-pointer"
                            >
                                <UserIcon size={20} />
                                <span>Akun Saya</span>
                            </button>

                            {/* Divider */}
                            <div className="my-2 border-t border-slate-400"></div>

                            {/* Logout */}
                            <button
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
