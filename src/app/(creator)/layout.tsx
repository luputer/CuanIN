import { type Metadata } from "next";
import CreatorLayoutClient from "./creator-layout-client";

export const metadata: Metadata = {
  title: "CuanIN",
  description:
    "Kelola Penjualan Layanan Digital di CuanIN.",
};

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  return <CreatorLayoutClient>{children}</CreatorLayoutClient>;
}
