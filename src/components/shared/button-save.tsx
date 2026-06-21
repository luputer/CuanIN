import React from "react";
import { CircleNotchIcon, CheckIcon } from "@phosphor-icons/react";
import { cn } from "~/lib/utils";

interface ButtonSaveProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    label?: string;
    loadingLabel?: string;
    icon?: React.ElementType | null;
    weight?: "regular" | "bold" | "fill" | "light" | "thin";
    className?: string;
    align?: "left" | "center";
}

export default function ButtonSave({
    isLoading,
    label = "Simpan Perubahan",
    loadingLabel = "Menyimpan...",
    icon: Icon = CheckIcon,
    className,
    weight,
    ...props
}: ButtonSaveProps) {
    return (
        <button
            type="button"
            {...props}
            disabled={!!isLoading || !!props.disabled}
            className={cn(
                "w-fit flex items-center justify-center gap-2 px-6 py-4",
                "border border-slate-800 rounded-lg",
                "text-sm font-semibold text-white bg-cuan-cyan cursor-pointer",
                "shadow-[2px_2px_0px_#000]",
                "transition-all duration-200 ease-out",
                "hover:translate-x-px hover:translate-y-px hover:shadow-none",
                "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[2px_1px_0px_#000]",
                className
            )}
        >
            {isLoading ? (
                <>
                    <CircleNotchIcon className="size-5 animate-spin" />
                    <span>{loadingLabel}</span>
                </>
            ) : (
                <>
                    {Icon && <Icon className="size-5" weight={weight} />}
                    <span>{label}</span>
                </>
            )}
        </button>
    );
}
