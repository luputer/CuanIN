import { CaretUpIcon, CaretDownIcon } from "@phosphor-icons/react";
import { cn } from "~/lib/utils";
import { TableHead } from "~/components/ui/table";

interface SortableTableHeadProps {
    title: string;
    sortKey?: string;
    isActive?: boolean;
    sortOrder?: "asc" | "desc";
    onClick?: () => void;
    className?: string;
}

export function SortableTableHead({ title, isActive = false, sortOrder = "asc", onClick, className }: SortableTableHeadProps) {
    return (
        <TableHead
            className={cn("whitespace-nowrap transition-colors group", onClick ? "cursor-pointer select-none hover:text-slate-900" : "", className)}
            onClick={onClick}
        >
            <div className="flex items-center gap-2">
                {title}
                {onClick && (
                    <div className="flex flex-col h-4 justify-center">
                        <CaretUpIcon
                            weight={isActive && sortOrder === "asc" ? "bold" : "regular"}
                            className={cn("w-3.5 h-3.5 -mb-1 transition-colors", isActive && sortOrder === "asc" ? "text-slate-800" : "text-slate-400 group-hover:text-slate-500")}
                        />
                        <CaretDownIcon
                            weight={isActive && sortOrder === "desc" ? "bold" : "regular"}
                            className={cn("w-3.5 h-3.5 transition-colors", isActive && sortOrder === "desc" ? "text-slate-800" : "text-slate-400 group-hover:text-slate-500")}
                        />
                    </div>
                )}
            </div>
        </TableHead>
    );
}
