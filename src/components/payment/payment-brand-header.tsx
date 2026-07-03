// src/components/payment/payment-brand-header.tsx
import React from "react";
import Image from "next/image";
import { CaretLeftIcon } from "@phosphor-icons/react";

interface PaymentBrandHeaderProps {
  userImage?: string | null;
  userName?: string | null;
  backUrl?: string | null;
}

export function PaymentBrandHeader({ userImage, userName, backUrl }: PaymentBrandHeaderProps) {
  const displayUserName = userName ?? "CuanIN";
  const displayUserInitial = displayUserName.charAt(0).toUpperCase();

  return (
    <div className="flex items-center justify-start gap-3 mb-4">
      {backUrl && (
        <a
          href={backUrl}
          className="text-slate-500 hover:text-slate-700 transition-colors mr-1 flex items-center justify-center p-1.5 rounded-full hover:bg-slate-200/50"
        >
          <CaretLeftIcon className="w-5 h-5" />
        </a>
      )}
      {userImage ? (
        <Image
          src={userImage}
          alt={displayUserName}
          width={40}
          height={40}
          className="rounded-full object-cover w-10 h-10 border border-slate-200"
          unoptimized
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-200 text-sm font-bold text-slate-700 border border-slate-200">
          {displayUserInitial}
        </div>
      )}
      <span className="text-xl font-bold text-slate-800">
        {displayUserName}
      </span>
    </div>
  );
}
