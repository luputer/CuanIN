"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "~/components/ui/buttonlogin";

export default function HeaderLogin() {
    const pathname = usePathname();

    // Jika sedang di halaman sign-in, tombolnya adalah Daftar. 
    // Untuk halaman lain (sign-up, forgot-password, dll), tombolnya Login.
    const buttonText = pathname === "/sign-in" ? "Daftar" : "Login";
    const buttonHref = pathname === "/sign-in" ? "/sign-up" : "/sign-in";

    return (
        <header className="sticky top-0 z-50 w-full bg-white shadow-[0px_0px_4px_rgba(0,0,0,0.25)]">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5">
                {/* Logo */}
                <div className="text-yellow-500 text-2xl font-bold">
                    <Link href="/">CuanIN</Link>
                </div>

                {/* Button */}
                <div>
                    <Button text={buttonText} href={buttonHref} />
                </div>
            </div>
        </header>
    );
}