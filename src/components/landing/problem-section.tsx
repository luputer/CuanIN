"use client";

import { UsersThreeIcon, CreditCardIcon, GridFourIcon, ChartBarIcon, ArrowRightIcon } from "@phosphor-icons/react";

export default function ProblemSection() {
  return (
    <section className="w-full py-16 md:py-32 border-b-2 border-slate-800 relative">
      <div className="max-w-6xl mx-auto px-1 sm:px-6 text-center">

        <h2 className="text-xl sm:text-3xl md:text-4xl font-semibold text-slate-800 mb-12 md:mb-20 relative inline-block">
          Masalah yang Sering Terjadi
          <svg className="absolute -bottom-6 left-0 w-full h-4 text-cyan-500" viewBox="0 0 200 20" preserveAspectRatio="none">
            <path d="M5 15 C 60 5, 140 5, 195 15" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 md:gap-14 lg:gap-12 xl:gap-24 justify-items-center relative">
          {[
            {
              icon: <GridFourIcon weight="fill" className="text-white w-7 h-7 sm:w-12 sm:h-12" stroke="black" strokeWidth={8} />,
              text: "Ribet Karena Banyak Platform",
            },
            {
              icon: <UsersThreeIcon weight="fill" className="text-white w-7 h-7 sm:w-12 sm:h-12" stroke="black" strokeWidth={8} />,
              text: "Data Pendaftaran Berantakan",
            },
            {
              icon: <CreditCardIcon weight="fill" className="text-white w-7 h-7 sm:w-12 sm:h-12" stroke="black" strokeWidth={8} />,
              text: "Cek Pembayaran Manual",
            },
            {
              icon: <ChartBarIcon weight="fill" className="text-white w-7 h-7 sm:w-12 sm:h-12" stroke="black" strokeWidth={8} />,
              text: "Sulit Melihat Analitik dan Laporan",
            },
          ].map((item, i) => (
            <div key={i} className="relative flex flex-col items-center w-full max-w-[160px] sm:max-w-[240px] text-center transition-all duration-300 hover:-translate-y-2">
              {/* Panah (Hanya terlihat di layar lg ke atas, di antara item) */}
              {i < 3 && (
                <div className="hidden lg:flex absolute -right-[40px] xl:-right-[60px] top-12 items-center text-slate-800">
                  <ArrowRightIcon size={40} weight="bold" />
                </div>
              )}

              <div className={`w-14 h-14 sm:w-24 sm:h-24 flex items-center justify-center rounded-full border-2 border-slate-800 shadow-[2px_2px_0px_#000] ${i % 2 === 0 ? "bg-cuan-cyan/80" : "bg-cuan-blue/80"}`}>
                <div className="text-white text-xl sm:text-3xl">
                  {item.icon}
                </div>
              </div>
              <p className="mt-3 sm:mt-6 text-slate-800 text-xs sm:text-xl font-medium leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
      {/* Badge Overlay */}
      <div className="absolute -bottom-6 left-0 w-full text-center z-20">
        <div className="inline-block px-5 sm:px-6 md:px-8 py-2 rounded-full bg-white text-xs sm:text-sm md:text-xl text-slate-800 font-semibold border-2 border-slate-800 shadow-[1px_1px_0px_#000] animate-wiggle">
          Tapi tenang aja, karena...
        </div>
      </div>
    </section>
  );
}

