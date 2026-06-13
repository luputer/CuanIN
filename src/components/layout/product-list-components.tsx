import React from "react";
import Image from "next/image";
import Link from "next/link";
import { PencilIcon, TrashIcon, CopyIcon } from "@phosphor-icons/react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "~/components/ui/tooltip";

interface ProductThumbnailProps {
    image: string | null;
    name: string;
    size?: "sm" | "md"; // sm for table (48px), md for mobile (64px)
}

export function ProductThumbnail({ image, name, size = "sm" }: ProductThumbnailProps) {
    const dims = size === "sm" ? 48 : 64;
    return (
        <div className={`bg-slate-100 overflow-hidden border border-slate-200 rounded-lg shrink-0 ${size === "sm" ? "w-12 h-12" : "w-16 h-16"}`}>
            {image ? (
                <Image
                    src={image}
                    alt={name}
                    width={dims}
                    height={dims}
                    unoptimized
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className={`w-full h-full flex items-center justify-center text-slate-400 italic ${size === "sm" ? "text-[10px]" : "text-[8px]"}`}>
                    No image
                </div>
            )}
        </div>
    );
}

interface ProductActionsProps {
    editUrl: string;
    onDelete: () => void;
    onCopy: () => void;
    deleteTooltip?: string;
    isMobile?: boolean;
}

export function ProductActions({ editUrl, onDelete, onCopy, deleteTooltip = "Hapus Produk", isMobile = false }: ProductActionsProps) {
    if (isMobile) {
        return (
            <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 gap-2">
                <div className="flex items-center gap-2">
                    <Link
                        href={editUrl}
                        className="p-2 rounded-lg text-cyan-600 border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                        title="Detail & Edit"
                    >
                        <PencilIcon className="w-5 h-5" />
                    </Link>

                    <button
                        onClick={onDelete}
                        className="p-2 rounded-lg text-red-600 border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                        title={deleteTooltip}
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>

                <button
                    onClick={onCopy}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-yellow-600 border border-yellow-600 rounded-lg hover:bg-yellow-50 transition cursor-pointer"
                >
                    <CopyIcon className="w-4 h-4" />
                    <span>Salin Link Produk</span>
                </button>
            </div>
        );
    }

    return (
        <div className="flex justify-start items-center gap-3">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link href={editUrl} className="block">
                        <PencilIcon className="w-[22px] h-[22px] text-cyan-600 cursor-pointer hover:text-cyan-700" />
                    </Link>
                </TooltipTrigger>
                <TooltipContent>Detail & Edit</TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <button onClick={onDelete}>
                        <TrashIcon className="w-[22px] h-[22px] text-red-600 cursor-pointer hover:text-red-700" />
                    </button>
                </TooltipTrigger>
                <TooltipContent>{deleteTooltip}</TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <button onClick={onCopy}>
                        <CopyIcon className="w-[22px] h-[22px] text-yellow-500 cursor-pointer hover:text-yellow-600" />
                    </button>
                </TooltipTrigger>
                <TooltipContent>Salin Link Produk</TooltipContent>
            </Tooltip>
        </div>
    );
}
