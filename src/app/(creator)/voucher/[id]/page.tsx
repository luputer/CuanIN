import { type Metadata } from "next";
import PageClient from "./page.client";

export const metadata: Metadata = {
  title: "Detail Voucher - CuanIN",
  description: "Lihat detail voucher diskon.",
};

export default function Page() {
  return <PageClient />;
}
