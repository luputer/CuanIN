import { type ReactNode } from "react";
import ButtonFilter from "~/components/ui/filter";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export type SelectFilterOption = {
    label: string;
    value: string;
};

type SelectFilterProps = {
    label: string;
    value: string;
    onValueChange: (value: string) => void;
    options: SelectFilterOption[];
    width?: string;
};

/**
 * Filter Dropdown untuk DataTable.
 * Membungkus DropdownMenu, ButtonFilter, dan DropdownMenuRadioGroup.
 */
export function SelectFilter({
    label,
    value,
    onValueChange,
    options,
    width = "180px",
}: SelectFilterProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <ButtonFilter
                    className="flex-1 lg:flex-none"
                    label={label}
                />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" style={{ width }}>
                <DropdownMenuRadioGroup value={value} onValueChange={onValueChange}>
                    {options.map((option) => (
                        <DropdownMenuRadioItem key={option.value} value={option.value}>
                            {option.label}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

type DataTableToolbarProps = {
    /** Komponen SearchInput */
    search?: ReactNode;
    /** Filter dan tombol aksi (biasanya <SelectFilter> dan <ActionButton>) */
    actions?: ReactNode;
};

/**
 * Wrapper standar untuk toolbar DataTable (Search, Filters, Action Button).
 * Memastikan layout konsisten di desktop dan mobile.
 */
export function DataTableToolbar({ search, actions }: DataTableToolbarProps) {
    if (!search && !actions) return null;

    return (
        <div className="flex flex-wrap items-center justify-between gap-4">
            {search && (
                <div className="w-full sm:flex-1 min-w-[280px]">
                    {search}
                </div>
            )}
            {actions && (
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    {actions}
                </div>
            )}
        </div>
    );
}
