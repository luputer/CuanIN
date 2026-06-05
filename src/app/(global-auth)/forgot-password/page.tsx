import { type Metadata } from "next";
import PageClient from "./page.client";

export const metadata: Metadata = {
  title: "Lupa Password - CuanIN",
  description: "Atur ulang kata sandi akun CuanIN Anda.",
};

export default function Page() {
  return <PageClient />;
}
