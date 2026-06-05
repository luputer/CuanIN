import { type Metadata } from "next";
import PageClient from "./page.client";

export const metadata: Metadata = {
  title: "Produk Digital - CuanIN",
  description: "Kelola produk digital Anda.",
};

export default function Page() {
  return <PageClient />;
}
