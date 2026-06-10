"use client";

import { ArrowLeftIcon } from "@phosphor-icons/react";
import Link from "next/link";

export default function WebinarCreatePage() {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="bg-slate-50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 -mx-6 px-6 pt-2 pb-0">
          <div className="flex-1 flex flex-col gap-1.5">
            <Link
              href="/webinar"
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-cyan-600 mb-2 w-fit"
            >
              <ArrowLeftIcon className="size-4" />
              <span>Kembali</span>
            </Link>
            <h1 className="text-2xl font-bold text-slate-800">Buat Webinar</h1>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-slate-800 overflow-hidden bg-white mt-6">
        <div className="px-4 py-6 sm:px-8 sm:py-8">
          <p className="text-slate-500">Halaman create webinar belum diimplementasikan.</p>
        </div>
      </div>
    </div>
  );
}
