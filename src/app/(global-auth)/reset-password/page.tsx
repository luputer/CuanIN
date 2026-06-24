"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LockKeyIcon, CheckCircleIcon } from "@phosphor-icons/react";
import { AuthInput } from "~/components/auth/auth-components";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "~/trpc/react";

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
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mx-auto size-12 border-4 border-cuan-blue/30 border-t-cuan-blue rounded-full animate-spin mb-4" />
        <p className="text-slate-600">Memvalidasi link...</p>
      </div>
    );
  }

  if (!token || tokenData?.valid === false) {
    return (
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold text-red-600">Link Tidak Valid</h1>
        <p className="mb-8 text-slate-600">
          Link reset password Anda sudah tidak berlaku, kadaluwarsa, atau tidak lengkap. Silakan minta link baru.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block rounded-lg border-2 border-slate-800 bg-cuan-blue px-8 py-3 text-lg font-semibold text-white shadow-[0px_2px_0px_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
        >
          Minta Link Baru
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="pt-2 pb-8 text-center">
        <h1 className="pb-3 text-3xl font-semibold text-cuan-blue">
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
          <AuthInput
            label="Password Baru"
            type="password"
            placeholder="Minimal 8 karakter"
            icon={<LockKeyIcon size={24} />}
            registration={register("password")}
            error={errors.password}
          />

          {/* Confirm Password */}
          <AuthInput
            label="Konfirmasi Password Baru"
            type="password"
            placeholder="Ulangi Password Baru"
            icon={<LockKeyIcon size={24} />}
            registration={register("confirmPassword")}
            error={errors.confirmPassword}
          />

          <button
            type="submit"
            disabled={resetPasswordMutation.isPending}
            className="mt-4 w-full cursor-pointer rounded-lg border-2 border-slate-800 bg-cuan-blue py-2.5 text-lg font-semibold text-white shadow-[0px_2px_0px_#000] transition duration-200 ease-out hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[0px_2px_0px_#000]"
          >
            {resetPasswordMutation.isPending ? "Memproses..." : "Simpan Password Baru"}
          </button>
        </form>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Memuat...</div>}>
      <ResetPasswordInner />
    </Suspense>
  );
}
