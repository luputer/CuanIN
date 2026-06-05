import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Akun - CuanIN",
  description:
    "Masuk, daftar, verifikasi email, dan pulihkan akun CuanIN dengan aman.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
