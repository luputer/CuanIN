"use client";

import Link from "next/link";
import {
  EnvelopeIcon,
  LockKeyIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { LoginFormData } from "~/lib/validation";
import { loginSchema } from "~/lib/validation";
import HeaderLandingPage from "~/components/layout/headerlandingpage";
import Footer from "~/components/layout/footer";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    const result = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (result?.error) {
      setServerError("Email atau password salah. Silakan coba lagi.");
    } else {
      // Get session to check role
      const session = await getSession();
      if (session?.user?.role === "ADMIN") {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/dashboard";
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setServerError(null);
    setIsGoogleLoading(true);
    document.cookie = "checkout_google_sso=; Max-Age=0; path=/; SameSite=Lax";

    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      setIsGoogleLoading(false);
      setServerError("Gagal login dengan Google. Silakan coba lagi.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <HeaderLandingPage buttonText="Daftar" buttonHref="/sign-up" />

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:py-20">
        <div className="w-full max-w-lg rounded-2xl border-2 border-slate-800 bg-white p-6 shadow-[0px_4px_0px_rgba(29,41,61)] sm:p-10">
          {/* Title */}
          <div className="pt-2 pb-8 text-center">
            <h1 className="pb-3 text-3xl font-semibold text-cyan-600">Login</h1>
            <p className="text-lg text-slate-800">
              Selamat datang kembali!
              <br />
              Silakan masuk ke akun Anda
            </p>
          </div>

          {/* Server Error */}
          {serverError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {serverError}
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            {/* Email */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-800">
                Email
              </label>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <EnvelopeIcon size={24} />
                </div>

                <input
                  type="email"
                  required
                  placeholder="Masukkan Email Anda"
                  className={`w-full rounded-lg border py-2.5 pr-6 pl-12 text-sm transition-all outline-none placeholder:text-sm placeholder:text-slate-400 focus:ring-2 ${errors.email
                    ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                    : "border-slate-300 bg-slate-100 focus:border-cyan-600 focus:ring-cyan-100"
                    }`}
                  {...register("email")}
                />
              </div>

              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-800">
                Password
              </label>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <LockKeyIcon size={24} />
                </div>

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan Password Anda"
                  className={`w-full rounded-lg border py-2.5 pr-10 pl-12 text-sm text-slate-500 transition-all outline-none placeholder:text-sm placeholder:text-slate-400 focus:ring-2 ${errors.password
                    ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                    : "border-slate-300 bg-slate-100 focus:border-cyan-600 focus:ring-cyan-100"
                    }`}
                  {...register("password")}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon size={18} />
                  ) : (
                    <EyeIcon size={18} />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}

              <div className="flex justify-end">
                <a className="mt-1 text-xs font-medium text-cyan-600 hover:text-cyan-800 hover:underline">
                  Lupa Password?
                </a>
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={isSubmitting || isGoogleLoading}
              className="mt-4 w-full cursor-pointer rounded-lg border-2 border-slate-800 bg-yellow-200 py-2.5 text-lg font-semibold text-slate-800 shadow-[0px_2px_0px_rgba(29,41,61)] transition duration-200 ease-out hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[0px_2px_0px_rgba(29,41,61)]"
            >
              {isSubmitting ? "Memproses..." : "Login"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-300"></span>
            </div>
            <span className="relative bg-white px-2 text-xs text-slate-500">
              Atau Login dengan
            </span>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isSubmitting}
            aria-busy={isGoogleLoading}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-400 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-cyan-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70"
          >
            {isGoogleLoading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-cyan-600" />
                Menghubungkan...
              </>
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </>
            )}
          </button>

          {/* Footer */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Belum punya akun?{" "}
            <Link
              href="/sign-up"
              className="font-medium text-cyan-600 hover:text-cyan-800 hover:underline"
            >
              Daftar Disini
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
