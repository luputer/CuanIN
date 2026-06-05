import type { Metadata } from "next";
import { CatalogSetupContent } from "./setup-content";

export const metadata: Metadata = {
    title: "Setup Katalog - CuanIN",
    description: "Bagikan semua produkmu dalam satu halaman yang bisa diakses siapa saja.",
};

export default function CatalogSetupPage() {
    return <CatalogSetupContent />;
}
