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
} from "@phosphor-icons/react";
import React from "react";
import { toast } from "sonner";
import Link from "next/link";

declare global {
  interface Window {
    snap: any;
  }
}

type PaymentMethodId =
  | "qris"
  | "shopeepay"
  | "dana"
  | "ovo"
  | "bca"
  | "bni"
  | "bri"
  | "mandiri"
  | "bsi"
  | "permata"
  | "alfamart"
  | "cc"
  | "midtrans";

type PaymentMethod = {
  id: PaymentMethodId;
  label: string;
  icons: string[];
  logoClassName?: string;
};

const PAYMENT_METHODS: Array<{
  group: string;
  methods: PaymentMethod[];
}> = [
    {
      group: "QRIS & E-Wallet",
      methods: [
        {
          id: "qris",
          label: "QRIS",
          icons: ["/icons/qris.svg"],
          logoClassName: "max-h-8",
        },
        {
          id: "shopeepay",
          label: "ShopeePay",
          icons: ["/icons/shopeepay.svg"],
          logoClassName: "max-h-9",
        },
        {
          id: "dana",
          label: "DANA",
          icons: ["/icons/dana.svg"],
          logoClassName: "max-h-7",
        },
        {
          id: "ovo",
          label: "OVO",
          icons: ["/icons/ovo.svg"],
          logoClassName: "max-h-7",
        },
      ],
    },
    {
      group: "Virtual Account & Bank Transfer",
      methods: [
        {
          id: "bca",
          label: "BCA",
          icons: ["/icons/bca.svg"],
        },
        {
          id: "bni",
          label: "BNI",
          icons: ["/icons/bni.svg"],
        },
        {
          id: "bri",
          label: "BRI",
          icons: ["/icons/bri.svg"],
        },
        {
          id: "mandiri",
          label: "Mandiri",
          icons: ["/icons/mandiri.svg"],
        },
        {
          id: "bsi",
          label: "BSI",
          icons: ["/icons/bsi.svg"],
        },
        {
          id: "permata",
          label: "Permata Bank",
          icons: ["/icons/permata.svg"],
        },
      ],
    },
    {
      group: "Retail",
      methods: [
        {
          id: "alfamart",
          label: "Alfamart",
          icons: ["/icons/alfamart.svg"],
        },
      ],
    },
    {
      group: "Kartu Kredit",
      methods: [
        {
          id: "cc",
          label: "Credit Card",
          icons: ["/icons/visa.svg", "/icons/mastercard.svg"],
        },
      ],
    },
  ];

