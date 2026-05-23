"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LockKeyIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon } from "@phosphor-icons/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "~/trpc/react";
import HeaderLandingPage from "~/components/layout/headerlandingpage";
import Footer from "~/components/layout/footer";
import Link from "next/link";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password minimal 8 karakter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const emailParam = searchParams.get("email"); // Fallback display email

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Pre-validate token on page load
  const { data: tokenData, isLoading: isTokenLoading } = api.auth.checkResetToken.useQuery(
    { token },
    { enabled: !!token, retry: false }
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const resetPasswordMutation = api.auth.resetPassword.useMutation({
    onSuccess: () => {
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/sign-in");
      }, 3000);
    },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    if (!token) return;
    resetPasswordMutation.mutate({
      token,
      password: data.password,
    });
  };

  const displayEmail = tokenData?.email ?? emailParam;

  if (isTokenLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-white text-center justify-center">
        <div className="mx-auto w-12 h-12 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-600">Memvalidasi link...</p>
      </div>
    );
  }

  if (!token || tokenData?.valid === false) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <HeaderLandingPage buttonText="Login" buttonHref="/sign-in" />
        <main className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-lg rounded-2xl border-2 border-slate-800 bg-white p-10 text-center shadow-[0px_4px_0px_rgba(29,41,61)]">
            <h1 className="mb-4 text-2xl font-bold text-red-600">Link Tidak Valid</h1>
            <p className="mb-8 text-slate-600">
              Link reset password Anda sudah tidak berlaku, kadaluwarsa, atau tidak lengkap. Silakan minta link baru.
            </p>
            <Link
              href="/forgot-password"
              className="inline-block rounded-lg border-2 border-slate-800 bg-yellow-200 px-8 py-3 text-lg font-semibold text-slate-800 shadow-[0px_2px_0px_rgba(29,41,61)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              Minta Link Baru
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <HeaderLandingPage buttonText="Login" buttonHref="/sign-in" />

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg rounded-2xl border-2 border-slate-800 bg-white p-6 shadow-[0px_4px_0px_rgba(29,41,61)] sm:p-10">
          <div className="pt-2 pb-8 text-center">
            <h1 className="pb-3 text-3xl font-semibold text-cyan-600">
              Reset Password
            </h1>
            <p className="text-lg text-slate-800">
              Silakan masukkan password baru Anda {displayEmail ? <>untuk akun <br /><span className="font-semibold">{displayEmail}</span></> : "untuk akun Anda"}
            </p>
          </div>

          {isSuccess ? (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-6 text-center">
              <div className="mb-3 flex justify-center text-green-500">
                <CheckCircleIcon size={48} weight="fill" />
              </div>
              <h2 className="mb-2 text-xl font-bold text-green-800">Password Diperbarui!</h2>
              <p className="text-green-700">
                Password Anda telah berhasil diubah. Anda akan dialihkan ke halaman login dalam beberapa detik.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              {resetPasswordMutation.error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {resetPasswordMutation.error.message}
                </div>
              )}

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-800">
                  Password Baru
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <LockKeyIcon size={24} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimal 8 karakter"
                    className={`w-full rounded-lg border py-2.5 pr-10 pl-12 text-sm transition-all outline-none focus:ring-2 ${
                      errors.password
                        ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                        : "border-slate-300 bg-slate-100 focus:border-cyan-600 focus:ring-cyan-100"
                    }`}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-800">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <LockKeyIcon size={24} />
                  </div>
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Ulangi Password Baru"
                    className={`w-full rounded-lg border py-2.5 pr-10 pl-12 text-sm transition-all outline-none focus:ring-2 ${
                      errors.confirmPassword
                        ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                        : "border-slate-300 bg-slate-100 focus:border-cyan-600 focus:ring-cyan-100"
                    }`}
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirm ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={resetPasswordMutation.isPending}
                className="mt-4 w-full cursor-pointer rounded-lg border-2 border-slate-800 bg-yellow-200 py-2.5 text-lg font-semibold text-slate-800 shadow-[0px_2px_0px_rgba(29,41,61)] transition duration-200 ease-out hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-70"
              >
                {resetPasswordMutation.isPending ? "Memproses..." : "Simpan Password Baru"}
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Memuat...</div>}>
      <ResetPasswordInner />
    </Suspense>
  );
}
