"use client";

import {
  PlusIcon,
  WalletIcon,
  ArrowDownIcon,
  CopyIcon,
  ShareNetworkIcon,
  UserIcon,
  ShoppingBagIcon,
  ChatTextIcon,
  CreditCardIcon,
} from "@phosphor-icons/react";

// ─── 5. STEPS ILLUSTRATION MOCKUP ────────────────────────────────────────────

export function StepsIllustrationMockup({ activeStep = 0 }: { activeStep?: number }) {
  const steps = [
    { title: "Buat Akun", color: "white", icon: <UserIcon size={24} className="text-cyan-600" /> },
    { title: "Tambahkan Produk", color: "white", icon: <PlusIcon size={24} className="text-cyan-600" /> },
    { title: "Bagikan Link", color: "white", icon: <ShareNetworkIcon size={24} className="text-cyan-600" /> },
    { title: "Terima Pembayaran", color: "white", icon: <CreditCardIcon size={24} className="text-emerald-600" /> },
  ];

  // Transformations for inactive cards to create a stacked/distributed look
  const inactiveStyles = [
    "-rotate-6 -translate-x-12 -translate-y-6",
    "rotate-3 translate-x-14 -translate-y-4",
    "-rotate-2 translate-x-8 translate-y-12",
    "rotate-6 -translate-x-10 translate-y-10"
  ];

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden transition-colors duration-500">
      <div className="w-full max-w-[550px] aspect-[4/5] relative z-10 flex items-center justify-center">
        {steps.map((step, index) => {
          const isActive = activeStep === index;

          return (
            <div
              key={index}
              className={`absolute transition-all duration-500 ease-out transform ${isActive
                ? "opacity-100 scale-100 z-30 translate-x-0 translate-y-0 rotate-0"
                : `opacity-60 scale-90 z-10 pointer-events-none ${inactiveStyles[index]}`
                }`}
            >
              <div className={`w-[260px] sm:w-[420px] bg-${step.color} border-2 border-slate-800 p-4 sm:p-6 rounded-3xl flex flex-col gap-4 sm:gap-5 h-[360px] sm:h-[480px] overflow-hidden`}>
                {/* Rich Dynamic Content based on step */}
                <div className="space-y-5 opacity-90 flex-grow">
                  {index === 0 && ( // Buat Akun
                    <div className="w-full h-full rounded-2xl bg-white p-2">
                      {/* Title & Subtitle */}
                      <div className="text-center mb-4 sm:mb-8">
                        <h3 className="text-xl sm:text-2xl font-semibold text-cuan-blue">Buat Akun</h3>
                        <p className="text-base sm:text-lg text-slate-500">Selamat datang <br /> silahkan daftarkan akun anda</p>
                      </div>

                      {/* Form Fields Skeletons */}
                      <div className="space-y-2 sm:space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="space-y-1 sm:space-y-2">
                            <div className="h-3 sm:h-4 w-16 sm:w-20 bg-slate-200 rounded" />
                            <div className="h-8 sm:h-10 w-full bg-slate-50 rounded-lg border border-slate-200" />
                          </div>
                        ))}

                        {/* Button */}
                        <button className="mt-2 h-10 sm:h-12 w-full bg-cuan-blue/80 rounded-lg border border-slate-800 text-sm sm:text-lg font-semibold text-white">
                          Daftar Sekarang
                        </button>
                      </div>
                    </div>
                  )}
                  {index === 1 && ( // Tambahkan Produk
                    <div className="h-full flex flex-col justify-center space-y-4">
                      {/* Tombol Tambah Produk */}
                      <button className="h-10 sm:h-12 w-full bg-cuan-blue/80 rounded-lg flex items-center justify-center text-white text-base sm:text-lg font-semibold border border-slate-800">
                        <PlusIcon size={24} className="mr-2" weight="bold" />
                        Tambah Produk
                      </button>

                      {/* Panah ke Bawah */}
                      <div className="flex justify-center text-slate-800">
                        <ArrowDownIcon size={24} weight="bold" />
                      </div>

                      {/* Katalog Produk - Square Card */}
                      <div className="h-auto w-full bg-white rounded-2xl border-2 border-slate-400 p-3 sm:p-4 flex flex-col gap-2 sm:gap-3">
                        <div className="h-32 sm:h-48 w-full bg-cuan-cyan/10 rounded-lg flex items-center justify-center">
                          <ShoppingBagIcon weight="duotone" className="text-slate-300 w-12 h-12 sm:w-16 sm:h-16" />
                        </div>
                        <div className="space-y-1.5 sm:space-y-2">
                          <div className="h-3 sm:h-4 w-1/2 bg-slate-100 rounded" />
                          <div className="h-4 sm:h-6 w-3/4 bg-slate-200 rounded" />
                        </div>
                      </div>
                    </div>
                  )}
                  {index === 2 && ( // Bagikan Link
                    <div className="h-full flex flex-col justify-center space-y-6">
                      {/* Tombol Bagikan Link */}
                      <button className="h-10 sm:h-12 w-full flex items-center justify-center text-xl sm:text-2xl font-semibold text-cuan-blue">
                        <ShareNetworkIcon size={24} className="mr-2" weight="bold" />
                        Bagikan Link
                      </button>
                      {/* Link Sharing Display */}
                      <div className="bg-slate-100 p-3 sm:p-4 rounded-2xl border-2 border-slate-200 border-dashed">
                        <p className="text-sm sm:text-lg text-slate-500 mb-1 sm:mb-2 font-medium">Link Katalog Kamu:</p>
                        <div className="bg-white p-2 sm:p-3 rounded-lg border border-slate-300 flex items-center justify-between shadow-sm">
                          <span className="text-cuan-blue font-medium truncate text-xs sm:text-base">cuanin.com/produk-kreator</span>
                          <button className="bg-slate-100 p-2 rounded-md hover:bg-slate-200">
                            <CopyIcon size={16} className="text-slate-600" />
                          </button>
                        </div>
                      </div>

                      {/* Chat Promotion Simulation */}
                      <div className="space-y-6 mt-4">
                        {/* Sent Bubble */}
                        <div className="flex justify-end">
                          <div className="bg-cuan-cyan/20 py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg rounded-tr-none text-xs sm:text-base text-cyan-800 border border-cyan-200">
                            Cek link produk ini! <br /> cuanin.com/produk-kreator
                          </div>
                        </div>
                        {/* Received Bubble */}
                        <div className="flex justify-start">
                          <div className="bg-slate-100 py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg rounded-tl-none text-xs sm:text-base text-slate-800 border border-slate-200">
                            Wah, keren! Aku sudah beli!
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {index === 3 && ( // Terima Pembayaran
                    <div className="h-full flex flex-col justify-center space-y-6">
                      {/* Transaction Success Simulation */}
                      <button className="h-10 sm:h-12 w-full flex items-center justify-center text-xl sm:text-2xl font-semibold text-cuan-blue">
                        <CreditCardIcon size={24} className="mr-2" weight="bold" />
                        Terima Pembayaran
                      </button>
                      <div className="bg-emerald-50 p-4 sm:p-6 rounded-2xl border-2 border-emerald-100 shadow-sm flex flex-col items-center gap-2 sm:gap-3">
                        <span className="text-xl sm:text-4xl font-semibold text-emerald-700">+ Rp 150.000</span>
                        <span className="text-xs sm:text-sm font-bold text-emerald-800 bg-emerald-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">Berhasil!</span>
                      </div>

                      {/* Total Saldo */}
                      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
                        <p className="text-sm text-slate-500 font-medium mb-1">Total Saldo Terkumpul:</p>
                        <span className="text-xl sm:text-3xl font-semibold text-slate-800">Rp 2.450.000</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div >
  );
}
