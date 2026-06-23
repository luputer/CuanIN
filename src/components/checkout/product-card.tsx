"use client";

import React from "react";
import Image from "next/image";
import { ImagesIcon } from "@phosphor-icons/react";

type CheckoutProductCardProps = {
  product: {
    name: string;
    image?: string | null;
    type: string;
    benefit?: unknown;
  };
  price: number;
  originalPrice: number;
  hasDiscount: boolean;
  isGratis: boolean;
};

const CATEGORY_STYLE: Record<string, string> = {
  WEBINAR: "bg-cuan-cyan/20 text-007EA5 border-cuan-cyan/30",
  KELAS_ONLINE: "bg-amber-100 text-amber-700 border-amber-200",
  DIGITAL_PRODUCT: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const CATEGORY_NAME: Record<string, string> = {
  WEBINAR: "Webinar",
  KELAS_ONLINE: "Kelas",
  DIGITAL_PRODUCT: "Produk Digital",
};

export const CheckoutProductCard: React.FC<CheckoutProductCardProps> = ({
  product,
  price,
  originalPrice,
  hasDiscount,
  isGratis,
}) => {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-300 bg-white p-4 sm:flex-row sm:items-start">
      <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:w-24 md:w-28 self-start">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            unoptimized
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-slate-400">
            <ImagesIcon className="size-10 text-slate-300" />
          </div>
        )}
      </div>
      <div className="mt-0 flex h-full min-w-0 flex-1 flex-col gap-1.5">
        <span
          className={`w-fit rounded-full border px-2 py-0.5 text-[10px] ${CATEGORY_STYLE[product.type]}`}
        >
          {CATEGORY_NAME[product.type] ?? product.type}
        </span>
        <h2 className="text-base font-bold break-words text-slate-800">
          {product.name}
        </h2>



        <div className="mt-1">
          {isGratis ? (
            <div className="text-lg font-semibold text-green-600">Gratis</div>
          ) : hasDiscount ? (
            <div className="flex flex-col">
              <div className="text-lg font-bold text-cuan-cyan">
                Rp {price.toLocaleString("id-ID")}
              </div>
              <div className="text-xs font-medium text-slate-400 line-through">
                Rp {originalPrice.toLocaleString("id-ID")}
              </div>
            </div>
          ) : (
            <div className="text-lg font-bold text-cuan-cyan">
              Rp {price.toLocaleString("id-ID")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