export default function PaymentPage() {
  const params = useParams();
  const id = params.id as string;
  const [selected, setSelected] = React.useState<PaymentMethodId | null>(null);

  const { data: purchase, isLoading } = api.purchases.getById.useQuery({ id });
  const createPaymentInvoice = api.purchases.createPaymentInvoice.useMutation({
    onSuccess: (data) => {
      window.location.href = data.invoiceUrl;
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

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
          <div className="mx-auto flex h-16 max-w-6xl items-center px-4">
            <div className="h-10 w-10 rounded-full bg-slate-200" />
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="mb-8 h-9 w-48 rounded-xl bg-slate-200" />
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-5">
            <div className="space-y-6 lg:col-span-3">
              <div className="h-[600px] w-full rounded-xl bg-slate-200" />
            </div>
            <div className="space-y-6 lg:col-span-2">
              <div className="h-80 w-full rounded-xl bg-slate-200" />
            </div>
          </div>
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
  const fee = calculatePaymentFee(selected, price);

  const handlePay = () => {
    if (!selected) return;
    if (selected === "midtrans") {
      createMidtransTransaction.mutate({
        purchaseId: purchase.id,
      });
    } else {
      createPaymentInvoice.mutate({
        purchaseId: purchase.id,
        paymentMethod: selected as "qris" | "shopeepay" | "dana" | "ovo" | "bca" | "bni" | "bri" | "mandiri" | "bsi" | "permata" | "alfamart" | "cc",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Script Midtrans Snap */}
      <Script
        src={
          env.MIDTRANS_IS_PRODUCTION === "false"
            ? "https://app.sandbox.midtrans.com/snap/snap.js"
            : "https://app.midtrans.com/snap/snap.js"
        }
        data-client-key={env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />

      {/* HEADER */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4">
          {purchase.product.user?.catalog?.slug && purchase.product.slug && (
            <Link
              href={`/${purchase.product.user.catalog.slug}/${purchase.product.slug}`}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100"
            >
              <ArrowLeftIcon className="h-5 w-5 text-slate-600" />
            </Link>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-8 text-3xl font-bold text-slate-800">Pembayaran</h1>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-5">
          {/* LEFT - PAYMENT METHODS */}
          <div className="space-y-6 lg:col-span-3 lg:pb-12">
            <div className="rounded-xl border border-slate-300 bg-white p-5 sm:p-6">
              <h2 className="text-center text-sm font-semibold text-slate-900">
                Pilih metode pembayaran
              </h2>

              <div className="mt-6 space-y-7">
                {PAYMENT_METHODS.map((group) => (
                  <div key={group.group}>
                    <p className="mb-3 text-xs font-medium text-slate-500">
                      {group.group}
                    </p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                      {group.methods.map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setSelected(method.id)}
                          className={`group relative flex h-24 flex-col items-center justify-center gap-2 rounded-lg border p-3 text-left transition cursor-pointer ${selected === method.id
                            ? "border-cyan-500 bg-cyan-50"
                            : "border-slate-200 bg-slate-50/60 hover:border-cyan-600 hover:bg-white"
                            } `}
                          aria-pressed={selected === method.id}
                        >
                          {/* Checkmark */}
                          {selected === method.id && (
                            <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500">
                              <svg
                                className="h-3 w-3 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </span>
                          )}

                          <span className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-white px-3 ring-1 ring-slate-200 transition group-hover:ring-cyan-100">
                            {method.icons.map((icon) => (
                              <Image
                                key={icon}
                                src={icon}
                                alt={`${method.label} logo`}
                                width={96}
                                height={32}
                                unoptimized
                                className={`h-auto max-h-8 w-auto max-w-24 object-contain ${method.logoClassName ?? ""}`}
                              />
                            ))}
                          </span>
                          <span className="line-clamp-1 text-center text-xs leading-tight font-semibold text-slate-600">
                            {method.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 border-t border-slate-200 pt-5">
                <button
                  onClick={() => setSelected("midtrans")}
                  className={`w-full group relative flex h-14 items-center justify-center gap-2 rounded-lg border p-3 text-center shadow-sm transition cursor-pointer ${selected === "midtrans"
                    ? "border-cyan-500 bg-cyan-50"
                    : "border-slate-200 bg-slate-50/60 hover:border-cyan-600 hover:bg-white"
                    } `}
                >
                  <span className="font-medium text-slate-800 cursor-pointer">Pay with Midtrans</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT - ORDER SUMMARY */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:col-span-2 lg:h-fit lg:self-start">
            {/* Tagihan */}
            <div className="rounded-xl border border-slate-300 bg-white p-6">
              <h3 className="mb-4 border-b border-slate-300 pb-3 font-semibold text-slate-800">
                Detail Pembayaran
              </h3>

              {/* Buyer info */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Nama</span>
                  <span className="font-medium text-slate-700">{purchase.buyerName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Email</span>
                  <span className="font-medium text-slate-700 break-all text-right max-w-[60%]">{purchase.buyerEmail}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">No. HP</span>
                  <span className="font-medium text-slate-700">{purchase.buyerPhone}</span>
                </div>
              </div>

              {/* Divider */}
              <div className="my-4 border-t border-slate-200" />

              {/* Pricing */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Harga</span>
                  <span className="font-medium text-slate-700">Rp{price.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">
                    Biaya Layanan{selected ? ` (${selected === "midtrans" ? "Midtrans" : PAYMENT_METHODS.flatMap(g => g.methods).find(m => m.id === selected)?.label ?? ""})` : ""}
                  </span>
                  <span className="font-medium text-slate-700">
                    {selected ? `Rp${fee.toLocaleString("id-ID")}` : "Rp0"}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                  <span className="font-semibold text-slate-800">Total</span>
                  <span className="font-bold text-cyan-600">Rp{(price + fee).toLocaleString("id-ID")}</span>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={handlePay}
                disabled={!selected || createPaymentInvoice.isPending || createMidtransTransaction.isPending}
                className="mt-6 w-full cursor-pointer rounded-xl bg-cyan-600 py-3 text-lg font-semibold text-white shadow-sm hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {createPaymentInvoice.isPending || createMidtransTransaction.isPending
                  ? "Memproses..."
                  : "Bayar"}
              </button>

              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
                <ShieldCheckIcon className="h-4 w-4" />
                Aman & terenkripsi
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
