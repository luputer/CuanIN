import { type Metadata } from "next";
import { PurchaseHistoryButton } from "~/components/catalog/purchase-history-button";

export const metadata: Metadata = {
  title: "Katalog Kreator - CuanIN",
  description:
    "Jelajahi dan beli produk digital, webinar, serta kelas online dari kreator di platform CuanIN.",
};

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <PurchaseHistoryButton />
    </>
  );
}
