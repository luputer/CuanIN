"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useCheckout } from "~/hooks/checkout/use-checkout";
import { CheckoutProductCard } from "~/components/checkout/product-card";
import { CheckoutForm } from "~/components/checkout/checkout-form";
import { CheckoutSummary } from "~/components/checkout/checkout-summary";

export default function CheckoutPage() {
  const {
    form,
    session,
    status,
    product,
    isLoading,
    isGoogleLoading,
    setIsGoogleLoading,
    appliedVoucher,
    isValidatingVoucher,
    voucherError,
    handleApplyVoucher,
    handleRemoveVoucher,
    onSubmit,
    purchaseMutation,
    price,
    discountAmount,
    finalPrice,
    isGratis,
    isBuyingOwnProduct,
    formFields,
    slug,
    productSlug,
  } = useCheckout();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 animate-pulse">
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white">
          <div className="mx-auto flex h-16 max-w-6xl items-center px-4">
            <div className="h-10 w-10 rounded-full bg-slate-200" />
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="mb-8 h-9 w-36 rounded-xl bg-slate-200" />
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-5">
            <div className="space-y-6 lg:col-span-3">
              <div className="h-40 w-full rounded-xl bg-slate-200" />
              <div className="h-96 w-full rounded-xl bg-slate-200" />
            </div>
            <div className="space-y-6 lg:col-span-2">
              <div className="h-24 w-full rounded-xl bg-slate-200" />
              <div className="h-64 w-full rounded-xl bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">Produk tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4">
          <Link
            href={`/${slug}/${productSlug}`}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100"
          >
            <ArrowLeftIcon className="h-5 w-5 text-slate-600" />
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-8 text-3xl font-bold text-slate-800">Checkout</h1>

        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-5">
          {/* LEFT */}
          <div className="space-y-6 pb-50 lg:col-span-3">
            <CheckoutProductCard product={product} price={price} isGratis={isGratis} />
            <CheckoutForm
              form={form}
              status={status}
              session={session}
              isGoogleLoading={isGoogleLoading}
              setIsGoogleLoading={setIsGoogleLoading}
              formFields={formFields}
              onSubmit={onSubmit}
            />
          </div>

          {/* RIGHT */}
          <CheckoutSummary
            form={form}
            appliedVoucher={appliedVoucher}
            isValidatingVoucher={isValidatingVoucher}
            voucherError={voucherError}
            handleApplyVoucher={handleApplyVoucher}
            handleRemoveVoucher={handleRemoveVoucher}
            isBuyingOwnProduct={isBuyingOwnProduct}
            price={price}
            discountAmount={discountAmount}
            finalPrice={finalPrice}
            isGratis={isGratis}
            isPending={purchaseMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
}
