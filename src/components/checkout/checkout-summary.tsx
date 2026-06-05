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
  discountAmount,
  finalPrice,
  isGratis,
  isPending,
}) => {
  const { register } = form;

  return (
    <div className="space-y-6 lg:sticky lg:top-24 lg:col-span-2 lg:h-fit lg:self-start">
      {/* VOUCHER */}
      <div className="rounded-xl border border-slate-300 bg-white p-5">
        <label className="text-sm font-medium text-slate-700">Kode Voucher</label>
        {appliedVoucher ? (
          <div className="mt-2 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <SealPercentIcon className="size-4 text-green-500" weight="fill" />
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
                  className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-yellow-400"
                  weight="fill"
                />
                <input
                  {...register("promo")}
                  className={`w-full rounded-xl border py-2.5 pr-4 pl-10 focus:ring-1 ${
                    voucherError
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-300 focus:border-cyan-600 focus:ring-cyan-100"
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
                  <SpinnerIcon className="size-4 animate-spin" />
                ) : (
                  "Pakai"
                )}
              </button>
            </div>
            {voucherError && (
              <p className="flex items-center gap-1 text-xs text-red-500">
                <WarningCircleIcon className="size-3.5 shrink-0" weight="fill" />
                {voucherError}
              </p>
            )}
          </div>
        )}
      </div>

      {/* SUMMARY */}
      <div className="rounded-xl border border-slate-300 bg-white p-6">
        <h3 className="mb-4 border-b border-slate-300 pb-3 font-semibold text-slate-800">
          Detail Pembayaran
        </h3>
        {isBuyingOwnProduct && (
          <div className="mb-4 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
            <WarningCircleIcon className="mt-0.5 size-5 shrink-0 text-amber-500" weight="fill" />
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
              <span className="font-bold text-cyan-600">
                Rp {finalPrice.toLocaleString("id-ID")}
              </span>
            )}
          </div>
        </div>
        <button
          type="submit"
          form="checkout-form"
          disabled={isPending || isBuyingOwnProduct}
          className="mt-6 w-full cursor-pointer rounded-xl bg-cyan-600 py-3 text-lg font-semibold text-white shadow-sm hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
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
          <ShieldCheckIcon className="size-4" />
          Aman & terenkripsi
        </div>
      </div>
    </div>
  );
};
