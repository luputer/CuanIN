import { type Metadata } from "next";
import PageClient from "./page.client";

export const metadata: Metadata = {
  title: "Masuk - CuanIN",
  description: "Masuk ke akun CuanIN Anda untuk melanjutkan.",
};

export default function Page() {
  return <PageClient />;
}
