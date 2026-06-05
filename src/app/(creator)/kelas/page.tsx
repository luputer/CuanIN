import { type Metadata } from "next";
import PageClient from "./page.client";

export const metadata: Metadata = {
  title: "Kelas Online - CuanIN",
  description: "Kelola kelas online Anda.",
};

export default function Page() {
  return <PageClient />;
}
