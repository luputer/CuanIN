import { type Metadata } from "next";
import PageClient from "./page.client";

export const metadata: Metadata = {
  title: "Buat Voucher - CuanIN",
  description: "Buat voucher diskon baru.",
};

export default function Page() {
  return <PageClient />;
}
