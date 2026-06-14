import { type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react";

type PageHeaderProps = {
    title: string;
    description?: string;
    /** Konten tambahan di sebelah kanan (misal: tombol aksi) */
    actions?: ReactNode;
    /** Override sticky top offset. Default: "top-[74px]" (creator). Gunakan "top-0" untuk admin. */
    stickyTop?: string;
    /** Link opsional untuk tombol back */
    backLink?: string;
    /** Label opsional untuk tombol back */
    backLabel?: string;
};

/**
 * Header halaman sticky yang konsisten — dipakai di semua halaman
 * dashboard creator maupun admin.
 *
 * Struktur:
 * ```
 * <PageHeader
 *   title="Dashboard"
 *   description="Kelola produk dan pantau penjualan Anda."
 * />
 * ```
 * Dengan action button:
 * ```
 * <PageHeader
 *   title="Produk"
 *   description="Kelola semua produk Anda."
 *   actions={<Button>Tambah Produk</Button>}
 * />
 * ```
 */
export function PageHeader({
    title,
    description,
    actions,
    stickyTop = "top-[74px]",
    backLink,
    backLabel,
}: PageHeaderProps) {
    return (
        <div className="bg-slate-50">
            <div
                className={`sticky ${stickyTop} bg-slate-50 z-40 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-2 pb-2`}
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-col gap-1">
                        {backLink && backLabel && (
                            <Link
                                href={backLink}
                                className="group flex items-center gap-2 text-sm font-regular text-slate-600 hover:text-slate-800 transition-colors w-fit mb-1"
                            >
                                <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                                <span className="leading-none">{backLabel}</span>
                            </Link>
                        )}
                        <div className="text-2xl font-bold mb-1 text-cyan-600">
                            {title}
                        </div>
                        {description && (
                            <div className="text-sm text-slate-600">
                                {description}
                            </div>
                        )}
                    </div>
                    {actions && (
                        <div className="flex items-center gap-2 shrink-0">
                            {actions}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
