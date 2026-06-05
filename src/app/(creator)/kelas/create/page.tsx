import { type Metadata } from "next";
import PageClient from "./page.client";

export const metadata: Metadata = {
  title: "Buat Kelas Online - CuanIN",
  description: "Buat kelas online baru.",
};

export default function Page() {
  return <PageClient />;
}
