"use client";
import Link from "next/link";

type ButtonProps = {
    text: string;
    onClick?: () => void;
    href?: string;
};

export default function Button({ text, onClick, href }: ButtonProps) {
    const className = "px-8 py-2 rounded-lg border-2 border-slate-800 text-xl font-semibold text-white bg-[#506CBF] shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition duration-200 ease-out cursor-pointer text-center inline-block";

    if (href) {
        return (
            <Link
                href={href}
                onClick={onClick}
                className={className}
            >
                {text}
            </Link>
        );
    }

    return (
        <button
            type="button"
            onClick={onClick}
            className={className}
        >
            {text}
        </button>
    );
}
