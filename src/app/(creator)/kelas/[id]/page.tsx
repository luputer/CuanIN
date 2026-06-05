import { type Metadata } from "next";
import PageClient from "./page.client";

export const metadata: Metadata = {
  title: "Detail Kelas Online - CuanIN",
  description: "Kelola dan edit kelas online Anda.",
};

export default function Page() {
  return <PageClient />;
}
