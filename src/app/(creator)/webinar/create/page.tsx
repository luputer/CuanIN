import { type Metadata } from "next";
import PageClient from "./page.client";

export const metadata: Metadata = {
  title: "Buat Webinar - CuanIN",
  description: "Buat webinar baru untuk audiens Anda.",
};

export default function Page() {
  return <PageClient />;
}
