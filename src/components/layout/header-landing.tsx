"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
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
    { label: "FAQ", href: "/#faq" },
    { label: "Kontak", href: "/#footer" },

];

export default function HeaderLandingPage({ buttonText, buttonHref }: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("");

    useEffect(() => {
        const handleScroll = () => {
            const sections = NAV_LINKS.map((link) => link.href.split("#")[1]).filter((s): s is string => !!s);
            let current = "";

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top <= 300) {
                        current = section;
                    }
                }
            }

            // Cek jika sudah scroll ke bagian paling bawah halaman
            if (window.innerHeight + Math.round(window.scrollY) >= document.body.offsetHeight - 50) {
                current = sections[sections.length - 1] || "";
            }

            if (current) {
                setActiveSection(current);
            }
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll(); // Set active section saat pertama kali mount

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

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

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {NAV_LINKS.map((link) => {
                        const sectionId = link.href.split("#")[1];
                        const isActive = activeSection === sectionId;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-md font-medium transition-colors duration-200 ${isActive ? "text-cuan-blue" : "text-slate-800 hover:text-cuan-blue"}`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
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
                    {NAV_LINKS.map((link) => {
                        const sectionId = link.href.split("#")[1];
                        const isActive = activeSection === sectionId;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className={`py-3 px-2 text-sm font-medium rounded-lg transition-colors duration-200 ${isActive ? "text-cuan-cyan bg-cuan-cyan/10" : "text-slate-700 hover:text-cuan-cyan hover:bg-slate-50"}`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                    <div className="mt-3">
                        <Button text={buttonText} href={buttonHref} />
                    </div>
                </nav>
            </div>
        </header>
    );
}
