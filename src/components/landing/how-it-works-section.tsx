"use client";

import { useState } from "react";
import { StepsIllustrationMockup } from "~/components/landing/feature-mockups";
import { CaretDownIcon } from "@phosphor-icons/react";

function StepsSection({ activeStep, setActiveStep }: { activeStep: number; setActiveStep: (index: number) => void }) {
    const steps: { title: string; desc: string }[] = [
        { title: "Buat Akun", desc: "Mulai dengan mendaftarkan akunmu secara gratis dan cepat." },
        { title: "Tambahkan Produk", desc: "Buat webinar, kelas, atau produk digital lainnya sesuai kebutuhanmu." },
        { title: "Bagikan Link", desc: "Sebarkan link halaman produk ke audiens kamu." },
        { title: "Terima Pembayaran", desc: "Pembeli melakukan pembayaran tanpa proses manual." }
    ];

    return (
        <section className="relative w-full py-10 overflow-hidden">
            <div className="relative z-10 max-w-6xl mx-auto px-6">
                <h2 className="text-4xl font-semibold text-slate-800 mb-10">Hanya Butuh 4 Langkah untuk Mulai Jualan</h2>

                <div className="space-y-4">
                    {steps.map((step: { title: string; desc: string }, index: number) => {
                        const isSelected = activeStep === index;
                        return (
                            <div
                                key={index}
                                className={`py-4 px-6 rounded-xl border-1 transition-all duration-300 cursor-pointer ${isSelected
                                    ? "border-cyan-600 bg-cyan-50"
                                    : "bg-white hover:border-cyan-600"
                                    }`}
                            >
                                <button
                                    onClick={() => setActiveStep(index)}
                                    className="w-full flex justify-between items-center text-left cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 flex items-center justify-center bg-cyan-600 text-white border-slate-800 text-2xl rounded-full font-medium border-2 transition-all duration-300 shrink-0`}>
                                            {index + 1}
                                        </div>
                                        <span className={`text-2xl font-semibold transition-colors ${isSelected ? "text-slate-800" : "text-slate-800"
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
                                        <p className="text-slate-600 font-regular text-base leading-relaxed pl-18">
                                            {step.desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="cara-kerja" className="py-20 md:py-30 bg-white w-full">
      <div className="max-w-6xl mx-auto px-4 md:px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-10">
        {/* KIRI - IMAGE */}
        <div className="size-full lg:w-1/2 sm:h-[400px] lg:h-[600px] bg-cyan-50 flex items-center justify-center rounded-xl border-2 border-slate-800 shadow-[2px_2px_0px_rgba(29,41,61)] order-2 lg:order-1">
          <StepsIllustrationMockup activeStep={activeStep} />
        </div>

        {/* KANAN - STEPS SECTION */}
        <div className="w-full lg:w-1/2 order-1 lg:order-2">
          <StepsSection activeStep={activeStep} setActiveStep={setActiveStep} />
        </div>
      </div>
    </section>
  );
}
