import { MagnifyingGlassIcon } from "@phosphor-icons/react";

interface SearchProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
}

export default function SearchInput({
    value,
    onChange,
    placeholder = "Cari...",
}: SearchProps) {
    return (
        <div
            className="
        relative w-full sm:max-w-md
        shadow-[0px_1px_0px_rgba(30,27,75)]
        rounded-lg
        transition-all duration-200 ease-out
        hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none
        focus-within:translate-x-[1px] focus-within:translate-y-[1px] focus-within:shadow-none
      "
        >
            <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />

            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full bg-white pl-10 pr-4 py-2 border border-slate-800 rounded-lg text-slate-800 text-sm focus:outline-none"
            />
        </div>
    );
}