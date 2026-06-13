import { cn } from "~/lib/utils";

export function getStatusColor(status: string) {
    const s = status.toLowerCase();
    switch (s) {
        case "published": 
        case "active":
        case "aktif":
        case "success": 
        case "settled": // midtrans
        case "capture": // midtrans
        case "succeeded":
        case "completed":
            return "bg-green-100 text-green-700";
        case "unpublished": 
        case "inactive":
        case "nonaktif":
        case "draft":
            return "bg-slate-200 text-slate-500";
        case "pending": 
        case "requested":
        case "accepted":
            return "bg-yellow-100 text-yellow-700";
        case "failed": 
        case "deny":
        case "cancel":
        case "expire":
        case "expired":
            return "bg-red-100 text-red-700";
        case "selesai":
        case "archived":
            return "bg-blue-100 text-blue-700";
        default: 
            return "bg-slate-100 text-slate-600";
    }
}

export function getStatusLabel(status: string) {
    const s = status.toLowerCase();
    switch (s) {
        case "published": return "Published";
        case "unpublished": return "Unpublished";
        case "active": 
        case "aktif": 
            return "Aktif";
        case "inactive": 
        case "nonaktif":
            return "Nonaktif";
        case "success": 
        case "settled":
        case "capture":
        case "succeeded":
        case "completed":
            return "Berhasil";
        case "pending": 
        case "requested":
        case "accepted":
            return "Menunggu";
        case "failed": 
        case "deny":
        case "cancel":
        case "expire":
            return "Gagal";
        case "expired":
            return "Expired";
        case "selesai":
        case "archived":
            return "Selesai";
        case "draft": return "Draft";
        default: return status;
    }
}

export function StatusBadge({ status, className }: { status: string, className?: string }) {
    return (
        <span className={cn("px-3 py-0.5 rounded-full text-[13px] leading-tight font-medium whitespace-nowrap", getStatusColor(status), className)}>
            {getStatusLabel(status)}
        </span>
    );
}
