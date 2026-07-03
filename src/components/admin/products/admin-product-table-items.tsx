"use client";

import React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { EyeIcon, UserCircleIcon, Copy as CopyIcon } from "@phosphor-icons/react";
import { TableRow, TableCell } from "~/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { StatusBadge } from "~/components/ui/status-badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import type { AdminProductType } from "~/types/admin";
import { getProductTypeLabel } from "~/lib/constants";

interface AdminProductTableRowProps {
    item: AdminProductType;
    index: number;
    page: number;
    limit: number;
    showCreatorColumn?: boolean;
    viewHref: string;
}

export function AdminProductTableRow({ item, index, page, limit, showCreatorColumn, viewHref }: AdminProductTableRowProps) {
    const handleCopyLink = () => {
        if (!item.user?.catalog?.slug || !item.slug) {
            toast.error("Gagal menyalin: Data katalog atau produk tidak lengkap!");
            return;
        }
        const url = `${window.location.origin}/${item.user.catalog.slug}/${item.slug}`;
        navigator.clipboard.writeText(url)
            .then(() => toast.success("Link produk berhasil disalin!"))
            .catch(() => toast.error("Gagal menyalin link"));
    };
    const priceNum = Number(item.price);
    const discountNum = item.discountPrice != null ? Number(item.discountPrice) : null;
    const displayPrice = discountNum !== null && discountNum < priceNum ? discountNum : priceNum;
    const rowNumber = (page - 1) * limit + index + 1;
    const isFinished = item.status === "archived" || (item.endDate && new Date() > new Date(item.endDate));
    const currentStatus = isFinished ? "selesai" : (item.status || "unpublished");
    const isUnpublished = item.status === "unpublished" || !item.status;
    const canCopy = !!item.user?.catalog?.slug && !isUnpublished;

    return (
        <TableRow data-type="body">
            <TableCell className="text-center font-medium">{rowNumber}</TableCell>

            <TableCell className="max-w-[360px] leading-normal">
                <div className="flex items-center min-h-[48px] py-1 font-medium text-slate-800 line-clamp-2 break-words leading-normal">
                    {item.name}
                </div>
            </TableCell>

            {showCreatorColumn && (
                <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-3 min-h-[48px]">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={item.user?.image ?? undefined} alt={item.user?.name ?? ""} />
                            <AvatarFallback>
                                <UserCircleIcon size={24} className="text-slate-400" />
                            </AvatarFallback>
                        </Avatar>
                        <Link href={`/admin/kreator/${item.userId}`} className="font-medium text-slate-700 hover:text-cuan-cyan transition-colors">
                            {item.user?.name || "-"}
                        </Link>
                    </div>
                </TableCell>
            )}

            <TableCell className="whitespace-nowrap">
                <div className="flex items-center min-h-[48px]">
                    {getProductTypeLabel(item.type)}
                </div>
            </TableCell>

            <TableCell className="whitespace-nowrap">
                <div className="flex items-center min-h-[48px]">
                    {priceNum > 0 ? "Berbayar" : "Gratis"}
                </div>
            </TableCell>

            <TableCell className="whitespace-nowrap">
                <div className="flex flex-col justify-center min-h-[48px] gap-0.5">
                    {displayPrice === 0 ? (
                        <span>Gratis</span>
                    ) : (
                        <span className="font-medium">{`Rp ${displayPrice.toLocaleString("id-ID")}`}</span>
                    )}
                    {discountNum !== null && discountNum < priceNum && (
                        <span className="text-xs text-slate-400 line-through">{`Rp ${priceNum.toLocaleString("id-ID")}`}</span>
                    )}
                </div>
            </TableCell>

            <TableCell className="whitespace-nowrap">
                <div className="flex items-center min-h-[48px]">
                    <StatusBadge status={currentStatus} className="px-4" />
                </div>
            </TableCell>

            <TableCell className="px-6 py-4 text-right">
                <div className="flex justify-start items-center gap-3">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link href={viewHref} className="cursor-pointer">
                                <EyeIcon className="w-[22px] h-[22px] text-cuan-cyan hover:text-007EA5" />
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent>Lihat Detail</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={handleCopyLink}
                                disabled={!canCopy}
                            >
                                <CopyIcon className={`w-[22px] h-[22px] ${!canCopy ? "text-slate-300 cursor-not-allowed" : "text-yellow-500 hover:text-yellow-600 cursor-pointer"}`} />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>
                            {!item.user?.catalog?.slug 
                                ? "Kreator belum memiliki katalog" 
                                : isUnpublished 
                                    ? "Produk belum dipublikasi" 
                                    : "Salin Link Produk"}
                        </TooltipContent>
                    </Tooltip>
                </div>
            </TableCell>
        </TableRow>
    );
}

