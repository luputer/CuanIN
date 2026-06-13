import { toast } from "sonner";
import { api } from "~/trpc/react";

export function useCopyProductLink() {
    const { data: catalog } = api.catalog.getMine.useQuery();

    const handleCopyLink = (itemId: string, itemSlug: string | null) => {
        if (!catalog?.slug) {
            toast.error("Gagal menyalin link: Catalog belum siap");
            return;
        }
        const host = window.location.origin;
        const productSlug = itemSlug ?? itemId;
        const publicUrl = `${host}/${catalog.slug}/${productSlug}`;
        void navigator.clipboard.writeText(publicUrl);
        toast.success("Link produk berhasil disalin!");
    };

    return handleCopyLink;
}
