"use client";

import { Suspense } from "react";
import Link from "next/link";
import {
  UserIcon,
  EnvelopeIcon,
  LockKeyIcon,
  PhoneIcon,
} from "@phosphor-icons/react";
import { AuthInput, GoogleAuthButton, AuthDivider } from "~/components/auth/auth-components";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/trpc/react";
import type { SignupFormData } from "~/lib/validation";
import { signupSchema } from "~/lib/validation";


function SignupPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: session, status } = useSession();

  const fromGoogle =
    searchParams.get("fromGoogle") === "1" || !!session?.user;
  const googleName = searchParams.get("name") ?? session?.user?.name ?? "";
  const googleEmail = searchParams.get("email") ?? session?.user?.email ?? "";

  const [serverErrorFallback, setServerErrorFallback] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: googleName, email: googleEmail },
  });

  // Handle auto-redirect if already logged in (extra safety layer on top of middleware)
  useEffect(() => {
    if (status === "authenticated" && !fromGoogle) {
      router.push("/dashboard");
    }
  }, [status, router, fromGoogle]);

  // Pre-fill fields once session or params are ready
  useEffect(() => {
    if (googleName) setValue("name", googleName);
    if (googleEmail) setValue("email", googleEmail);
  }, [googleName, googleEmail, setValue]);

  // ✅ tRPC mutation
  const registerMutation = api.auth.register.useMutation({
    onSuccess: async (_result, variables) => {
      // Set temporary cookie for OTP access (expires in 15 mins)
      document.cookie = `otp_authorized_email=${variables.email}; Max-Age=900; path=/; SameSite=Lax`;
      router.push(`/verify-otp?email=${variables.email}`);
    },
  });

  const onSubmit = (data: SignupFormData) => {
    registerMutation.mutate({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
    });
  };

  const isPending = registerMutation.isPending;
  const serverError = registerMutation.error?.message ?? serverErrorFallback ?? null;

  return (
    <>
          {/* Title */}
          <div className="pt-2 pb-8 text-center">
            <h1 className="pb-3 text-3xl font-semibold text-cuan-blue">
              Daftar
            </h1>
            <p className="text-lg text-slate-800">
              Selamat datang!
              <br />
              Silahkan daftarkan akun Anda
            </p>
          </div>

          {/* Google banner */}
          {fromGoogle && (
            <div className="mb-5 rounded-lg border border-cuan-blue/20 bg-cuan-blue/5 px-4 py-3 text-sm text-cuan-blue">
              🎉 Akun Google Anda terdeteksi! Lengkapi data di bawah untuk
              menyelesaikan pendaftaran.
            </div>
          )}

          {/* Server Error */}
          {serverError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {serverError}
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
          >
            {/* Nama Lengkap */}
            <AuthInput
              label="Nama Lengkap"
              type="text"
              placeholder="Masukkan Nama Lengkap Anda"
              icon={<UserIcon size={24} />}
              registration={register("name")}
              error={errors.name}
              readOnly={fromGoogle && !!googleName}
            />

            {/* Email */}
            <AuthInput
              label="Email"
              type="email"
              placeholder="Masukkan Email Anda"
              icon={<EnvelopeIcon size={24} />}
              registration={register("email")}
              error={errors.email}
              readOnly={fromGoogle && !!googleEmail}
            />

            {/* Nomor HP */}
            <AuthInput
              label="Nomor Telepon/HP"
              type="tel"
              placeholder="08123456789"
              icon={<PhoneIcon size={24} />}
              registration={register("phone")}
              error={errors.phone}
            />

            {/* Password */}
            <AuthInput
              label="Password"
              type="password"
              placeholder="Buat Password"
              icon={<LockKeyIcon size={24} />}
              registration={register("password")}
              error={errors.password}
            />

            {/* Confirm Password */}
            <AuthInput
              label="Konfirmasi Password"
              type="password"
              placeholder="Ketik Ulang Password"
              icon={<LockKeyIcon size={24} />}
              registration={register("confirmPassword")}
              error={errors.confirmPassword}
            />

            {/* Button */}
            <button
              type="submit"
              disabled={isPending}
              className="mt-4 w-full cursor-pointer rounded-lg border-2 border-slate-800 bg-cuan-blue py-2.5 text-lg font-semibold text-white shadow-[0px_2px_0px_#000] transition duration-200 ease-out hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[0px_2px_0px_#000]"
            >
              {isPending ? "Memproses..." : "Daftar Sekarang"}
            </button>
          </form>

          {/* Only show alternate Google signup if NOT coming from Google */}
          {!fromGoogle && (
            <>
              {/* Divider */}
              <AuthDivider text="Atau Daftar dengan" />

              {/* Google SSO */}
              <GoogleAuthButton 
                text="Google" 
                disabled={isPending} 
                onError={setServerErrorFallback} 
              />
            </>
          )}
          {/* Footer */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Sudah punya akun?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-cuan-blue hover:text-cuan-blue hover:underline"
            >
              Login Disini
            </Link>
          </div>
    </>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-cuan-blue/30 border-t-cuan-blue"></div>
            <p className="text-sm font-medium text-slate-600">Memuat...</p>
          </div>
        </div>
      }
    >
      <SignupPageInner />
    </Suspense>
  );
}