interface AdminProductMobileCardProps {
    item: AdminProductType;
    showCreatorColumn?: boolean;
    viewHref: string;
}

export function AdminProductMobileCard({ item, showCreatorColumn, viewHref }: AdminProductMobileCardProps) {
    const handleCopyLink = () => {
        if (!item.user?.catalog?.slug || !item.slug) {
            toast.error("Gagal menyalin: Data katalog atau produk tidak lengkap!");
            return;
        }
        const url = `${window.location.origin}/${item.user.catalog.slug}/${item.slug}`;
        navigator.clipboard.writeText(url)
            .then(() => toast.success("Link produk berhasil disalin!"))
            .catch(() => toast.error("Gagal menyalin link"));
    };
    const priceNum = Number(item.price);
    const discountNum = item.discountPrice != null ? Number(item.discountPrice) : null;
    const displayPrice = discountNum !== null && discountNum < priceNum ? discountNum : priceNum;
    const isFinished = item.status === "archived" || (item.endDate && new Date() > new Date(item.endDate));
    const currentStatus = isFinished ? "selesai" : (item.status || "unpublished");
    const isUnpublished = item.status === "unpublished" || !item.status;
    const canCopy = !!item.user?.catalog?.slug && !isUnpublished;

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-3 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-start gap-4">
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2">
                        {item.name}
                    </h4>
                    {showCreatorColumn && (
                        <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                                <AvatarImage src={item.user?.image ?? undefined} alt={item.user?.name ?? ""} />
                                <AvatarFallback>
                                    <UserCircleIcon size={16} className="text-slate-400" />
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium text-slate-600 truncate">
                                {item.user?.name || "-"}
                            </span>
                        </div>
                    )}
                </div>
                <StatusBadge status={currentStatus} className="shrink-0" />
            </div>

            <div className="flex flex-col gap-3 rounded-lg bg-slate-50 border border-slate-100 p-3">
                <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-400">Harga: </span>
                    <div className="flex flex-col items-end gap-0.5">
                        <span className="font-semibold text-slate-800">
                            {displayPrice === 0 ? "Gratis" : `Rp ${displayPrice.toLocaleString("id-ID")}`}
                        </span>
                        {discountNum !== null && discountNum < priceNum && (
                            <span className="text-[10px] text-slate-400 line-through">{`Rp ${priceNum.toLocaleString("id-ID")}`}</span>
                        )}
                    </div>
                </div>

                <div className="flex justify-between items-center text-xs border-t border-slate-200/60 pt-2">
                    <div>
                        <span className="font-medium text-slate-400">Kategori: </span>
                        <span className="font-semibold text-slate-700">{getProductTypeLabel(item.type)}</span>
                    </div>

                    <div>
                        <span className="font-medium text-slate-400">Tipe: </span>
                        <span className="font-semibold text-slate-700">{priceNum > 0 ? "Berbayar" : "Gratis"}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={handleCopyLink}
                    disabled={!canCopy}
                    className={`flex-1 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${!canCopy ? "text-slate-300 cursor-not-allowed" : "text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-200 cursor-pointer"}`}
                    title={!item.user?.catalog?.slug ? "Kreator belum memiliki katalog" : isUnpublished ? "Produk belum dipublikasi" : "Salin Link Produk"}
                >
                    <CopyIcon className="w-4 h-4" />
                    Salin Link
                </button>

                <Link
                    href={viewHref}
                    className="flex-1 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-cuan-cyan transition-colors flex items-center justify-center gap-2"
                >
                    <EyeIcon className="w-4 h-4" />
                    Lihat Detail
                </Link>
            </div>
        </div>
    );
}
