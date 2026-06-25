"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Button from "~/components/shared/buttonlogin";

export default function HeaderLogin() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const buttonText = pathname === "/sign-in" ? "Daftar" : "Login";
    const buttonHref = pathname === "/sign-in" ? "/sign-up" : "/sign-in";

    return (
        <header className="sticky top-0 z-[100] w-full bg-white border-b-2 border-slate-800 max-w-8xl mx-auto transition-all duration-300">
            <div className={`mx-auto flex max-w-7xl items-center justify-between px-4 transition-all duration-300 ${scrolled ? "py-3" : "py-6"}`}>
                {/* Logo */}
                <div className="flex items-center">
                    <Link href="/">
                        <img
                            src="/logo-cuanin.svg"
                            alt="CuanIN"
                            width={120}
                            height={40}
                            className={`w-auto object-contain transition-all duration-300 ${scrolled ? "h-7" : "h-10"}`}
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
