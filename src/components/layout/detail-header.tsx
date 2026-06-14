import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { type ReactNode } from "react";
import { cn } from "~/lib/utils";

type DetailHeaderProps = {
    backLink: string;
    backLabel: string;
    title: ReactNode;
    badges?: ReactNode;
    actions?: ReactNode;
    stickyTop?: string;
};

/**
 * Header untuk halaman detail (misal Detail Kreator, Detail Produk, Create Form).
 * Memiliki tombol kembali di atas judul, judul dengan style medium slate-800, 
 * dan action buttons di sebelah kanan.
 */
export function DetailHeader({
    backLink,
    backLabel,
    title,
    badges,
    actions,
    stickyTop = "top-[74px]",
}: DetailHeaderProps) {
    return (
        <div className="bg-slate-50">
            <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:sticky bg-slate-50 z-40 -mx-6 px-6 pt-2 pb-0", stickyTop)}>
                <div className="flex-1 flex flex-col gap-1">
                    <Link
                        href={backLink}
                        className="group flex items-center gap-2 text-sm font-regular text-slate-600 hover:text-slate-800 transition-colors w-fit mb-2"
                    >
                        <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                        <span className="leading-none">{backLabel}</span>
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        {typeof title === 'string' ? (
                            <h1 className="text-xl font-medium text-slate-800 break-words max-w-full">{title}</h1>
                        ) : (
                            <div className="text-xl font-medium text-slate-800 break-words max-w-full">{title}</div>
                        )}
                        {badges}
                    </div>
                </div>

                {actions && (
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}
