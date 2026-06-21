"use client";

import {
  StorefrontIcon,
  PackageIcon,
  CreditCardIcon,
  PencilSimpleIcon,
  UsersIcon,
  ChartBarIcon,
} from "@phosphor-icons/react";
import Star8 from "~/components/stars/s8";

export default function FeaturesSection() {
  const features: { title: string; desc: string; icon: React.ReactNode }[] = [
    { title: "Katalog Produk", desc: "Tampilkan layanan digitalmu dalam satu halaman katalog.", icon: <StorefrontIcon className="w-6 h-6 sm:w-8 sm:h-8" weight="fill" style={{ color: "var(--color-cuan-cyan)" }} /> },
    { title: "Manajemen Produk", desc: "Kelola seluruh produk dengan lebih mudah dan terorganisir..", icon: <PackageIcon className="w-6 h-6 sm:w-8 sm:h-8" weight="fill" style={{ color: "var(--color-cuan-blue)" }} /> },
    { title: "Payment Gateway", desc: "Permudah pembayaran pelanggan dengan berbagai metode.", icon: <CreditCardIcon className="w-6 h-6 sm:w-8 sm:h-8" weight="fill" style={{ color: "var(--color-cuan-cyan)" }} /> },
    { title: "Kustomisasi Form", desc: "Atur form sesuai informasi yang ingin dikumpulkan.", icon: <PencilSimpleIcon className="w-6 h-6 sm:w-8 sm:h-8" weight="fill" style={{ color: "var(--color-cuan-blue)" }} /> },
    { title: "Data Pembeli", desc: "Kelola dan pantau data pelanggan dalam satu tempat.", icon: <UsersIcon className="w-6 h-6 sm:w-8 sm:h-8" weight="fill" style={{ color: "var(--color-cuan-cyan)" }} /> },
    { title: "Dashboard Analitik", desc: "Analisis performa bisnis melalui dashboard real-time.", icon: <ChartBarIcon className="w-6 h-6 sm:w-8 sm:h-8" weight="fill" style={{ color: "var(--color-cuan-blue)" }} /> },
  ];

  return (
    <section id="fitur" className="w-full py-16 md:py-36 bg-cuan-blue/15 border-b-2 border-slate-800">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <h2 className="text-xl sm:text-3xl md:text-4xl font-semibold text-slate-800 mb-10 md:mb-20 text-center px-4 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          <Star8 size={28} className="text-yellow-300 animate-[pulse_0.8s_ease-in-out_infinite] hidden sm:block" stroke="black" strokeWidth={6} />
          <span>Semua yang kamu butuhkan ada di CuanIN</span>
          <Star8 size={28} className="text-yellow-300 animate-[pulse_0.8s_ease-in-out_infinite] hidden sm:block" stroke="black" strokeWidth={6} />
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className={`p-4 sm:p-6 rounded-xl border-2 border-slate-800 bg-white shadow-[2px_2px_0px_#000] transition-all duration-300 hover:-translate-y-2`}
            >
              <div className="mb-4 flex items-center justify-start">
                <div className={`p-3 sm:p-4 rounded-xl ${i % 2 === 0 ? "bg-cuan-cyan/20" : "bg-cuan-blue/20"}`}>
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-medium text-slate-800">{feature.title}</h3>
              <p className="mt-2 text-slate-600 font-regular text-sm sm:text-base">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
