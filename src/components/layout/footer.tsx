"use client";

import { PhoneIcon, EnvelopeIcon, MapPinIcon } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
    return (
        <footer id="footer" className="w-full bg-[#16142F] text-white mt-auto">
            <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-12">
                <div className="flex flex-col md:flex-row justify-between items-start">
                    <div className="max-w-sm">
                        <div className="flex items-center mb-6">
                            <Link href="/">
                                <Image
                                    src="/logo-cuanin.svg"
                                    alt="CuanIN"
                                    width={100}
                                    height={30}
                                    className="h-10 w-auto object-contain"
                                />
                            </Link>
                        </div>
                        <p className="text-lg text-slate-200 leading-relaxed">
                            Ubah Keahlian Jadi Penghasilan
                        </p>
                        <div className="flex items-start gap-2 mt-3 text-sm text-slate-300">
                            <MapPinIcon size={16} className="mt-0.5 shrink-0" />
                            <span>Kompleks Mustika Griya Permai Blok E no 167, Kabupaten Banjar, Kalimantan Selatan</span>
                        </div>
                    </div>
                    <div className="w-full md:w-auto mt-8 md:mt-0">
                        <div className="flex flex-col gap-4 md:gap-6">
                            <h4 className="text-lg font-semibold m-0">Kontak Kami</h4>
                            <ul className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm text-slate-200">
                                <li className="flex items-center gap-2">
                                    <PhoneIcon size={16} />
                                    <span>+62 878 6573 1570</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <EnvelopeIcon size={16} />
                                    <span>cuanin9@gmail.com</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div className="py-6 md:py-8 bg-[#221F44] border-t border-white/20 text-sm text-white">
                <div className="max-w-6xl mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <span>&copy; {new Date().getFullYear()} CuanIN. All rights reserved.</span>
                    <span>Developed by CuanIN Team</span>
                </div>
            </div>
        </footer>
    );
}
