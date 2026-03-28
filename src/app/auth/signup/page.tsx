"use client";

import Link from "next/link";
import { Mail, Lock, Phone, User } from "lucide-react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
// import { api } from "~/trpc/react";

export default function SignupPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const router = useRouter();
    // const register = api.auth.register.useMutation({
    //     onSuccess: () => {
    //         alert("Registrasi Berhasil! Silakan Login.");
    //         router.push("/auth/login");
    //     },
    //     onError: (error) => {
    //         alert(error.message);
    //     },
    // });

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Password dan Konfirmasi Password tidak sama");
            return;
        }

        // register.mutate({
        //     name: formData.name,
        //     email: formData.email,
        //     phone: formData.phone,
        //     password: formData.password,
        // });
    };

    return (
        <div className="flex min-h-screen flex-col bg-blue-50 font-sans text-gray-800">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-10 w-full bg-white px-6 py-4 shadow-sm">
                <div className="container mx-auto flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold text-blue-500">
                        CuanIN
                    </Link>
                    <Link
                        href="/auth/login"
                        className="rounded-full bg-blue-500 px-6 py-2 font-semibold text-white shadow-md transition-transform hover:scale-105 hover:bg-blue-600"
                    >
                        Login
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex flex-1 items-center justify-center pt-24 pb-12 px-4">
                <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl">
                    <div className="mb-8 text-center">
                        <h1 className="mb-2 text-3xl font-bold text-blue-600">Daftar Akun</h1>
                        <p className="text-sm text-gray-500">
                            Buat akun untuk mengakses fitur platform
                        </p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-5">
                        {/* Nama Lengkap */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-blue-500">Nama Lengkap</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Masukkan Nama Lengkap Anda"
                                    className="w-full rounded-lg border border-blue-200 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-blue-500">Email</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Masukkan Email Aktif"
                                    className="w-full rounded-lg border border-blue-200 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Nomor HP */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-blue-500">Nomor HP</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <Phone size={18} />
                                </div>
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Masukkan Nomor HP"
                                    className="w-full rounded-lg border border-blue-200 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-blue-500">
                                Password
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Buat Password"
                                    className="w-full rounded-lg border border-blue-200 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Confirm Password Field */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-blue-500">
                                Konfirmasi Password
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Ulangi Password"
                                    className="w-full rounded-lg border border-blue-200 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Signup Button */}
                        <button
                            type="submit"
                            // disabled={register.isPending}
                            className="mt-6 w-full rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 py-2.5 font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {/* {register.isPending ? "Mendaftar..." : "Daftar"} */}
                            Daftar
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6 text-center">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200"></span>
                        </div>
                        <span className="relative bg-white px-2 text-xs text-gray-400">
                            - Atau Daftar dengan -
                        </span>
                    </div>

                    {/* Google Button */}
                    <button
                        type="button"
                        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
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
                    </button>

                    <div className="mt-6 text-center text-xs text-gray-500">
                        Sudah punya akun?{" "}
                        <Link
                            href="/auth/login"
                            className="font-medium text-blue-500 hover:underline"
                        >
                            Login Disini
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full bg-blue-900 py-10 text-white mt-auto">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                        <div className="max-w-xs">
                            <h3 className="text-xl font-bold text-blue-400 mb-2">CuanIN</h3>
                            <p className="text-sm text-gray-300 leading-relaxed">
                                Platform all-in-one untuk kelola produk anda dengan mudah.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold mb-3">Kontak Kami</h4>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li className="flex items-center gap-2">
                                    <Phone size={16} />
                                    <span>+62 8123 4567 890</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Mail size={16} />
                                    <span>formate@gmail.com</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-10 border-t border-blue-800 pt-6 text-center text-xs text-blue-200">
                        &copy; 2026 Formate. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
