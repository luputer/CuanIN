import { type Metadata } from "next";
import PageClient from "./page.client";

export const metadata: Metadata = {
  title: "Verifikasi OTP - CuanIN",
  description: "Verifikasi kode OTP yang dikirim ke email Anda untuk mengaktifkan akun CuanIN.",
};

export default function Page() {
  return <PageClient />;
}
