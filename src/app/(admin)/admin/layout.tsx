import { type Metadata } from "next";
import AdminLayoutClient from "./admin-layout-client";

export const metadata: Metadata = {
  title: "Admin CuanIN",
  description: "Admin Pusat CuanIN.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
