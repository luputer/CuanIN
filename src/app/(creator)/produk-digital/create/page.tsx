import { type Metadata } from "next";
import PageClient from "./page.client";

export const metadata: Metadata = {
  title: "Buat Produk Digital - CuanIN",
  description: "Buat produk digital baru.",
};

export default function Page() {
  return <PageClient />;
}
