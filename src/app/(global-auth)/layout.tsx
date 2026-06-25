import { type Metadata } from "next";
import HeaderLoginWrapper from "~/components/layout/header-login-wrapper";
import Footer from "~/components/layout/footer";

export const metadata: Metadata = {
  title: "Akun - CuanIN",
  description:
    "Masuk, daftar, verifikasi email, dan pulihkan akun CuanIN dengan aman.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <HeaderLoginWrapper />

      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:py-20">
        <div className="w-full max-w-lg rounded-2xl border-2 border-slate-800 bg-white p-6 shadow-[0px_3px_0px_#000] sm:p-10">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}
