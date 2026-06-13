"use client";

import React from "react";
import Link from "next/link";
import { EyeIcon, UserCircleIcon } from "@phosphor-icons/react";
import { TableRow, TableCell } from "~/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { StatusBadge } from "~/components/ui/status-badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { getProductTypeLabel } from "~/lib/constants";

interface AdminProductTableRowProps {
    item: any;
    index: number;
    page: number;
    limit: number;
    showCreatorColumn?: boolean;
    viewHref: string;
}

export function AdminProductTableRow({ item, index, page, limit, showCreatorColumn, viewHref }: AdminProductTableRowProps) {
    const priceNum = Number(item.price);
    const rowNumber = (page - 1) * limit + index + 1;
    const isFinished = item.status === "archived" || (item.endDate && new Date() > new Date(item.endDate));
    const currentStatus = isFinished ? "selesai" : (item.status || "unpublished");

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
                        <Link href={`/admin/kreator/${item.userId}`} className="font-medium text-slate-700 hover:text-cyan-600 transition-colors">
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
                <div className="flex items-center min-h-[48px]">
                    {priceNum === 0 ? "Gratis" : `Rp ${priceNum.toLocaleString("id-ID")}`}
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
                                <EyeIcon className="w-[22px] h-[22px] text-cyan-600 hover:text-cyan-700" />
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent>Lihat Detail</TooltipContent>
                    </Tooltip>
                </div>
            </TableCell>
        </TableRow>
    );
}

interface AdminProductMobileCardProps {
    item: any;
    showCreatorColumn?: boolean;
    viewHref: string;
}

export function AdminProductMobileCard({ item, showCreatorColumn, viewHref }: AdminProductMobileCardProps) {
    const priceNum = Number(item.price);
    const isFinished = item.status === "archived" || (item.endDate && new Date() > new Date(item.endDate));
    const currentStatus = isFinished ? "selesai" : (item.status || "unpublished");

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
                    <span className="font-semibold text-slate-800">
                        {priceNum === 0 ? "Gratis" : `Rp ${priceNum.toLocaleString("id-ID")}`}
                    </span>
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

            <Link
                href={viewHref}
                className="w-full py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-cyan-600 transition-colors flex items-center justify-center gap-2"
            >
                <EyeIcon className="w-4 h-4" />
                Lihat Detail
            </Link>
        </div>
    );
}
