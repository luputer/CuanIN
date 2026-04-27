import React from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { cn } from "~/lib/utils";

interface SearchProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
}

export default function SearchInput({
    value,
    onChange,
    placeholder = "Cari...",
    className,
}: SearchProps) {
    return (
        <div
            className={cn(
                "relative flex items-center w-100 h-10 flex-1 sm:flex-none",
                "bg-white border border-slate-800 rounded-lg",
                "shadow-[0px_1.5px_0px_rgba(29,41,61)]",
                "transition-all duration-200 ease-out",
                "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none",
                "focus-within:translate-x-[1px] focus-within:translate-y-[1px] focus-within:shadow-none",
                className
            )}
        >
            <MagnifyingGlassIcon className="absolute left-4 text-slate-500 w-4 h-4 pointer-events-none" />

            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full bg-transparent pl-10 pr-4 h-full text-slate-800 text-sm font-regular focus:outline-none placeholder:text-slate-500"
            />
        </div>
    );
}