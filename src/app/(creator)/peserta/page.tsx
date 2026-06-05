import { type Metadata } from "next";
import PageClient from "./page.client";

export const metadata: Metadata = {
  title: "Peserta - CuanIN",
  description: "Lihat dan kelola peserta produk Anda.",
};

export default function Page() {
  return <PageClient />;
}
