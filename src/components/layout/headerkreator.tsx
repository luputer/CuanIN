"use client";
import { CaretDown, User, SignOut } from "phosphor-react";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useEffect } from "react";
import { api } from "~/trpc/react";

export default function HeaderKreator() {
    const [open, setOpen] = useState(false);
    const { data: session } = useSession();

    // Sync with the latest database info to reflect manual profile changes
    const { data: userProfile } = api.profile.get.useQuery(undefined, {
        enabled: !!session?.user,
    });

    const user = userProfile ?? session?.user;

    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <header className="sticky top-0 z-50 bg-white shadow px-12 py-3 flex items-center justify-end border-b-2 border-indigo-950">

            <div className="flex items-center gap-4">

                <div className="relative w-50" ref={dropdownRef}>

                    {/* Profile */}
                    <div
                        onClick={() => setOpen(!open)}
                        className="flex items-center justify-between cursor-pointer border-2 border-indigo-950 rounded-full py-2 px-4 w-full gap-3 shadow-[0px_2px_0px_rgba(30,27,75)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition duration-200 ease-out"
                    >
                        <div className="flex items-center gap-2">
                            {user?.image ? (
                                <Image
                                    src={user.image}
                                    alt={user.name ?? "User"}
                                    width={32}
                                    height={32}
                                    className="rounded-full object-cover"
                                    unoptimized
                                />
                            ) : (
                                <div className="w-8 h-8 p-1 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs uppercase">
                                    {user?.name?.[0] ?? "U"}
                                </div>
                            )}
                            <span className="text-sm font-regular text-indigo-950 truncate max-w-[120px]">
                                {user?.name ?? "User"}
                            </span>
                        </div>

                        <CaretDown size={16} className="text-slate-600" />

                    </div>

                    {/* Dropdown */}
                    {open && (
                        <div className="absolute left-1/2 top-14 -translate-x-1/2 w-48 bg-white border border-indigo-950 rounded-xl shadow-[0px_3px_0px_rgba(30,27,75)] py-2 px-3 mt-1">

                            {/* Akun Saya */}
                            <button
                                onClick={() => router.push('profile')}
                                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 transition"
                            >
                                <User size={20} />
                                <span>Akun Saya</span>
                            </button>

                            {/* Divider */}
                            <div className="my-2 border-t border-slate-400"></div>

                            {/* Logout */}
                            <button
                                onClick={() => signOut({ callbackUrl: "/sign-in" })}
                                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 transition"
                            >
                                <SignOut size={20} />
                                <span>Logout</span>
                            </button>

                        </div>
                    )}

                </div>

            </div>
        </header>
    );
}