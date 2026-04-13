"use client";

import { Suspense } from "react";
import Link from "next/link";
import { User, Envelope, LockKey, Phone, Eye, EyeSlash } from "phosphor-react";
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/trpc/react";
import type { SignupFormData } from "~/lib/validation";
import { signupSchema } from "~/lib/validation";
import HeaderLandingPage from "~/components/layout/headerlandingpage";
import Footer from "~/components/layout/footer";


function SignupPageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const { data: session, update: updateSession, status } = useSession();

    const [isSuccess, setIsSuccess] = useState(false);
    const fromGoogle = searchParams.get("fromGoogle") === "1" || (!!session?.user && !isSuccess);
    const googleName = searchParams.get("name") ?? session?.user?.name ?? "";
    const googleEmail = searchParams.get("email") ?? session?.user?.email ?? "";

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);


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
            setIsSuccess(true);
            
            // For both regular and Google users, sign in automatically using credentials.
            // Since NextAuth `signIn` callback aborts the session if phone number is missing,
            // Google SSO users arriving here actually don't have an active session yet.
            const loginResult = await signIn("credentials", {
                redirect: false,
                email: variables.email,
                password: variables.password,
            });
            
            if (loginResult?.error) {
                router.push("/sign-in?registered=1");
            } else {
                window.location.href = "/dashboard";
            }
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
    const serverError = registerMutation.error?.message ?? null;

    return (
        <div className="flex min-h-screen flex-col bg-white">
            {/* Header */}
            <HeaderLandingPage buttonText="Login" buttonHref="/sign-in" />

            {/* Main Content */}
            <main className="flex flex-1 items-center justify-center px-4 py-12 sm:py-20">
                <div className="w-full max-w-lg rounded-2xl border-2 border-indigo-950 bg-white p-6 sm:p-10 shadow-[0px_5px_0px_rgba(30,27,75)]">

                    {/* Title */}
                    <div className="pb-8 pt-2 text-center">
                        <h1 className="pb-3 text-3xl font-semibold text-cyan-600">Daftar</h1>
                        <p className="text-lg text-indigo-950">
                            Selamat datang!
                            <br />
                            Silahkan daftarkan akun Anda
                        </p>
                    </div>

                    {/* Google banner */}
                    {fromGoogle && (
                        <div className="mb-5 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-700">
                            🎉 Akun Google Anda terdeteksi! Lengkapi data di bawah untuk menyelesaikan pendaftaran.
                        </div>
                    )}

                    {/* Server Error */}
                    {serverError && (
                        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {serverError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                        {/* Nama Lengkap */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-indigo-950">Nama Lengkap</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                                    <User size={24} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Masukkan Nama Lengkap Anda"
                                    readOnly={fromGoogle && !!googleName}
                                    className={`w-full rounded-lg border py-2.5 pl-12 pr-6 text-sm outline-none transition-all placeholder:text-sm placeholder:text-slate-400 focus:ring-2 ${fromGoogle && googleName
                                        ? "bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200"
                                        : errors.name
                                            ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                                            : "border-slate-300 bg-slate-100 focus:border-cyan-600 focus:ring-cyan-100"
                                        }`}
                                    {...register("name")}
                                />
                            </div>
                            {errors.name && (
                                <p className="text-xs text-red-500">{errors.name.message}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-indigo-950">Email</label>

                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                                    <Envelope size={24} />
                                </div>

                                <input
                                    type="email"
                                    required
                                    placeholder="Masukkan Email Anda"
                                    className={`w-full rounded-lg border py-2.5 pl-12 pr-6 text-sm outline-none transition-all placeholder:text-sm placeholder:text-slate-400 focus:ring-2 ${errors.email
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

                        {/* Nomor HP */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-indigo-950">Nomor HP</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                                    <Phone size={24} />
                                </div>
                                <input
                                    type="tel"
                                    placeholder="Masukkan Nomor HP (contoh: 08123456789)"
                                    className={`w-full rounded-lg border py-2.5 pl-12 pr-6 text-sm outline-none transition-all placeholder:text-sm placeholder:text-slate-400 focus:ring-2 ${errors.phone
                                        ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                                        : "border-slate-300 bg-slate-100 focus:border-cyan-600 focus:ring-cyan-100"
                                        }`}
                                    {...register("phone")}
                                />
                            </div>
                            {errors.phone && (
                                <p className="text-xs text-red-500">{errors.phone.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-indigo-950">Password</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                                    <LockKey size={24} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Buat Password (min. 8 karakter)"
                                    className={`w-full rounded-lg border py-2.5 pl-12 pr-10 text-sm outline-none transition-all placeholder:text-sm placeholder:text-slate-400 focus:ring-2 ${errors.password
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
                                    {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-red-500">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-indigo-950">Konfirmasi Password</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                                    <LockKey size={24} />
                                </div>
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    placeholder="Ulangi Password"
                                    className={`w-full rounded-lg border py-2.5 pl-12 pr-10 text-sm outline-none transition-all placeholder:text-sm placeholder:text-slate-400 focus:ring-2 ${errors.confirmPassword
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
                                    {showConfirm ? <EyeSlash size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isPending}
                            className="cursor-pointer mt-4 w-full rounded-lg border-2 border-indigo-950 bg-yellow-200 py-2.5 text-lg font-semibold text-indigo-950 shadow-[0px_3px_0px_rgba(30,27,75)] transition duration-200 ease-out hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                        >
                            {isPending
                                ? "Mendaftar..."
                                : fromGoogle
                                    ? "Selesaikan Pendaftaran"
                                    : "Daftar"}
                        </button>
                    </form>

                    {/* Only show alternate Google signup if NOT coming from Google */}
                    {!fromGoogle && (
                        <>
                            <div className="relative my-6 text-center">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-300"></span>
                                </div>
                                <span className="relative bg-white px-2 text-xs text-slate-500">
                                    Atau Daftar dengan
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-400 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-cyan-50"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google
                            </button>
                        </>
                    )}
                    {/* Footer */}
                    <div className="mt-6 text-center text-xs text-slate-500">
                        Sudah punya akun?{" "}
                        <Link
                            href="/sign-in"
                            className="font-medium text-cyan-600 hover:text-cyan-800 hover:underline"
                        >
                            Login Disini
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}

// useSearchParams() requires a Suspense boundary in Next.js App Router
export default function SignupPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center bg-blue-50">
                    <div className="text-blue-500">Memuat...</div>
                </div>
            }
        >
            <SignupPageInner />
        </Suspense>
    );
}
