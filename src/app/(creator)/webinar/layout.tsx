import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Webinar - Dashboard Kreator - CuanIN",
  description: "Kelola webinar, buat webinar baru, dan lihat daftar webinar yang sudah dibuat di CuanIN.",
};

export default function WebinarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
