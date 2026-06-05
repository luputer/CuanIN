import { type Metadata } from "next";
import PageClient from "./page.client";

export const metadata: Metadata = {
  title: "Pembayaran - CuanIN",
  description: "Kelola transaksi dan penarikan saldo.",
};

export default function Page() {
  return <PageClient />;
}
