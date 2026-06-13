export const PRODUCT_TYPE_MAP: Record<string, string> = {
    WEBINAR: "Webinar",
    DIGITAL_PRODUCT: "Produk Digital",
    KELAS_ONLINE: "Kelas",
};

export const getProductTypeLabel = (type: string | undefined | null) => {
    if (!type) return "-";
    return PRODUCT_TYPE_MAP[type] ?? (type === "ALL" ? "Semua" : type);
};
