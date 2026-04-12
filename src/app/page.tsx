"use client";
import Image from "next/image";
import Button from "~/components/ui/buttonlogin";
import HeaderLandingPage from "~/components/layout/headerlandingpage";
import StepsSection from "~/components/ui/stepsection";
import Footer from "~/components/layout/footer";
import { UsersThree, CreditCard, GridFour, ChartBar } from "phosphor-react";
import Figure6 from "public/assets/Figure6.png";
import Figure10 from "public/assets/Figure10.png";
import Figure11 from "public/assets/Figure11.png";

export default function FormateLanding() {
  return (
    <>
      <HeaderLandingPage buttonText="Login" buttonHref="/sign-in" />

      <main id="about" className="flex min-h-screen flex-col items-center justify-center bg-white text-white overflow-hidden">
        {/* Hero Section */}
        <section className="relative mt-30 max-w-7xl mx-auto px-6 text-center">
          <div className="absolute top-25 left-[-130px] w-20 h-auto transform -translate-y-1/2">
            <Image src={Figure6} alt="Figure 8" className="w-full h-auto object-contain" />
          </div>

          <div className="absolute top-40 right-[-120px] w-20 h-auto transform -translate-y-1/2">
            <Image src={Figure6} alt="Figure 12" className="w-full h-auto object-contain" />
          </div>
          <h1 className="text-5xl md:text-5xl font-semibold text-indigo-950 leading-tight">
            Jual Webinar, Kelas dan Produk Digital
          </h1>
          <span className="text-5xl md:text-5xl font-semibold text-indigo-950 leading-tight">
            Tanpa Ribet!
          </span>
          <p className="text-xl text-slate-600 mt-4 mb-10 max-w-5xl mx-auto">
            Buat form pendaftaran, jual produk, terima pembayaran - semua dalam satu platform.
          </p>
          <div className="mb-10">
            <Button text="Mulai Gratis" href="/sign-in" />
          </div>
        </section>

        {/* Dashboard Preview Section */}
        <section className="relative mt-12 md:mt-16 w-full max-w-6xl mx-auto px-4 sm:px-6 mb-20 md:mb-10">
          <div className="w-full h-[300px] sm:h-[450px] lg:h-[640px] border-2 border-indigo-950 rounded-xl flex items-center justify-center bg-cyan-50 shadow-[0px_3px_0px_rgba(30,27,75)] relative z-10">
            <p className="text-slate-400">Image Preview</p>
          </div>

          {/* Kotak kecil (overlap) */}
          <div className="w-[90%] lg:w-full max-w-4xl absolute -bottom-16 md:-bottom-10 left-1/2 flex -translate-x-1/2 items-center justify-center rounded-xl border-2 border-indigo-950 bg-yellow-200 py-6 md:py-10 px-4 text-center shadow-[0px_5px_0px_rgba(30,27,75)] z-20">
            {/* Dekorasi atas kiri */}
            <div className="hidden sm:block absolute top-[-15px] left-[-15px] md:left-[-20px] w-12 h-12 md:w-16 md:h-16">
              <Image src={Figure10} alt="Decor Top Left" className="w-full h-full object-contain" />
            </div>

            {/* Dekorasi bawah kanan */}
            <div className="hidden sm:block absolute bottom-[-15px] right-[-15px] md:right-[-20px] w-12 h-12 md:w-16 md:h-16">
              <Image src={Figure10} alt="Decor Bottom Right" className="w-full h-full object-contain" />
            </div>

            {/* Konten text */}
            <div className="text-2xl sm:text-3xl lg:text-4xl font-medium text-indigo-950 px-2 lg:px-8">
              “Ubah Keahlian Jadi Penghasilan”
            </div>
          </div>
        </section>

        {/* Masalah yang Sering Terjadi Section */}
        <section className="py-20 md:py-40 bg-white w-full mt-10 md:mt-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-indigo-950 mb-12 md:mb-20">
              Masalah yang Sering Terjadi
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 xl:gap-20 justify-items-center">
              {[
                {
                  icon: <GridFour size={56} weight="fill" />,
                  text: "Ribet Karena Banyak Platform",
                },
                {
                  icon: <UsersThree size={56} weight="fill" />,
                  text: "Data Peserta Berantakan",
                },
                {
                  icon: <CreditCard size={56} weight="fill" />,
                  text: "Konfirmasi Pembayaran Manual",
                },
                {
                  icon: <ChartBar size={56} weight="fill" />,
                  text: "Sulit Melihat Analitik dan Laporan",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center w-full max-w-[240px] text-center transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center rounded-full bg-cyan-600 border-2 border-indigo-950 shadow-[2px_3px_0px_rgba(30,27,75)]">
                    <div className="text-white text-3xl">
                      {item.icon}
                    </div>
                  </div>
                  <p className="mt-6 text-indigo-950 text-lg sm:text-xl font-medium leading-relaxed">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Fitur Section */}
        <section id="fitur" className="py-20 md:py-40 bg-yellow-200 w-full">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <h2 className="text-3xl md:text-4xl font-semibold text-indigo-950 mb-12 md:mb-20 text-center px-2">
              Semua yang kamu butuhkan ada di CuanIN
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 md:gap-8">
              {/* Card 1 (lebar besar) */}
              <div className="lg:col-span-6 p-6 rounded-xl border-2 border-indigo-950 bg-white transition-all duration-300 hover:-translate-y-2">
                <div className="w-full h-64 md:h-80 bg-cyan-50 rounded-xl flex items-center justify-center border-2 border-transparent">
                  <span className="text-gray-400">Image</span>
                </div>
                <h3 className="mt-6 text-2xl font-medium text-indigo-950">
                  All-in-One Platform
                </h3>
                <p className="mt-2 text-slate-600 font-regular text-lg">
                  Kelola form, produk, pembeli dan pembayaran dalam satu sistem terintegrasi.
                </p>
              </div>

              {/* Card 2 (kecil) */}
              <div className="lg:col-span-5 p-6 rounded-xl border-2 border-indigo-950 bg-white transition-all duration-300 hover:-translate-y-2">
                <div className="w-full h-64 md:h-80 bg-cyan-50 rounded-xl flex items-center justify-center border-2 border-transparent">
                  <span className="text-gray-400">Image</span>
                </div>
                <h3 className="mt-6 text-2xl font-medium text-indigo-950">
                  Payment Gateway
                </h3>
                <p className="mt-2 text-slate-600 font-regular text-lg">
                  Terima pembayaran otomatis dengan verifikasi instan, tanpa perlu cek manual.
                </p>
              </div>

              {/* Card 3 (kecil) */}
              <div className="lg:col-span-5 p-6 rounded-xl border-2 border-indigo-950 bg-white transition-all duration-300 hover:-translate-y-2">
                <div className="w-full h-64 md:h-80 bg-cyan-50 rounded-xl flex items-center justify-center border-2 border-transparent">
                  <span className="text-gray-400">Image</span>
                </div>
                <h3 className="mt-6 text-2xl font-medium text-indigo-950">
                  Kustomisasi Form
                </h3>
                <p className="mt-2 text-slate-600 font-regular text-lg">
                  Buat form pendaftaran dengan bebas sesuai kebutuhanmu.
                </p>
              </div>

              {/* Card 4 (lebar besar) */}
              <div className="lg:col-span-6 p-6 rounded-xl border-2 border-indigo-950 bg-white transition-all duration-300 hover:-translate-y-2">
                <div className="w-full h-64 md:h-80 bg-cyan-50 rounded-xl flex items-center justify-center border-2 border-transparent">
                  <span className="text-gray-400">Image</span>
                </div>
                <h3 className="mt-6 text-2xl font-medium text-indigo-950">
                  Dashboard Analitik
                </h3>
                <p className="mt-2 text-slate-600 font-regular text-lg">
                  Pantau pembeli, pendapatan, dan performa produk secara real-time dalam satu dashboard.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Cara Kerja Section */}
        <section id="cara-kerja" className="py-20 md:py-30 bg-white w-full">
          <div className="max-w-6xl mx-auto px-4 md:px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-10">
            {/* KIRI - IMAGE */}
            <div className="w-full lg:w-1/2 h-80 sm:h-[400px] lg:h-[600px] bg-cyan-50 flex items-center justify-center rounded-xl border-2 border-indigo-950 shadow-[2px_3px_0px_rgba(30,27,75)]">
              <span className="text-gray-400">Image</span>
            </div>

            {/* KANAN - STEPS SECTION */}
            <div className="w-full lg:w-1/2">
              <StepsSection />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative max-w-6xl w-full py-16 md:py-30 px-4 md:px-6 mx-auto">
          <div className="relative bg-yellow-200 py-12 md:py-16 rounded-xl border-2 border-indigo-950 shadow-[2px_3px_0px_rgba(30,27,75)] px-6 md:px-12 text-center">
            {/* Dekorasi atas kiri */}
            <div className="hidden sm:block absolute top-[-20px] left-[-10px] md:left-[-30px] w-16 h-16 md:w-20 md:h-20">
              <Image src={Figure11} alt="Decor Top Left" className="w-full h-full object-contain" />
            </div>

            {/* Dekorasi bawah kanan */}
            <div className="hidden sm:block absolute bottom-[-20px] right-[-10px] md:right-[-30px] w-16 h-16 md:w-20 md:h-20">
              <Image src={Figure11} alt="Decor Bottom Right" className="w-full h-full object-contain" />
            </div>

            {/* Konten text */}
            <h2 className="text-3xl md:text-4xl font-semibold mb-8 md:mb-10 text-indigo-950 leading-tight">
              Siap mengelola semuanya tanpa ribet?<br className="hidden sm:block" />
              <span className="sm:inline block mt-2">Mulai sekarang gratis!</span>
            </h2>

            <Button text="Daftar Sekarang" href="/sign-in" />
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}