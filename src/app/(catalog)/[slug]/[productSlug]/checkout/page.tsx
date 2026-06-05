import { type Metadata } from "next";
import PageClient from "./page.client";

export const metadata: Metadata = {
  title: "Checkout - CuanIN",
  description: "Selesaikan pembelian produk digital Anda dengan mudah dan aman.",
};

export default function Page() {
  return <PageClient />;
}
