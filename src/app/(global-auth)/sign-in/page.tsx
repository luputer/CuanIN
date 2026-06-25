"use client";

import Link from "next/link";
import {
  EnvelopeIcon,
  LockKeyIcon,
} from "@phosphor-icons/react";
import { AuthInput, GoogleAuthButton, AuthDivider } from "~/components/auth/auth-components";
import { Suspense, useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { LoginFormData } from "~/lib/validation";
import { loginSchema } from "~/lib/validation";


function LoginPageInner() {
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified") === "1";
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

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
      // const session = await getSession();
      // if (session?.user?.role === "ADMIN") {
      //   window.location.href = "/admin/dashboard";
      // } else {
      //   const res = await fetch("/api/trpc/catalog.getMine?input=%7B%7D", {
      //     headers: { "Content-Type": "application/json" },
      //   });
      //   const json = await res.json();
      //   // console.log("catalog response:", JSON.stringify(json)); // ← liat di console
      //   const hasCatalog = !!json?.result?.data?.slug;
      //   window.location.href = hasCatalog ? "/dashboard" : "/setup";
      // }

      const session = await getSession();
      if (session?.user?.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard"); // layout akan redirect ke /setup kalau belum ada catalog
      }
    }
  };


  return (
    <>
      {/* Title */}
      <div className="pt-2 pb-8 text-center">
        <h1 className="pb-3 text-3xl font-semibold text-cuan-blue">Login</h1>
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
              className="mt-1 text-xs font-medium text-cuan-blue hover:text-cuan-blue hover:underline"
            >
              Lupa Password?
            </Link>
          </div>
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 w-full cursor-pointer rounded-lg border-2 border-slate-800 bg-cuan-blue py-2.5 text-lg font-semibold text-white shadow-[0px_2px_0px_#000] transition duration-200 ease-out hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[0px_2px_0px_#000]"
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
          className="font-medium text-cuan-blue hover:text-cuan-blue hover:underline"
        >
          Daftar Disini
        </Link>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full animate-pulse space-y-6">
          {/* Title Skeleton */}
          <div className="flex flex-col items-center pt-2 pb-8 space-y-3">
            <div className="h-9 w-24 rounded-lg bg-slate-200"></div>
            <div className="h-5 w-48 rounded-md bg-slate-200"></div>
            <div className="h-5 w-40 rounded-md bg-slate-200"></div>
          </div>

          {/* Form Skeleton */}
          <div className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <div className="h-4 w-14 rounded bg-slate-200"></div>
              <div className="h-12 w-full rounded-lg bg-slate-200"></div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="h-4 w-16 rounded bg-slate-200"></div>
              <div className="h-12 w-full rounded-lg bg-slate-200"></div>
              <div className="flex justify-end pt-1">
                <div className="h-3 w-20 rounded bg-slate-200"></div>
              </div>
            </div>

            {/* Login Button */}
            <div className="pt-4">
              <div className="h-12 w-full rounded-lg bg-slate-200"></div>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center py-2">
            <div className="h-4 w-32 rounded bg-slate-200"></div>
          </div>

          {/* Google SSO Button */}
          <div className="h-11 w-full rounded-lg bg-slate-200"></div>

          {/* Footer */}
          <div className="flex justify-center pt-2">
            <div className="h-4 w-44 rounded bg-slate-200"></div>
          </div>
        </div>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}
