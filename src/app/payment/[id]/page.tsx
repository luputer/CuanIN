"use client";

import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import { calculatePaymentFee } from "~/lib/utils";
import { env } from "~/env";
import Script from "next/script";
import Image from "next/image";
import {
  ShieldCheckIcon,
  ArrowLeftIcon,
  CreditCardIcon,
} from "@phosphor-icons/react";
import React from "react";
import { toast } from "sonner";
import Link from "next/link";

declare global {
  interface Window {
    snap: any;
  }
}

export default function PaymentPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: purchase, isLoading } = api.purchases.getById.useQuery({ id });

  const createMidtransTransaction = api.purchases.createMidtransTransaction.useMutation({
    onSuccess: (data) => {
      if (window.snap) {
        window.snap.pay(data.token, {
          onSuccess: function () {
            window.location.href = `/payment/success?id=${purchase!.id}`;
          },
          onPending: function () {
            window.location.href = `/payment/success?id=${purchase!.id}`;
          },
          onError: function (_result: any) {
            toast.error("Pembayaran gagal atau dibatalkan.");
          },
          onClose: function () {
            toast.info("Tunggu sebentar, menyelesaikan pembayaran tertunda jika ada.");
          },
        });
      } else {
        toast.error("Gagal memuat sistem pembayaran Midtrans.");
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 animate-pulse">
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white">
          <div className="mx-auto flex h-16 max-w-4xl items-center px-4">
            <div className="h-10 w-10 rounded-full bg-slate-200" />
          </div>
        </div>
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="mb-8 h-9 w-48 rounded-xl bg-slate-200" />
          <div className="h-96 w-full rounded-xl bg-slate-200" />
        </div>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">Transaksi tidak ditemukan</p>
      </div>
    );
  }

  const price = Number(purchase.amount);
  // Definisikan fee jika ada static fee untuk midtrans, atau set ke 0 jika include di harga
  const fee = calculatePaymentFee("midtrans", price) ?? 0;

  const handlePay = () => {
    createMidtransTransaction.mutate({
      purchaseId: purchase.id,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Script Midtrans Snap */}
      <Script
        src={
          env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "false"
            ? "https://app.sandbox.midtrans.com/snap/snap.js"
            : "https://app.midtrans.com/snap/snap.js"
        }
        data-client-key={env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />

      {/* HEADER */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center px-4">
          {purchase.product.user?.catalog?.slug && purchase.product.slug && (
            <Link
              href={`/${purchase.product.user.catalog.slug}/${purchase.product.slug}`}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100"
            >
              <ArrowLeftIcon className="h-5 w-5 text-slate-600" />
            </Link>
          )}
          <span className="ml-3 font-medium text-slate-700">Kembali ke Produk</span>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="mb-6 text-2xl font-bold text-slate-800">Selesaikan Pembayaran</h1>

        {/* Layout diubah menjadi 1 Kolom terpusat atau Split yang seimbang */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-5">

          {/* KIRI: DETAIL PRODUK & PEMBELI */}
          <div className="space-y-6 md:col-span-3">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
                Informasi Pelanggan
              </h2>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-500">Nama</span>
                  <span className="col-span-2 font-medium text-slate-800">{purchase.buyerName}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-500">Email</span>
                  <span className="col-span-2 font-medium text-slate-800 break-all">{purchase.buyerEmail}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-500">No. HP</span>
                  <span className="col-span-2 font-medium text-slate-800">{purchase.buyerPhone}</span>
                </div>
              </div>
            </div>

            {/* Metode Pembayaran Terpilih Info */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
                  <CreditCardIcon size={24} weight="duotone" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">Gerbang Pembayaran Otomatis</h3>
                  <p className="text-xs text-slate-500">Mendukung QRIS, Virtual Account, E-Wallet, dll.</p>
                </div>
              </div>
              <Image
                src="/icons/midtrans.svg" // Pastikan Anda punya logo midtrans di folder public, atau hapus baris Image ini
                alt="Midtrans Secure"
                width={80}
                height={20}
                className="opacity-70 object-contain h-5 w-auto"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </div>
          </div>

          {/* KANAN: RINGKASAN TOTAL & CTA */}
          <div className="md:col-span-2">
            <div className="rounded-xl border border-slate-300 bg-white p-6 shadow-sm sticky top-24">
              <h3 className="mb-4 border-b border-slate-100 pb-3 font-semibold text-slate-800">
                Ringkasan Order
              </h3>

              {/* Pricing */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-medium text-slate-800">Rp{price.toLocaleString("id-ID")}</span>
                </div>
                {fee > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Biaya Layanan</span>
                    <span className="font-medium text-slate-800">Rp{fee.toLocaleString("id-ID")}</span>
                  </div>
                )}

                <div className="my-2 border-t border-dashed border-slate-200 pt-3 flex justify-between items-center">
                  <span className="font-semibold text-slate-800">Total Bayar</span>
                  <span className="text-xl font-bold text-cyan-600">Rp{(price + fee).toLocaleString("id-ID")}</span>
                </div>
              </div>

              {/* CTA Button Utama */}
              <button
                onClick={handlePay}
                disabled={createMidtransTransaction.isPending}
                className="mt-6 w-full cursor-pointer rounded-xl bg-cyan-600 py-3.5 text-center text-sm font-semibold text-white shadow-md hover:bg-cyan-700 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {createMidtransTransaction.isPending ? "Membuka Transaksi..." : "Pilih Metode & Bayar"}
              </button>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <ShieldCheckIcon className="h-4 w-4 text-emerald-500" />
                Dikonfirmasi aman oleh Midtrans
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}