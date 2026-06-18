"use client";

import { UsersThreeIcon, CreditCardIcon, GridFourIcon, ChartBarIcon } from "@phosphor-icons/react";

export default function ProblemSection() {
  return (
    <section className="py-20 md:py-40 bg-white w-full mt-10 md:mt-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-800 mb-12 md:mb-20">
          Masalah yang Sering Terjadi
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 xl:gap-20 justify-items-center">
          {[
            {
              icon: <GridFourIcon size={56} weight="fill" />,
              text: "Ribet Karena Banyak Platform",
            },
            {
              icon: <UsersThreeIcon size={56} weight="fill" />,
              text: "Data Peserta Berantakan",
            },
            {
              icon: <CreditCardIcon size={56} weight="fill" />,
              text: "Konfirmasi Pembayaran Manual",
            },
            {
              icon: <ChartBarIcon size={56} weight="fill" />,
              text: "Sulit Melihat Analitik dan Laporan",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-center w-full max-w-[240px] text-center transition-all duration-300 hover:-translate-y-2"
            >
              <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center rounded-full bg-cyan-600 border-2 border-slate-800 shadow-[2px_3px_0px_rgba(29,41,61)]">
                <div className="text-white text-3xl">
                  {item.icon}
                </div>
              </div>
              <p className="mt-6 text-slate-800 text-lg sm:text-xl font-medium leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
