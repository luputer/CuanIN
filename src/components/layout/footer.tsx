import { Phone, Envelope } from "phosphor-react";

export default function Footer() {
    return (
        <footer id="footer" className="w-full bg-cyan-950 text-white mt-auto">
            <div className="container mx-auto px-6 md:px-20 py-10 md:py-12">
                <div className="flex flex-col md:flex-row justify-between items-start gap-10 md:gap-8">
                    <div className="max-w-xs">
                        <h3 className="text-2xl font-bold text-yellow-200 mb-2">CuanIN</h3>
                        <p className="text-lg text-slate-200 leading-relaxed">
                            Ubah Keahlian Jadi Penghasilan
                        </p>
                    </div>
                    <div className="w-full md:w-auto">
                        <div className="flex flex-col gap-4 md:gap-6">
                            <h4 className="text-lg font-semibold m-0">Kontak Kami</h4>

                            <ul className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm text-slate-200">
                                <li className="flex items-center gap-2">
                                    <Phone size={16} />
                                    <span>+62 8123 4567 890</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Envelope size={16} />
                                    <span>cuanin9@gmail.com</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div className="py-6 md:py-8 border-t border-white/20 text-center text-sm text-white px-4">
                &copy; 2026 CuanIN. All rights reserved.
            </div>
        </footer>
    );
}