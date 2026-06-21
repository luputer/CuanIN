"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { OTPInput, type SlotProps } from "input-otp";
import { EnvelopeIcon, ArrowClockwiseIcon } from "@phosphor-icons/react";
function Slot(props: SlotProps) {
  return (
    <div
      className={`relative flex h-14 w-12 items-center justify-center rounded-lg border-2 border-slate-300 bg-slate-50 text-2xl font-bold text-slate-800 transition-all ${props.isActive ? "border-cuan-blue ring-2 ring-cuan-blue/20" : ""
        }`}
    >
      {props.char !== null && <div>{props.char}</div>}
      {props.hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-px animate-caret-blink bg-cuan-blue" />
        </div>
      )}
    </div>
  );
}

function VerifyOtpInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") ?? "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    // Security check: verify if the email in URL matches the cookie set during signup
    const getCookie = (name: string) => {
      if (typeof document === "undefined") return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
    };

    const authorizedEmail = getCookie("otp_authorized_email");

    if (!email || authorizedEmail !== email) {
      router.push("/sign-up");
    }
  }, [email, router]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const verifyMutation = api.auth.verifyOtp.useMutation({
    onSuccess: () => {
      router.push("/sign-in?verified=1");
    },
    onError: (err) => {
      setError(err.message);
      setOtp("");
    },
  });

  const resendMutation = api.auth.resendOtp.useMutation({
    onSuccess: () => {
      setResendTimer(60);
      setError(null);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleVerify = () => {
    if (otp.length !== 6) return;
    setError(null);
    verifyMutation.mutate({ otp, email });
  };

  const handleResend = () => {
    if (resendTimer === 0) {
      resendMutation.mutate({ email });
    }
  };

  return (
    <div className="text-center">
      <div className="mb-6 flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cuan-blue/10 text-cuan-blue">
          <EnvelopeIcon size={40} weight="fill" />
        </div>
      </div>

      <h1 className="mb-2 text-2xl font-semibold text-slate-800">Verifikasi OTP</h1>
      <p className="mb-8 text-slate-600">
        Masukkan 6 digit kode yang telah kami kirimkan ke email <br />
        <span className="font-semibold text-slate-800">{email}</span>
      </p>

      <div className="flex justify-center mb-6">
        <OTPInput
          maxLength={6}
          value={otp}
          onChange={setOtp}
          disabled={verifyMutation.isPending}
          containerClassName="group flex items-center gap-2"
          render={({ slots }) => (
            <>
              {slots.map((slot, idx) => (
                <Slot key={idx} {...slot} />
              ))}
            </>
          )}
        />
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={handleVerify}
          disabled={otp.length !== 6 || verifyMutation.isPending}
          className="w-full rounded-lg border-2 border-slate-800 bg-cuan-blue py-3 text-lg font-semibold text-white shadow-[0px_2px_0px_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {verifyMutation.isPending ? "Memverifikasi..." : "Verifikasi Akun"}
        </button>

        <div className="text-sm text-slate-500">
          Tidak menerima kode?{" "}
          {resendTimer > 0 ? (
            <span className="font-medium text-cuan-blue">
              Kirim ulang dalam {resendTimer}s
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resendMutation.isPending}
              className="font-medium text-cuan-blue hover:text-cuan-blue hover:underline inline-flex items-center gap-1"
            >
              <ArrowClockwiseIcon className={resendMutation.isPending ? "animate-spin" : ""} />
              Kirim Ulang Kode
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="flex w-full justify-center text-cuan-blue">Loading...</div>}>
      <VerifyOtpInner />
    </Suspense>
  );
}
