"use client";

import { StorefrontIcon, LockIcon } from "@phosphor-icons/react";

export default function PortalLandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-cuan-cyan/20 flex items-center justify-center">
              <StorefrontIcon size={20} weight="bold" className="text-cuan-cyan" />
            </div>
            <span className="text-lg font-bold text-slate-800">CuanIN</span>
          </div>
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center">
            <StorefrontIcon className="text-slate-400" size={28} weight="fill" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Customer Portal</h1>
          <p className="text-slate-500 text-sm">
            Untuk mengakses portal, silakan gunakan link yang dikirimkan ke email kamu setelah pembelian produk.
          </p>
          <p className="text-xs text-slate-400">
            Jika kamu belum menerima link portal, silakan hubungi kreator produk yang kamu beli.
          </p>
        </div>
      </div>

      <div className="text-center py-4 space-y-1.5">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-600">
          <span>BAHASA</span>
          <span className="text-slate-300">|</span>
          <span>ENGLISH</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <LockIcon size={12} weight="fill" />
          <span className="uppercase font-medium tracking-wide">Powered by CuanIN</span>
        </div>
      </div>
    </div>
  );
}
