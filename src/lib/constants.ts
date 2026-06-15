export const PRODUCT_TYPE_MAP: Record<string, string> = {
    WEBINAR: "Webinar",
    DIGITAL_PRODUCT: "Produk Digital",
    KELAS_ONLINE: "Kelas",
};

export const getProductTypeLabel = (type: string | undefined | null) => {
    if (!type) return "-";
    return PRODUCT_TYPE_MAP[type] ?? (type === "ALL" ? "Semua" : type);
};

/** Warna badge per tipe produk — dipakai di card & halaman detail */
export const CATEGORY_STYLE: Record<string, string> = {
    WEBINAR: "bg-cyan-100 text-cyan-700 border-cyan-200",
    KELAS_ONLINE: "bg-amber-100 text-amber-700 border-amber-200",
    DIGITAL_PRODUCT: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

/** Default style saat tipe tidak dikenali */
export const CATEGORY_STYLE_DEFAULT = "border-slate-200 bg-slate-100 text-slate-700";

/** Label platform untuk webinar/kelas */
export const PLATFORM_MAP: Record<string, string> = {
    zoom: "Zoom",
    "google-meet": "Google Meet",
    website: "Website Kelas",
};
