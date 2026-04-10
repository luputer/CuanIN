import Link from "next/link";

type ButtonProps = {
    text: string;
    onClick?: () => void;
    href?: string;
};

export default function Button({ text, onClick, href }: ButtonProps) {
    const className = `
    inline-block text-center
    px-8 py-2 
    rounded-lg 
    border-2
    border-indigo-950
    text-xl font-semibold
    text-white 
    bg-cyan-600
    shadow-[2px_2px_0px_rgba(30,27,75)]
    hover:translate-x-[2px] 
    hover:translate-y-[2px] 
    hover:shadow-none
    transition duration-200 ease-out
    cursor-pointer
  `;

    if (href) {
        return (
            <Link href={href} className={className}>
                {text}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className={className}>
            {text}
        </button>
    );
}