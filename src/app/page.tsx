"use client";
import Image from "next/image";
import Link from "next/link";
import Button from "~/components/ui/buttonlogin";
import HeaderLandingPage from "~/components/layout/headerlandingpage";
import StepsSection from "~/components/ui/stepsection";
import Footer from "~/components/layout/footer";
import { UsersThree, CreditCard, GridFour, ChartBar } from "phosphor-react";
import Figure6 from "public/assets/Figure6.png";
import Figure10 from "public/assets/Figure10.png";
import Figure11 from "public/assets/Figure11.png";

export default function HomePage() {
  return (
    <>
      <HeaderLandingPage />

      <main className="flex min-h-screen flex-col items-center justify-center bg-white text-white">

        {/* Hero Section */}
        <section id="about" className="relative mt-30 max-w-7xl mx-auto px-6 text-center">
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
            <Button text="Mulai Gratis" />
          </div>
        </section >

        <section className="relative mt-16 w-full mb-10">
          <div className="w-full max-w-6xl mx-auto h-[640px] border-2 border-indigo-950 rounded-xl flex items-center justify-center bg-cyan-50 shadow-[0px_3px_0px_rgba(30,27,75)]">
            <p className="text-slate-400">Image Preview</p>
          </div>

          {/* Kotak kecil (overlap) */}
          <div className="w-full max-w-4xl absolute -bottom-10 left-1/2 flex -translate-x-1/2 items-center justify-center rounded-xl border-2 border-indigo-950 bg-yellow-200 py-10 text-center text-4xl font-medium text-indigo-950 shadow-[0px_5px_0px_rgba(30,27,75)]">


            {/* Dekorasi atas kiri */}
            <div className="absolute top-[-15px] left-[-20px] w-16 h-16">
              <Image
                src={Figure10}
                alt="Decor Top Left"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Dekorasi bawah kanan */}
            <div className="absolute bottom-[-15px] right-[-20px] w-16 h-16">
              <Image
                src={Figure10}
                alt="Decor Bottom Right"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Konten text */}
            <div className="text-4xl font-medium text-indigo-950">
              “Ubah Keahlian Jadi Penghasilan”
            </div>
          </div>
        </section>

        {/* Masalah yang Sering Terjadi Section */}
        <section className="py-40 bg-white w-full">
          <div className="max-w-6xl mx-auto px-6 text-center">

            <h2 className="text-4xl font-semibold text-indigo-950 mb-20">
              Masalah yang Sering Terjadi
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-40 justify-items-center">

              {[
                {
                  icon: <GridFour size={64} weight="fill" />,
                  text: "Ribet Karena Banyak Platform",
                },
                {
                  icon: <UsersThree size={64} weight="fill" />,
                  text: "Data Peserta Berantakan",
                },
                {
                  icon: <CreditCard size={64} weight="fill" />,
                  text: "Konfirmasi Pembayaran Manual",
                },
                {
                  icon: <ChartBar size={64} weight="fill" />,
                  text: "Sulit Melihat Analitik dan Laporan",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center w-60 text-center 
               transition-all duration-300 
               hover:-translate-y-2"
                >

                  <div className="w-32 h-32 flex items-center justify-center rounded-full bg-cyan-600 border-2 border-indigo-950 shadow-[2px_3px_0px_rgba(30,27,75)]">
                    <div className="text-white text-3xl">
                      {item.icon}
                    </div>
                  </div>

                  <p className="mt-6 text-indigo-950 text-xl font-medium leading-relaxed">
                    {item.text}
                  </p>

                </div>
              ))}

            </div>

          </div>
        </section>

        {/* Fitur Section */}
        <section id="fitur" className="py-40 bg-yellow-200 w-full">
          <div className="max-w-6xl mx-auto px-6">

            <h2 className="text-4xl font-semibold text-indigo-950 mb-20 text-center">
              Semua yang kamu butuhkan ada di CuanIN
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-11 gap-4">

              {/* Card 1 (lebar besar) */}
              <div className="md:col-span-6 p-6 rounded-xl border-2 border-indigo-950 bg-white 
                transition-all duration-300 
                hover:-translate-y-2">

                <div className="w-full h-80 bg-cyan-50 rounded-xl flex items-center justify-center">
                  <span className="text-gray-400">Image</span>
                </div>

                <h3 className="mt-4 text-2xl font-medium text-indigo-950">
                  All-in-One Platform
                </h3>

                <p className="mt-2 text-slate-600 font-regular text-lg">
                  Kelola form, produk, pembeli dan pembayaran dalam satu sistem terintegrasi.
                </p>
              </div>

              {/* Card 2 (kecil) */}
              <div className="md:col-span-5 p-6 rounded-xl border-2 border-indigo-950 bg-white 
                transition-all duration-300 
                hover:-translate-y-2">

                <div className="w-full h-80 bg-cyan-50 rounded-xl flex items-center justify-center">
                  <span className="text-gray-400">Image</span>
                </div>

                <h3 className="mt-4 text-2xl font-medium text-indigo-950">
                  Payment Gateway
                </h3>

                <p className="mt-2 text-slate-600 font-regular text-lg">
                  Terima pembayaran otomatis dengan verifikasi instan, tanpa perlu cek manual.
                </p>
              </div>

              {/* Card 3 (kecil) */}
              <div className="md:col-span-5 p-6 rounded-xl border-2 border-indigo-950 bg-white 
                transition-all duration-300 
                hover:-translate-y-2">

                <div className="w-full h-80 bg-cyan-50 rounded-xl flex items-center justify-center">
                  <span className="text-gray-400">Image</span>
                </div>

                <h3 className="mt-4 text-2xl font-medium text-indigo-950">
                  Kustomisasi Form
                </h3>

                <p className="mt-2 text-slate-600 font-regular text-lg">
                  Buat form pendaftaran dengan bebas sesuai kebutuhanmu.
                </p>
              </div>

              {/* Card 4 (lebar besar) */}
              <div className="md:col-span-6 p-6 rounded-xl border-2 border-indigo-950 bg-white 
                transition-all duration-300 
                hover:-translate-y-2">

                <div className="w-full h-80 bg-cyan-50 rounded-xl flex items-center justify-center">
                  <span className="text-gray-400">Image</span>
                </div>

                <h3 className="mt-4 text-2xl font-medium text-indigo-950">
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
        <section id="cara-kerja" className="pt-30 bg-white w-full">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-10">
            {/* KIRI - IMAGE */}
            <div className="w-1/2 h-150 bg-cyan-50 rounded-xl flex items-center justify-center rounded-xl border-2 border-indigo-950 shadow-[2px_3px_0px_rgba(30,27,75)]">
              <span className="text-gray-400">Image</span>
            </div>

            {/* KANAN - STEPS SECTION */}
            <div className="w-1/2">
              <StepsSection />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative max-w-6xl w-full py-30">
          <div className="relative bg-yellow-200 py-16 rounded-xl border-2 border-indigo-950 shadow-[2px_3px_0px_rgba(30,27,75)] p-12 text-center">

            {/* Dekorasi atas kiri */}
            <div className="absolute top-[-20px] left-[-30px] w-20 h-20">
              <Image
                src={Figure11}
                alt="Decor Top Left"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Dekorasi bawah kanan */}
            <div className="absolute bottom-[-20px] right-[-30px] w-20 h-20">
              <Image
                src={Figure11}
                alt="Decor Bottom Right"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Konten text */}
            <h2 className="text-4xl font-semibold mb-10 text-indigo-950 leading-tight">
              Siap mengelola semuanya tanpa ribet?<br />
              Mulai sekarang gratis!
            </h2>

            <Button text="Daftar Sekarang" />
          </div>
        </section>

        <Footer />



      </main >
    </>
  );
}
