import { type Metadata } from "next";
import PageClient from "./page.client";

export const metadata: Metadata = {
  title: "Detail Produk - CuanIN",
  description: "Lihat detail produk digital, webinar, atau kelas online.",
};

export default function Page() {
  return <PageClient />;
}
