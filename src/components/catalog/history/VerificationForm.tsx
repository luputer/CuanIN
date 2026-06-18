"use client";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { EnvelopeIcon, KeyIcon } from "@phosphor-icons/react";

export function VerificationForm({ 
  step, 
  email, 
  setEmail, 
  otp, 
  setOtp, 
  onSubmitEmail, 
  onSubmitOtp, 
  isPending,
  onBack 
}: any) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h2 className="text-lg font-bold mb-4">{step === "EMAIL" ? "Verifikasi Email" : "Masukkan Kode OTP"}</h2>
      {step === "EMAIL" ? (
        <form onSubmit={onSubmitEmail} className="space-y-4">
          <div className="relative">
            <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <Input type="email" placeholder="Masukkan email..." value={email} onChange={e => setEmail(e.target.value)} className="pl-10" required />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>Kirim Kode</Button>
        </form>
      ) : (
        <form onSubmit={onSubmitOtp} className="space-y-4">
          <div className="relative">
            <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <Input type="text" placeholder="6 Digit OTP" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} className="pl-10" required />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>Verifikasi</Button>
          <button type="button" onClick={onBack} className="w-full text-xs text-slate-500">Ganti Email</button>
        </form>
      )}
    </div>
  );
}
