"use client";

import React, { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import type { UseFormRegisterReturn, FieldError } from "react-hook-form";
import { signIn } from "next-auth/react";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: React.ReactNode;
  registration: UseFormRegisterReturn;
  error?: FieldError;
}

export function AuthInput({ label, icon, registration, error, type, ...props }: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const currentType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-slate-800">{label}</label>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
          {icon}
        </div>

        <input
          type={currentType}
          className={`w-full rounded-lg border py-2.5 pl-12 text-sm transition-all outline-none placeholder:text-sm focus:ring-2 ${
            isPassword ? "pr-10 text-slate-500 placeholder:text-slate-400" : "pr-6 placeholder:text-slate-400"
          } ${
            props.readOnly
              ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-500 focus:border-gray-200 focus:ring-0"
              : error
              ? "border-red-400 focus:border-red-400 focus:ring-red-100 bg-white"
              : "border-slate-300 bg-slate-100 focus:border-cyan-600 focus:ring-cyan-100"
          }`}
          {...registration}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error.message}</p>}
    </div>
  );
}

interface GoogleAuthButtonProps {
  text: string;
  disabled?: boolean;
  onError?: (msg: string) => void;
}

export function GoogleAuthButton({ text, disabled, onError }: GoogleAuthButtonProps) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    document.cookie = "checkout_google_sso=; Max-Age=0; path=/; SameSite=Lax";
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      setIsGoogleLoading(false);
      if (onError) {
        onError("Gagal menggunakan Google SSO. Silakan coba lagi.");
      }
    }
  };

  const isBusy = isGoogleLoading;
  const isDisabled = disabled || isBusy;

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={isDisabled}
      aria-busy={isBusy}
      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-400 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-cyan-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70"
    >
      {isBusy ? (
        <>
          <span className="size-5 animate-spin rounded-full border-2 border-slate-300 border-t-cyan-600" />
          Menghubungkan...
        </>
      ) : (
        <>
          <svg className="size-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          {text}
        </>
      )}
    </button>
  );
}

export function AuthDivider({ text }: { text: string }) {
  return (
    <div className="relative my-6 text-center">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-slate-300"></span>
      </div>
      <span className="relative bg-white px-2 text-xs text-slate-500">
        {text}
      </span>
    </div>
  );
}
