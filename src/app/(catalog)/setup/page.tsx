import type { Metadata } from "next";
import { CatalogSetupContent } from "./setup-content";

export const metadata: Metadata = {
    title: "Setup Katalog - CuanIN",
    description: "Buat halaman katalog untuk menampilkan produkmu.",
};

export default function CatalogSetupPage() {
    return <CatalogSetupContent />;
}
