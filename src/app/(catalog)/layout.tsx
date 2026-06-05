import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Katalog Produk - CuanIN",
  description:
    "Temukan dan beli webinar, kelas online, serta produk digital dari kreator CuanIN.",
};

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
