"use client";

import Link from "next/link";
import {
  EnvelopeIcon,
  LockKeyIcon,
} from "@phosphor-icons/react";
import { AuthInput, GoogleAuthButton, AuthDivider } from "~/components/auth/auth-components";
import { Suspense, useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { LoginFormData } from "~/lib/validation";
import { loginSchema } from "~/lib/validation";


function LoginPageInner() {
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified") === "1";
  const [serverError, setServerError] = useState<string | null>(null);

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
      if (result.error.toLowerCase().includes("email belum diverifikasi")) {
        setServerError("Email belum diverifikasi. Silakan cek inbox Anda.");
      } else {
        setServerError("Email atau password salah. Silakan coba lagi.");
      }
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


  return (
    <>
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

          {/* Verification Success */}
          {verified && !serverError && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
              Email berhasil diverifikasi! Silakan login.
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            {/* Email */}
            <AuthInput
              label="Email"
              type="email"
              placeholder="Masukkan Email Anda"
              icon={<EnvelopeIcon size={24} />}
              registration={register("email")}
              error={errors.email}
              required
            />

            {/* Password */}
            <div className="space-y-1">
              <AuthInput
                label="Password"
                type="password"
                placeholder="Masukkan Password Anda"
                icon={<LockKeyIcon size={24} />}
                registration={register("password")}
                error={errors.password}
                required
              />

              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="mt-1 text-xs font-medium text-cyan-600 hover:text-cyan-800 hover:underline"
                >
                  Lupa Password?
                </Link>
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 w-full cursor-pointer rounded-lg border-2 border-slate-800 bg-yellow-200 py-2.5 text-lg font-semibold text-slate-800 shadow-[0px_2px_0px_rgba(29,41,61)] transition duration-200 ease-out hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[0px_2px_0px_rgba(29,41,61)]"
            >
              {isSubmitting ? "Memproses..." : "Login"}
            </button>
          </form>

          {/* Divider */}
          <AuthDivider text="Atau Login dengan" />

          {/* Google SSO */}
          <GoogleAuthButton 
            text="Google" 
            disabled={isSubmitting} 
            onError={setServerError} 
          />

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
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600"></div>
          <p className="text-sm font-medium text-slate-600">Memuat...</p>
        </div>
      </div>
    }>
      <LoginPageInner />
    </Suspense>
  );
}
