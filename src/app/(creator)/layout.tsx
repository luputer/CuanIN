import { type Metadata } from "next";
import CreatorLayoutClient from "./creator-layout-client";

export const metadata: Metadata = {
  title: "Dashboard Kreator - CuanIN",
  description:
    "Kelola webinar, kelas, produk digital, peserta, voucher, profil, dan pembayaran kreator di CuanIN.",
};

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  return <CreatorLayoutClient>{children}</CreatorLayoutClient>;
}
