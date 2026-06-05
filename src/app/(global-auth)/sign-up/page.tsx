import { type Metadata } from "next";
import PageClient from "./page.client";

export const metadata: Metadata = {
  title: "Daftar - CuanIN",
  description: "Buat akun CuanIN baru untuk mulai menjual atau membeli produk digital.",
};

export default function Page() {
  return <PageClient />;
}
