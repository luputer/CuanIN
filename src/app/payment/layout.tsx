import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Pembayaran - CuanIN",
  description:
    "Selesaikan pembayaran produk digital, kelas, atau webinar yang dibeli melalui CuanIN.",
};

export default function PaymentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
