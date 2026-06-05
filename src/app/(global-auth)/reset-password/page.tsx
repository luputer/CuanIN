import { type Metadata } from "next";
import PageClient from "./page.client";

export const metadata: Metadata = {
  title: "Reset Password - CuanIN",
  description: "Buat kata sandi baru untuk akun CuanIN Anda.",
};

export default function Page() {
  return <PageClient />;
}
