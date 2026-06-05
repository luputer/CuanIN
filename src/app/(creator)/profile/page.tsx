import { type Metadata } from "next";
import PageClient from "./page.client";

export const metadata: Metadata = {
  title: "Profil - CuanIN",
  description: "Kelola profil kreator Anda.",
};

export default function Page() {
  return <PageClient />;
}
