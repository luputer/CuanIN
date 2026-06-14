"use client";


import Link from "next/link";
import { EnvelopeIcon, CaretLeftIcon, CheckCircleIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "~/trpc/react";
import { AuthInput } from "~/components/auth/auth-components";



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
    <>
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
          Masukkan email Anda dan kami akan mengirimkan link untuk reset password.
        </p>
      </div>

      {isSuccess ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-6 text-center">
          <div className="mb-3 flex justify-center text-green-600">
            <CheckCircleIcon size={40} weight="fill" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-green-800">Cek Email Anda</h2>
          <p className="text-green-700">
            Instruksi reset password telah dikirim ke email Anda. Silakan cek inbox atau folder spam Anda.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <AuthInput
            label="Email"
            type="email"
            placeholder="Masukkan Email Anda"
            icon={<EnvelopeIcon size={24} />}
            registration={register("email")}
            error={errors.email}
          />

          <button
            type="submit"
            disabled={forgotPasswordMutation.isPending}
            className="mt-4 w-full cursor-pointer rounded-lg border-2 border-slate-800 bg-yellow-200 py-2.5 text-lg font-semibold text-slate-800 shadow-[0px_2px_0px_rgba(29,41,61)] transition duration-200 ease-out hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-70"
          >
            {forgotPasswordMutation.isPending ? "Mengirim..." : "Kirim Link Reset"}
          </button>
        </form>
      )}
    </>
  );
}
