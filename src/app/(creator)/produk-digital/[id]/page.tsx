import { type Metadata } from "next";
import PageClient from "./page.client";

export const metadata: Metadata = {
  title: "Detail Produk Digital - CuanIN",
  description: "Kelola dan edit produk digital Anda.",
};

export default function Page() {
  return <PageClient />;
}
