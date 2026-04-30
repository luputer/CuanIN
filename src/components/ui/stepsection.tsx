import { useState } from "react";
import { CaretDownIcon } from "@phosphor-icons/react";

export default function StepsSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const steps: { title: string; desc: string }[] = [
        { title: "Buat Akun", desc: "Mulai dengan mendaftarkan akunmu secara gratis dan cepat." },
        { title: "Tambahkan Produk", desc: "Buat webinar, kelas, atau produk digital lainnya sesuai kebutuhanmu." },
        { title: "Bagikan Link", desc: "Sebarkan link halaman produk ke audiens kamu." },
        { title: "Terima Pembayaran", desc: "Pembeli melakukan pembayaran tanpa proses manual." }
    ];

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="relative w-full py-20 overflow-hidden">
            <div className="relative z-10 max-w-6xl mx-auto px-6">
                <h2 className="text-4xl font-semibold text-slate-800 mb-10">Hanya Butuh 4 Langkah untuk Mulai Jualan</h2>

                <div className="space-y-5">
                    {steps.map((step: { title: string; desc: string }, index: number) => (
                        <div key={index} className="bg-white">
                            <button
                                onClick={() => toggle(index)}
                                className="w-full flex justify-between items-center py-2 text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 flex items-center justify-center rounded-full bg-cyan-600 text-3xl text-white font-semibold border-2 border-slate-800 shadow-[2px_2px_0px_rgba(29,41,61)]">
                                        {index + 1}
                                    </div>
                                    <span className="px-2 text-2xl font-medium text-slate-800">{step.title}</span>
                                </div>
                                <span className={`transition-transform duration-300 text-slate-800 ${openIndex === index ? "rotate-180" : ""}`}>
                                    <CaretDownIcon size={24} />
                                </span>
                            </button>

                            {openIndex === index && (
                                <div className="py-2">
                                    <p className="text-slate-600 font-regular text-lg">{step.desc}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}