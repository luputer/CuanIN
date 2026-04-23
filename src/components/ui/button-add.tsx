import Link from "next/link";
import { PlusIcon } from "@phosphor-icons/react";

interface ActionButtonProps {
    href: string;
    label: string;
}

export default function ActionButton({ href, label }: ActionButtonProps) {
    return (
        <Link
            href={href}
            className="
        flex-1 sm:flex-none
        flex items-center justify-between sm:justify-start gap-2
        pl-4 pr-6 py-2

        border border-slate-800
        rounded-lg
        text-sm font-semibold
        text-white
        bg-cyan-600

        shadow-[1px_1px_0px_rgba(30,27,75)]
        transition-all duration-200 ease-out

        hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none
        focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-none
      "
        >
            <PlusIcon className="w-4 h-4" weight="bold" />
            <span>{label}</span>
        </Link>
    );
}