import React from "react";
import { cn } from "~/lib/utils";

interface ButtonCancelProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label?: string;
    className?: string;
}

export default function ButtonCancel({
    label = "Batal",
    className,
    ...props
}: ButtonCancelProps) {
    return (
        <button
            {...props}
            className={cn(
                "w-fit flex items-center justify-center gap-2 px-6 py-4",
                "border border-slate-800 rounded-lg",
                "text-sm font-semibold text-slate-800 bg-white cursor-pointer",
                "shadow-[2px_2px_0px_rgba(30,41,59,1)]",
                "transition-all duration-200 ease-out",
                "hover:translate-x-px hover:translate-y-px hover:shadow-none",
                "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[2px_1px_0px_rgba(30,41,59,1)]",
                className
            )}
        >
            <span>{label}</span>
        </button>
    );
}
