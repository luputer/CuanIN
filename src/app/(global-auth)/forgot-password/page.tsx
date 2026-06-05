"use client";

import Link from "next/link";
import { EnvelopeIcon, CaretLeftIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "~/trpc/react";
import HeaderLandingPage from "~/components/layout/headerlandingpage";
import Footer from "~/components/layout/footer";

const forgotPasswordSchema = z.object({
  email: z.string().email("Format email tidak valid"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const forgotPasswordMutation = api.auth.forgotPassword.useMutation({
    onSuccess: () => {
      setIsSuccess(true);
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPasswordMutation.mutate(data);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <HeaderLandingPage buttonText="Login" buttonHref="/sign-in" />

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg rounded-2xl border-2 border-slate-800 bg-white p-6 shadow-[0px_4px_0px_rgba(29,41,61)] sm:p-10">
          <div className="mb-6">
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-cyan-600"
            >
              <CaretLeftIcon size={16} />
              Kembali ke Login
            </Link>
          </div>

          <div className="pt-2 pb-8 text-center">
            <h1 className="pb-3 text-3xl font-semibold text-cyan-600">
              Lupa Password?
            </h1>
            <p className="text-lg text-slate-800">
              Masukkan email Anda dan kami akan mengirimkan link untuk mereset password.
            </p>
          </div>

          {isSuccess ? (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-6 text-center">
              <div className="mb-3 flex items-center justify-center text-green-800">
                <EnvelopeIcon size={32} weight="fill" />
              </div>
              <h2 className="mb-2 text-lg font-semibold text-green-800">Cek Email Anda</h2>
              <p className="text-green-700 text-sm">
                Instruksi reset password telah dikirim ke email Anda. Silakan cek inbox atau folder spam Anda.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
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

              <button
                type="submit"
                disabled={forgotPasswordMutation.isPending}
                className="mt-4 w-full cursor-pointer rounded-lg border-2 border-slate-800 bg-yellow-200 py-2.5 text-lg font-semibold text-slate-800 shadow-[0px_2px_0px_rgba(29,41,61)] transition duration-200 ease-out hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-70"
              >
                {forgotPasswordMutation.isPending ? "Mengirim..." : "Kirim Link Reset"}
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
