"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import {
  SpinnerIcon,
  StorefrontIcon,
  EnvelopeSimpleIcon,
  ArrowCounterClockwiseIcon,
} from "@phosphor-icons/react";

export default function PortalLandingPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const requestLink = api.purchases.requestPortalLink.useMutation({
    onSuccess: () => setSent(true),
    onError: (err) => setError(err.message || "Terjadi kesalahan"),
  });

  if (sent) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
            <EnvelopeSimpleIcon className="text-green-600" size={28} weight="fill" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Cek Email Kamu!</h1>
          <p className="text-slate-500 text-sm">
            Kami telah mengirim link portal ke <strong>{email}</strong>. Buka email dan klik link untuk mengakses portal kamu.
          </p>
          <p className="text-xs text-slate-400">
            Tidak menemukan email? Cek folder spam atau pastikan email yang kamu masukkan sudah benar.
          </p>
          <button
            onClick={() => { setSent(false); setError(""); }}
            className="inline-flex items-center gap-1.5 text-sm text-cyan-600 hover:text-cyan-700 font-medium mt-2"
          >
            <ArrowCounterClockwiseIcon size={16} />
            Kirim ulang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <StorefrontIcon size={24} weight="bold" className="text-cyan-600" />
            <span className="text-lg font-bold text-slate-800">CuanIN</span>
          </div>
          <div className="w-16 h-16 mx-auto rounded-full bg-cyan-100 flex items-center justify-center">
            <EnvelopeSimpleIcon className="text-cyan-600" size={28} weight="fill" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Customer Portal</h1>
          <p className="text-slate-500 text-sm">
            Masukkan email yang kamu gunakan saat pembelian. Kami akan mengirim link portal agar kamu bisa mengakses semua produk yang sudah dibeli.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError("");
            if (!email.trim()) {
              setError("Email wajib diisi");
              return;
            }
            requestLink.mutate({ email });
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="portal-email" className="block text-sm font-medium text-slate-700 mb-1.5">
              Email Pembelian
            </label>
            <input
              id="portal-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contoh@email.com"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all text-sm"
              disabled={requestLink.isPending}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={requestLink.isPending}
            className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300 text-white font-bold py-3 px-6 rounded-xl border-2 border-slate-800 shadow-[3px_3px_0px_0px_rgba(30,41,59,1)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 flex items-center justify-center gap-2"
          >
            {requestLink.isPending ? (
              <>
                <SpinnerIcon className="animate-spin" size={20} />
                Mengirim...
              </>
            ) : (
              <>
                <EnvelopeSimpleIcon size={20} weight="bold" />
                Kirim Link Portal
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-xs text-slate-400">
            Link akan dikirim ke email yang terdaftar sebagai pembeli. Link berlaku selama 24 jam.
          </p>
        </div>
      </div>
    </div>
  );
}
