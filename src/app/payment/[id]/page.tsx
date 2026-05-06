"use client";

import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import { calculatePaymentFee } from "~/lib/utils";
import Image from "next/image";
import {
  SpinnerIcon,
  ShieldCheckIcon,
  EnvelopeSimpleIcon,
  PhoneIcon,
  CaretDownIcon,
} from "@phosphor-icons/react";
import React from "react";
import { toast } from "sonner";

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
  | "cc";

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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <SpinnerIcon className="h-8 w-8 animate-spin text-cyan-600" />
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
    createPaymentInvoice.mutate({
      purchaseId: purchase.id,
      paymentMethod: selected,
    });
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      {/* HEADER */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4">
          <span className="text-xl font-bold text-cyan-600">CuanIN</span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-6 text-3xl font-bold text-slate-900">Checkout</h1>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* LEFT - PAYMENT METHODS */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
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
                        className={`group relative flex h-24 flex-col items-center justify-center gap-2 rounded-lg border p-3 text-left shadow-sm transition ${
                          selected === method.id
                            ? "border-cyan-500 bg-cyan-50 shadow-[0_0_0_3px_rgba(6,182,212,0.14)]"
                            : "border-slate-200 bg-slate-50/60 hover:border-cyan-300 hover:bg-white hover:shadow-md"
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
          </div>

          {/* RIGHT - ORDER SUMMARY */}
          <div className="space-y-4 lg:sticky lg:top-24">
            {/* Tagihan */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-t-[5px] border-slate-900 px-5 pt-6 pb-5">
                <h3 className="text-center font-bold text-slate-900 text-lg">
                  Tagihan
                </h3>

                {/* Buyer info */}
                <div className="mt-6 space-y-2.5">
                  <p className="font-bold text-slate-800 text-[15px]">
                    {purchase.buyerName}
                  </p>
                  <div className="flex items-center gap-2.5 text-sm text-slate-600">
                    <EnvelopeSimpleIcon className="w-4 h-4 text-slate-400" />
                    <p className="break-all font-medium text-[13px]">{purchase.buyerEmail}</p>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-slate-600">
                    <PhoneIcon className="w-4 h-4 text-slate-400" />
                    <p className="font-medium text-[13px]">{purchase.buyerPhone}</p>
                  </div>
                </div>

                {/* Note */}
                <p className="mt-6 text-[11px] leading-relaxed text-slate-400 italic">
                  *Informasi lebih lanjut terkait layanan yang telah dibayarkan akan dikirimkan melalui email.
                </p>
              </div>

              {/* Item Awal */}
              <div className="border-t border-slate-200 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 cursor-pointer">
                    <span className="text-[15px] text-slate-800">Item Awal</span>
                    <CaretDownIcon className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <span className="text-[15px] font-semibold text-slate-800">
                    Rp{price.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Biaya Layanan */}
              <div className="border-t border-slate-200 px-5 py-4">
                <p className="text-[15px] text-slate-800 mb-2">Biaya Layanan</p>
                <div className="flex items-center justify-between text-[13px] text-slate-600">
                  <span className="flex items-center gap-1">
                    {selected ? `1x ${PAYMENT_METHODS.flatMap(g => g.methods).find(m => m.id === selected)?.label ?? ""}` : "-"}
                  </span>
                  <span>{selected ? `Rp${fee.toLocaleString("id-ID")}` : "Rp0"}</span>
                </div>
              </div>

              {/* Total & Button */}
              <div className="border-t border-slate-200 px-5 py-5">
                <div className="flex items-center justify-between mb-5">
                  <span className="font-bold text-slate-900 text-[15px]">Total</span>
                  <span className="text-base font-bold text-slate-900">
                    Rp{(price + fee).toLocaleString("id-ID")}
                  </span>
                </div>

                {/* CTA Button */}
                <button
                  onClick={handlePay}
                  disabled={!selected || createPaymentInvoice.isPending}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-[#FFDF20] py-3 text-[15px] font-semibold text-slate-900 transition hover:bg-[#F2D219] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                >
                  {createPaymentInvoice.isPending
                    ? "Memproses..."
                    : "Bayar"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <ShieldCheckIcon className="h-3.5 w-3.5" />
              Transaksi aman & terenkripsi
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
