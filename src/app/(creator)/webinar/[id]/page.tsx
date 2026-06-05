import { type Metadata } from "next";
import PageClient from "./page.client";

export const metadata: Metadata = {
  title: "Detail Webinar - CuanIN",
  description: "Kelola dan edit webinar Anda.",
};

export default function Page() {
  return <PageClient />;
}
