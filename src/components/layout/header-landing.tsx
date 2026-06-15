"use client";

import Link from "next/link";
import { useState } from "react";
import Button from "~/components/shared/buttonlogin";
import { ListIcon, XIcon } from "@phosphor-icons/react";

type HeaderProps = {
    buttonText: string;
    buttonHref: string;
};

const NAV_LINKS = [
    { label: "Tentang", href: "/#about" },
    { label: "Fitur", href: "/#fitur" },
    { label: "Cara Kerja", href: "/#cara-kerja" },
    { label: "Kontak", href: "/#footer" },
];

export default function HeaderLandingPage({ buttonText, buttonHref }: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full bg-white shadow-[0px_0px_4px_rgba(0,0,0,0.25)]">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5">

                {/* Logo */}
                <div className="text-yellow-500 text-2xl font-bold">
                    <Link href="/">CuanIN</Link>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-slate-800 font-medium text-md hover:text-cyan-600 transition-colors duration-200"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Right Side: Button + Hamburger */}
                <div className="flex items-center gap-3">
                    {/* Desktop Button */}
                    <div className="hidden md:block">
                        <Button text={buttonText} href={buttonHref} />
                    </div>

                    {/* Hamburger Button (Mobile) */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <XIcon size={24} /> : <ListIcon size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            <div
                className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
            >
                <nav className="flex flex-col px-4 pb-4 gap-1 border-t border-slate-100">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsMenuOpen(false)}
                            className="py-3 px-2 text-slate-700 font-medium text-sm hover:text-cyan-600 hover:bg-slate-50 rounded-lg transition-colors duration-200"
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="mt-3">
                        <Button text={buttonText} href={buttonHref} />
                    </div>
                </nav>
            </div>
        </header>
    );
}