"use client";

import { ArrowLeftIcon, SignOutIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PortalCombinedHeaderProps {
  backHref?: string;
  email: string;
  handleLogout: () => void;
}

export function PortalCombinedHeader({ backHref, email, handleLogout }: PortalCombinedHeaderProps) {
  const router = useRouter();

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="mx-auto w-full max-w-6xl px-4 flex items-center justify-between py-4">
        <div className="flex items-center gap-6">
          {/* Back button */}
          {backHref ? (
            <Link
              href={backHref}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ArrowLeftIcon className="h-5 w-5 text-slate-600" />
            </Link>
          ) : (
            <button
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ArrowLeftIcon className="h-5 w-5 text-slate-600" />
            </button>
          )}
          <div className="hidden md:block">
            <h1 className="text-sm font-bold text-slate-800">Portal Pelanggan</h1>
            <p className="text-xs text-slate-500 font-medium">
              Login sebagai: <span className="font-semibold text-slate-700">{email}</span>
            </p>
          </div>
        </div>router
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 cursor-pointer"
        >
          <SignOutIcon size={16} />
          Keluar
        </button>
      </div>
    </div>
  );
}
