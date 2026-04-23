import React from "react";
import { CircleNotchIcon, FloppyDiskIcon } from "@phosphor-icons/react";
import { cn } from "~/lib/utils";

interface ButtonSaveProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    label?: string;
    loadingLabel?: string;
    icon?: React.ElementType;
    weight?: "regular" | "bold" | "fill" | "light" | "thin";
    className?: string;
    align?: "left" | "center";
}

export default function ButtonSave({
    isLoading,
    label = "Simpan Perubahan",
    loadingLabel = "Menyimpan...",
    icon: Icon = FloppyDiskIcon,
    className,
    weight,
    ...props
}: ButtonSaveProps) {
    return (
        <button
            {...props}
            disabled={!!isLoading || !!props.disabled}
            className={cn(
                "w-fit flex items-center justify-center gap-2 px-6 py-4",
                "border border-slate-800 rounded-lg",
                "text-sm font-semibold text-white bg-cyan-600 cursor-pointer",
                "shadow-[2px_2px_0px_rgba(30,27,75)]",
                "transition-all duration-200 ease-out",
                "hover:translate-x-px hover:translate-y-px hover:shadow-none",
                "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[2px_2px_0px_rgba(30,27,75)]",
                className
            )}
        >
            {isLoading ? (
                <>
                    <CircleNotchIcon className="h-5 w-5 animate-spin" />
                    <span>{loadingLabel}</span>
                </>
            ) : (
                <>
                    <Icon className="h-4 w-4" weight={weight} />
                    <span>{label}</span>
                </>
            )}
        </button>
    );
}
