import type { Metadata } from "next";
import { CatalogSetupContent } from "./setup-content";

export const metadata: Metadata = {
    title: "Setup Toko - CuanIN",
    description: "Buat halaman toko untuk menampilkan produkmu.",
};

export default function CatalogSetupPage() {
    return <CatalogSetupContent />;
}