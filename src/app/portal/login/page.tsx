"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import Image from "next/image";
import { ShoppingBagIcon, EnvelopeSimpleIcon, LockIcon, SignInIcon } from "@phosphor-icons/react";
import { CatalogNavHeader } from "~/components/layout/catalog-nav-header";

const getCookie = (name: string) => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
};

const setCookie = (name: string, value: string, days: number) => {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
};

function PortalLoginPageContent() {
  const [step, setStep] = useState<"EMAIL" | "OTP">("EMAIL");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otp, setOtp] = useState("");

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      setEmailError("Format email tidak valid");
    } else {
      setEmailError("");
    }
  };

  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const ref = searchParams.get("ref");
  const backHref = ref ? (ref.startsWith("/") ? ref : `/${ref}`) : undefined;
  const dashboardUrl = ref ? `/portal/dashboard?ref=${encodeURIComponent(ref)}` : "/portal/dashboard";

  const tokenParam = searchParams.get("token");
  const [isVerifyingToken, setIsVerifyingToken] = useState(false);

  const isLoggedInViaToken = () => {
    const authorizedEmail = getCookie("history_authorized_email");
    const savedToken = localStorage.getItem("history_access_token");
    return !!(authorizedEmail && savedToken);
  };

  const loginWithToken = api.purchases.loginWithPortalToken.useMutation({
    onMutate: () => {
      setIsVerifyingToken(true);
    },
    onSuccess: (data) => {
      localStorage.setItem("history_access_token", data.accessToken);
      setCookie("history_authorized_email", data.email, 30);
      toast.success("Login berhasil via token!");
      router.replace(dashboardUrl);
    },
    onError: (err) => {
      toast.error(err.message || "Token akses tidak valid.");
      setIsVerifyingToken(false);
      // Hapus token dari URL agar user bisa login manual
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("token");
      router.replace(`/portal/login${newParams.toString() ? `?${newParams.toString()}` : ""}`);
    },
  });

  // Check login state and redirect if already logged in via portal token
  useEffect(() => {
    if (status === "loading") return;

    if (isLoggedInViaToken() && !tokenParam) {
      router.replace(dashboardUrl);
    }
  }, [session, status, router, dashboardUrl, tokenParam]);

  // Efek untuk memicu verifikasi token dari URL secara otomatis
  useEffect(() => {
    if (tokenParam) {
      loginWithToken.mutate({ token: tokenParam });
    }
  }, [tokenParam]);

  const sendOtp = api.purchases.sendPurchaseHistoryOtp.useMutation({
    onSuccess: () => {
      setStep("OTP");
      toast.success("OTP telah dikirim ke email kamu.");
    },
    onError: (err) => toast.error(err.message),
  });

  const verifyOtp = api.purchases.verifyPurchaseHistoryOtp.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("history_access_token", data.accessToken);
      setCookie("history_authorized_email", email, 30);
      toast.success("Verifikasi berhasil!");
      router.push(dashboardUrl);
    },
    onError: (err) => toast.error(err.message),
  });

  const emailForm = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (email.trim() && !emailError) {
          sendOtp.mutate({ email });
        }
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm text-slate-700 font-semibold">
          Alamat Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="nama@email.com"
          className={`w-full mt-2 px-4 py-2.5 rounded-xl border transition bg-white focus:outline-none text-sm ${emailError ? "border-red-400 focus:border-red-500" : "border-slate-300 focus:border-cuan-cyan focus:ring-1 focus:ring-cuan-cyan/20"}`}
          disabled={sendOtp.isPending}
          required
        />
        {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
      </div>

      <button
        type="submit"
        disabled={sendOtp.isPending || !email.trim() || !!emailError}
        className="w-full bg-cuan-cyan hover:bg-[#008BB5] disabled:bg-slate-300 text-white font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        {sendOtp.isPending ? (
          "Mengirim..."
        ) : (
          <>
            <EnvelopeSimpleIcon size={18} weight="bold" />
            Kirim Kode Masuk
          </>
        )}
      </button>
    </form>
  );

  const otpForm = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (otp.trim()) {
          verifyOtp.mutate({ email, otp });
        }
      }}
      className="space-y-4"
    >
      <div className="text-center bg-slate-50 rounded-lg p-3">
        <p className="text-xs text-slate-500">Cek Email Anda. Kode dikirim ke:</p>
        <p className="text-sm font-semibold text-slate-800">{email}</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="otp" className="text-sm font-semibold text-slate-700">
          Masukkan 6 Digit Kode
        </label>
        <input
          id="otp"
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="000000"
          className="w-full mt-2 px-4 py-2.5 rounded-xl border border-slate-300 transition bg-white focus:outline-none focus:border-cuan-cyan focus:ring-1 focus:ring-cuan-cyan/20 text-center tracking-widest font-mono text-lg"
          disabled={verifyOtp.isPending}
          required
        />
      </div>

      <button
        type="submit"
        disabled={verifyOtp.isPending}
        className="w-full bg-cuan-cyan hover:bg-[#008BB5] disabled:bg-slate-300 text-white font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        {verifyOtp.isPending ? "Memverifikasi..." : "Masuk ke Portal"}
      </button>

      <button
        type="button"
        onClick={() => {
          setStep("EMAIL");
          setOtp("");
        }}
        className="cursor-pointer w-full underline text-xs text-slate-500 hover:text-slate-800 font-medium py-1"
      >
        Salah Email?
      </button>
    </form>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <CatalogNavHeader backHref={backHref} />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center space-y-4">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="bg-cuan-cyan/10 p-3 rounded-full text-cuan-cyan">
                <ShoppingBagIcon size={32} weight="fill" />
              </div>
              <h1 className="text-2xl font-semibold text-slate-800">Portal Pelanggan</h1>
            </div>
            <p className="text-slate-500 text-sm">
              Masuk untuk mengakses produk yang telah Anda beli dan melihat riwayat transaksi.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-300 shadow-[0_-4px_0px_0px_#00B3E9] space-y-6">
            {isVerifyingToken ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cuan-cyan" />
                <p className="text-sm font-medium text-slate-600">Memverifikasi token akses portal...</p>
              </div>
            ) : session?.user?.email && !isLoggedInViaToken() ? (
              <div className="space-y-4">
                <div className="text-center bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">
                    Login sebagai <span className="font-semibold text-slate-700">{session.user.email}</span>
                  </p>
                </div>
                <button
                  onClick={() => router.push(dashboardUrl)}
                  className="w-full bg-white border-cuan-cyan hover:bg-cuan-cyan/10 text-cuan-cyan border font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <SignInIcon size={18} weight="bold" />
                  Masuk ke Portal
                </button>
                <div className="relative flex items-center gap-2">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs font-medium text-slate-400">atau pakai email lain</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                {step === "EMAIL" ? emailForm : otpForm}
              </div>
            ) : step === "EMAIL" ? (
              emailForm
            ) : (
              otpForm
            )}
          </div>
        </div>
      </main>

      <footer className="text-center py-6 border-t border-slate-200 mt-auto bg-white">
        <div className="flex items-center justify-center gap-3 text-xs text-slate-400 font-bold uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <LockIcon size={12} weight="fill" />
            <span>Powered by</span>
          </div>
          <Image
            src="/logo-cuanin.svg"
            alt="CuanIN"
            width={60}
            height={18}
            className="h-5 w-auto object-contain"
          />
        </div>
      </footer>
    </div>
  );
}

export default function PortalLoginPage() {
  return (
    <Suspense>
      <PortalLoginPageContent />
    </Suspense>
  );
}
