"use client";

import React from "react";
import Image from "next/image";
import { CheckCircleIcon, ImagesIcon } from "@phosphor-icons/react";

type CheckoutProductCardProps = {
  product: {
    name: string;
    image?: string | null;
    type: string;
    benefit?: unknown;
  };
  price: number;
  isGratis: boolean;
};

const CATEGORY_STYLE: Record<string, string> = {
  WEBINAR: "bg-cyan-100 text-cyan-700 border-cyan-200",
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
  isGratis,
}) => {
  return (
    <div className="flex flex-col gap-5 rounded-xl border border-slate-300 bg-white p-5 sm:flex-row sm:items-start">
      <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:w-40 md:w-44 lg:w-48 self-start">
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
            <ImagesIcon className="size-12 text-slate-300" />
          </div>
        )}
      </div>
      <div className="mt-1 flex h-full min-w-0 flex-1 flex-col gap-2">
        <span
          className={`w-fit rounded-full border px-3 py-1 text-xs ${CATEGORY_STYLE[product.type]}`}
        >
          {CATEGORY_NAME[product.type] ?? product.type}
        </span>
        <h2 className="mb-4 text-lg font-bold break-words text-slate-800">
          {product.name}
        </h2>

        {((product.benefit as string[])?.length ?? 0) > 0 && (
          <div className="mb-2 rounded-xl border border-cyan-100 bg-cyan-50 p-4">
            <div className="mb-3 text-sm font-semibold text-cyan-600">
              Yang akan Kamu dapatkan:
            </div>
            <div className="space-y-3">
              {(product.benefit as string[]).map((item, _idx) => (
                <div
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-slate-700"
                >
                  <CheckCircleIcon
                    className="size-5 shrink-0 text-cyan-600 mt-0.5"
                    weight="fill"
                  />
                  <span className="min-w-0 wrap-break-word leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          {isGratis ? (
            <div className="text-xl font-semibold text-green-600">Gratis</div>
          ) : (
            <div className="text-xl font-bold text-cyan-600">
              Rp {price.toLocaleString("id-ID")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
