// src/components/payment/payment-status-section.tsx
import React from "react";

interface PaymentStatusSectionProps {
  icon: React.ReactNode;
  title: string;
  message: string;
  children?: React.ReactNode;
}

export function PaymentStatusSection({
  icon,
  title,
  message,
  children,
}: PaymentStatusSectionProps) {
  return (
    <div className="rounded-xl border border-slate-300 bg-white p-6 sm:p-8 flex flex-col items-center text-center space-y-3">
      {icon}
      <h1 className="text-2xl font-semibold text-slate-800 mb-2">{title}</h1>
      <p className="text-slate-500 text-sm">{message}</p>
      {children}
    </div>
  );
}
