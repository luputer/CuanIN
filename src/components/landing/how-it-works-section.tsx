"use client";

import { useState, useEffect, useRef } from "react";
import { StepsIllustrationMockup } from "~/components/landing/feature-mockups";
import { CaretDownIcon } from "@phosphor-icons/react";

const steps: { title: string; desc: string }[] = [
    { title: "Buat Akun", desc: "Mulai dengan mendaftarkan akunmu secara gratis and cepat." },
    { title: "Tambahkan Produk", desc: "Buat webinar, kelas, atau produk digital lainnya sesuai kebutuhanmu." },
    { title: "Bagikan Link", desc: "Sebarkan link halaman produk ke audiens kamu." },
    { title: "Terima Pembayaran", desc: "Pembeli melakukan pembayaran tanpa proses manual." }
];

function StepsSection({ activeStep, setActiveStep }: { activeStep: number; setActiveStep: (index: number) => void }) {
    return (
        <div className="space-y-4 w-full">
            {steps.map((step: { title: string; desc: string }, index: number) => {
                const isSelected = activeStep === index;
                const isCyan = index % 2 === 0;

                return (
                    <div
                        key={index}
                        className={`relative overflow-hidden pb-4 pt-3 px-4 sm:pb-6 sm:pt-4 sm:px-6 mr-0 lg:mr-10 rounded-xl border-1 transition-all duration-300 cursor-pointer ${isSelected
                            ? (isCyan ? "border-slate-800 bg-cuan-cyan/10 shadow-[2px_2px_0px_#000]" : "border-slate-800 bg-cuan-blue/10 shadow-[2px_2px_0px_#000]")
                            : "bg-white hover:border-slate-400"
                            }`}
                    >
                        <button
                            onClick={() => setActiveStep(index)}
                            className="w-full flex justify-between items-center text-left cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center text-white border-slate-800 text-lg sm:text-2xl rounded-full font-medium border-2 transition-all duration-300 shrink-0 ${isCyan ? "bg-cuan-cyan" : "bg-cuan-blue"}`}>
                                    {index + 1}
                                </div>
                                <span className={`text-base sm:text-xl font-semibold transition-colors ${isSelected ? "text-slate-800" : "text-slate-800"
                                    }`}>
                                    {step.title}
                                </span>
                            </div>
                            <span className={`transition-transform duration-300 ${isSelected ? "rotate-180 text-slate-800" : "text-slate-400"
                                }`}>
                                <CaretDownIcon size={20} />
                            </span>
                        </button>

                        <div className={`grid transition-all duration-300 ${isSelected ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                            }`}>
                            <div className="overflow-hidden">
                                <p className="text-slate-600 font-regular text-sm sm:text-base leading-relaxed pl-14 sm:pl-18">
                                    {step.desc}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function HowItWorksSection() {
    const [activeStep, setActiveStep] = useState(0);
    const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

    const startAutoPlay = () => {
        stopAutoPlay();
        autoPlayRef.current = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % steps.length);
        }, 3000); // Change step every 3 seconds
    };

    const stopAutoPlay = () => {
        if (autoPlayRef.current) {
            clearInterval(autoPlayRef.current);
        }
    };

    useEffect(() => {
        startAutoPlay();
        return () => stopAutoPlay();
    }, []);

    const handleStepChange = (index: number) => {
        setActiveStep(index);
        startAutoPlay(); // Reset timer on manual change
    };

    return (
        <section id="cara-kerja" className="bg-white py-12 md:py-32 w-full">
            <div className="max-w-6xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-[auto_1fr] gap-x-12 gap-y-4 items-start">

                {/* 1. JUDUL - Menempel di baris 1 kanan */}
                <div className="order-1 lg:col-start-2 lg:row-start-1">
                    <h2 className="text-xl sm:text-3xl md:text-4xl font-semibold text-slate-800 mb-6 lg:mb-8 text-center lg:text-left">
                        Hanya Butuh 4 Langkah untuk Mulai Jualan
                    </h2>
                </div>

                {/* 2. MOCKUP - Tetap di kiri, memakan 2 baris (Judul + Steps) */}
                <div className="hidden md:flex order-2 lg:col-start-1 lg:row-start-1 lg:row-span-2 w-full sm:h-[450px] lg:h-[600px] items-center justify-center">
                    <StepsIllustrationMockup activeStep={activeStep} />
                </div>

                {/* 3. STEPS - Menempel tepat di bawah judul di baris 2 kanan */}
                <div className="order-3 lg:col-start-2 lg:row-start-2 w-full">
                    <StepsSection activeStep={activeStep} setActiveStep={handleStepChange} />
                </div>

            </div>
        </section>
    );
}
