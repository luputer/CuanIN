import { type Metadata } from "next";
import HomeContent from "./home-content";

export const metadata: Metadata = {
  title: "CuanIN - Platform Jual Webinar, Kelas, dan Produk Digital",
  description:
    "Buat katalog produk digital, kelola peserta, dan terima pembayaran dalam satu platform.",
};

export default function HomePage() {
  return <HomeContent />;
}
