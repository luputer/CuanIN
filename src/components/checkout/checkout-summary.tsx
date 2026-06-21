"use client";

import React from "react";
import { SealPercentIcon, SpinnerIcon, WarningCircleIcon, ShieldCheckIcon } from "@phosphor-icons/react";
import type { UseFormReturn } from "react-hook-form";
import type { AppliedVoucher, CheckoutFormValues } from "~/hooks/checkout/use-checkout";

type CheckoutSummaryProps = {
  form: UseFormReturn<CheckoutFormValues>;
  appliedVoucher: AppliedVoucher | null;
  isValidatingVoucher: boolean;
  voucherError: string | null;
  handleApplyVoucher: () => void;
  handleRemoveVoucher: () => void;
  isBuyingOwnProduct: boolean;
  price: number;
  originalPrice: number;
  hasDiscount: boolean;
  discountAmount: number;
  finalPrice: number;
  isGratis: boolean;
  isPending: boolean;
};

export const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  form,
  appliedVoucher,
  isValidatingVoucher,
  voucherError,
  handleApplyVoucher,
  handleRemoveVoucher,
  isBuyingOwnProduct,
  price,
  originalPrice,
  hasDiscount,
  discountAmount,
  finalPrice,
  isGratis,
  isPending,
}) => {
  const { register } = form;

  return (
    <div className="space-y-6 lg:col-span-2">
      {/* VOUCHER */}
      {price > 0 && (
        <div className="rounded-xl border border-slate-300 bg-white p-5">
          <label className="text-sm font-medium text-slate-700">Kode Voucher</label>
          {appliedVoucher ? (
            <div className="mt-2 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <SealPercentIcon className="h-4 w-4 text-green-500" weight="fill" />
                <div>
                  <div className="text-sm font-semibold text-green-700">{appliedVoucher.code}</div>
                  <div className="text-xs text-green-600">{appliedVoucher.name}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveVoucher}
                className="cursor-pointer text-xs font-medium text-red-500 hover:text-red-600 hover:underline"
              >
                Hapus
              </button>
            </div>
          ) : (
            <div className="mt-2 space-y-1.5">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <SealPercentIcon
                    className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-yellow-400"
                    weight="fill"
                  />
                  <input
                    {...register("promo")}
                    className={`w-full rounded-xl border py-2.5 pr-4 pl-10 focus:outline-none focus:ring-1 ${voucherError
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-300 focus:border-cuan-cyan focus:ring-cuan-cyan/20"
                      }`}
                    placeholder="Masukkan kode voucher"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyVoucher}
                  disabled={isValidatingVoucher}
                  className="cursor-pointer rounded-xl bg-yellow-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isValidatingVoucher ? (
                    <SpinnerIcon className="h-4 w-4 animate-spin" />
                  ) : (
                    "Pakai"
                  )}
                </button>
              </div>
              {voucherError && (
                <p className="flex items-center gap-1 text-xs text-red-500">
                  <WarningCircleIcon className="h-3.5 w-3.5 shrink-0" weight="fill" />
                  {voucherError}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* SUMMARY */}
      <div className="rounded-xl border border-slate-300 bg-white p-6">
        <h3 className="mb-4 pb-3 font-semibold text-slate-800">
          Detail Pembayaran
        </h3>
        {isBuyingOwnProduct && (
          <div className="mb-4 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
            <WarningCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" weight="fill" />
            <div className="space-y-1 leading-relaxed">
              <p className="font-medium">Tidak dapat melakukan pembelian</p>
              <p className="text-amber-700/80">
                Kamu sedang login sebagai pemilik produk ini. Gunakan akun pembeli atau logout untuk mencoba checkout.
              </p>
            </div>
          </div>
        )}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Harga</span>
            {price === 0 ? (
              <span className="font-semibold text-green-600">Gratis</span>
            ) : hasDiscount ? (
              <div className="flex flex-col items-end">
                <span className="font-medium text-slate-700">
                  Rp {price.toLocaleString("id-ID")}
                </span>
                <span className="text-xs font-medium text-slate-400 line-through">
                  Rp {originalPrice.toLocaleString("id-ID")}
                </span>
              </div>
            ) : (
              <span className="font-medium text-slate-700">
                Rp {price.toLocaleString("id-ID")}
              </span>
            )}
          </div>

          {appliedVoucher && discountAmount > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Diskon Voucher</span>
              <span className="font-semibold text-green-600">
                - Rp {discountAmount.toLocaleString("id-ID")}
                {appliedVoucher.type === "PERSEN" && ` (${appliedVoucher.discount}%)`}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center border-t border-slate-200 pt-2">
            <span className="font-semibold text-slate-800">Total</span>
            {isGratis ? (
              <span className="font-bold text-green-600">Gratis</span>
            ) : (
              <span className="font-bold text-cuan-cyan">
                Rp {finalPrice.toLocaleString("id-ID")}
              </span>
            )}
          </div>
        </div>
        <button
          type="submit"
          form="checkout-form"
          disabled={isPending || isBuyingOwnProduct}
          className="mt-6 w-full cursor-pointer rounded-xl bg-cuan-cyan py-3 text-lg font-semibold text-white transition-colors duration-200 hover:bg-[#008BB5] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending
            ? "Memproses..."
            : isBuyingOwnProduct
              ? "Tidak Bisa Beli Produk Sendiri"
              : isGratis
                ? "Daftar Sekarang"
                : "Bayar Sekarang"}
        </button>
        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheckIcon className="h-4 w-4" />
          Aman & terenkripsi
        </div>
      </div>
    </div>
  );
};
