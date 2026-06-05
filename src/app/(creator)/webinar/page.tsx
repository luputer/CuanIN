import { type Metadata } from "next";
import PageClient from "./page.client";

export const metadata: Metadata = {
  title: "Webinar - CuanIN",
  description: "Kelola webinar Anda.",
};

export default function Page() {
  return <PageClient />;
}
