// src/components/payment/payment-method-info-card.tsx
import React from "react";
import Image from "next/image";
import { CreditCardIcon } from "@phosphor-icons/react";
import { CardContainer } from "~/components/ui/card-container";

export function PaymentMethodInfoCard() {
  return (
    <CardContainer shadow={false} className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cuan-cyan/10 text-cuan-cyan">
          <CreditCardIcon size={24} weight="duotone" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">Gerbang Pembayaran Otomatis</h3>
          <p className="text-xs text-slate-500">Mendukung QRIS, Virtual Account, E-Wallet, dll.</p>
        </div>
      </div>
      <Image
        src="/icons/midtrans.svg"
        alt="Midtrans Secure"
        width={80}
        height={20}
        className="opacity-70 object-contain h-5 w-auto"
        onError={(e) => (e.currentTarget.style.display = 'none')}
      />
    </CardContainer>
  );
}
