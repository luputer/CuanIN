import { type Metadata } from "next";
import PageClient from "./page.client";

export const metadata: Metadata = {
  title: "Katalog - CuanIN",
  description: "Jelajahi produk digital, webinar, dan kelas online dari kreator.",
};

export default function Page() {
  return <PageClient />;
}
