import React from "react";
import Link from "next/link";
import { PlusIcon, CircleNotchIcon } from "@phosphor-icons/react";
import { cn } from "~/lib/utils";

type IconWeight = "regular" | "bold" | "fill" | "light" | "thin";
type ButtonIcon = React.ComponentType<{
  className?: string;
  weight?: IconWeight;
}>;

interface ButtonAddProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  label: string;
  className?: string;
  weight?: IconWeight;
  isLoading?: boolean;
  loadingLabel?: string;
  icon?: ButtonIcon;
  variant?: "primary" | "secondary";
  responsive?: boolean;
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
  responsive = false,
  ...props
}: ButtonAddProps) {
  const content = (
    <>
      {isLoading ? (
        <>
          <CircleNotchIcon className="h-5 w-5 animate-spin" />
          <span className={cn(responsive && "hidden sm:inline")}>{loadingLabel}</span>
        </>
      ) : (
        <>
          <Icon className="h-5 w-5" weight={weight} />
          <span className={cn(responsive && "hidden sm:inline")}>{label}</span>
        </>
      )}
    </>
  );

  const classes = cn(
    "w-fit h-10 flex items-center justify-center gap-2 whitespace-nowrap",
    responsive ? "px-3 sm:px-6" : "px-6",
    "border rounded-lg",
    variant === "primary"
      ? "text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-700 border-slate-800 shadow-[1.5px_1.5px_0px_rgba(29,41,61)]"
      : "text-sm font-semibold text-cyan-600 bg-white hover:bg-cyan-50 border-cyan-600 shadow-[1.5px_1.5px_0px_rgba(15,150,195)]",
    "transition-all duration-200 ease-out",
    "hover:translate-x-px hover:translate-y-px hover:shadow-none",
    "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0",
    "cursor-pointer",
    className,
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
