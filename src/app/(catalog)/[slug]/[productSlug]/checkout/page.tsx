"use client";

import React from "react";
import { useCheckout } from "~/hooks/checkout/use-checkout";
import { CheckoutProductCard } from "~/components/checkout/product-card";
import { CheckoutForm } from "~/components/checkout/checkout-form";
import { CheckoutSummary } from "~/components/checkout/checkout-summary";
import { CatalogNavHeader, CatalogNavHeaderSkeleton } from "~/components/layout/catalog-nav-header";

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
    originalPrice,
    hasDiscount,
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
        <CatalogNavHeaderSkeleton />
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="mb-8 h-9 w-36 rounded-xl bg-slate-200" />
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-5">
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
      <CatalogNavHeader backHref={`/${slug}/${productSlug}`} />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-8 text-3xl font-bold text-slate-800">Checkout</h1>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-5">
          {/* LEFT */}
          <div className="w-full min-w-0 space-y-6 lg:col-span-3 lg:pb-12">
            <CheckoutProductCard 
              product={product} 
              price={price} 
              originalPrice={originalPrice}
              hasDiscount={hasDiscount}
              isGratis={isGratis} 
            />
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
          <div className="w-full min-w-0 lg:sticky lg:top-24 lg:col-span-2 lg:h-fit lg:self-start">
            <CheckoutSummary
              form={form}
              appliedVoucher={appliedVoucher}
              isValidatingVoucher={isValidatingVoucher}
              voucherError={voucherError}
              handleApplyVoucher={handleApplyVoucher}
              handleRemoveVoucher={handleRemoveVoucher}
              isBuyingOwnProduct={isBuyingOwnProduct}
              price={price}
              originalPrice={originalPrice}
              hasDiscount={hasDiscount}
              discountAmount={discountAmount}
              finalPrice={finalPrice}
              isGratis={isGratis}
              isPending={purchaseMutation.isPending}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
