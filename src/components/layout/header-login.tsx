"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "~/components/shared/buttonlogin";
import Image from "next/image";

export default function HeaderLogin() {
    const pathname = usePathname();

    // Jika sedang di halaman sign-in, tombolnya adalah Daftar. 
    // Untuk halaman lain (sign-up, forgot-password, dll), tombolnya Login.
    const buttonText = pathname === "/sign-in" ? "Daftar" : "Login";
    const buttonHref = pathname === "/sign-in" ? "/sign-up" : "/sign-in";

    return (
        <header className="sticky top-0 z-[100] w-full bg-white border-b-2 border-slate-800 max-w-8xl mx-auto">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6">
                {/* Logo */}
                <div className="flex items-center">
                    <Link href="/">
                        <Image
                            src="/logo-cuanin.svg"
                            alt="CuanIN"
                            width={120}
                            height={40}
                            className="h-10 w-auto object-contain"
                        />
                    </Link>
                </div>
                {/* Button */}
                <div>
                    <Button text={buttonText} href={buttonHref} />
                </div>
            </div>
        </header>
    );
}
