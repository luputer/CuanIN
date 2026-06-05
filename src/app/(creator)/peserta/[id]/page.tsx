import { type Metadata } from "next";
import PageClient from "./page.client";

export const metadata: Metadata = {
  title: "Detail Peserta - CuanIN",
  description: "Lihat detail peserta dan riwayat pembeliannya.",
};

export default function Page() {
  return <PageClient />;
}
