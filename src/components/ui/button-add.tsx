import React from "react";
import Link from "next/link";
import { PlusIcon, CircleNotchIcon } from "@phosphor-icons/react";
import { cn } from "~/lib/utils";

interface ButtonAddProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    href?: string;
    label: string;
    className?: string;
    weight?: "regular" | "bold" | "fill" | "light" | "thin";
    isLoading?: boolean;
    loadingLabel?: string;
    icon?: React.ComponentType<any>;
    variant?: "primary" | "secondary";
}

export default function ButtonAdd({
    href,
    label,
    className,
    weight = "bold",
    isLoading,
    loadingLabel = "Menyimpan...",
    icon: Icon = PlusIcon,
    onClick,
    variant = "primary",
    ...props
}: ButtonAddProps) {
    const content = (
        <>
            {isLoading ? (
                <>
                    <CircleNotchIcon className="h-5 w-5 animate-spin" />
                    <span>{loadingLabel}</span>
                </>
            ) : (
                <>
                    <Icon className="h-5 w-5" weight={weight} />
                    <span>{label}</span>
                </>
            )}
        </>
    );

    const classes = cn(
        "w-fit flex items-center justify-center gap-2 px-6 py-2",
        "border rounded-lg",
        variant === "primary"
            ? "text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-700 border-slate-800 shadow-[1.5px_1.5px_0px_rgba(29,41,61)]"
            : "text-sm font-semibold text-cyan-600 bg-white hover:bg-cyan-50 border-cyan-600 shadow-[1.5px_1.5px_0px_rgba(15,150,195)]",
        "transition-all duration-200 ease-out",
        "hover:translate-x-px hover:translate-y-px hover:shadow-none",
        "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0",
        "cursor-pointer",
        className
    );

    if (href && !onClick) {
        return (
            <Link href={href} className={classes}>
                {content}
            </Link>
        );
    }

    return (
        <button
            {...props}
            type={props.type ?? "button"}
            onClick={onClick}
            disabled={!!isLoading || !!props.disabled}
            className={classes}
        >
            {content}
        </button>
    );
}