import * as React from "react";
import { CaretDownIcon } from "@phosphor-icons/react";

export interface FilterButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
}

const FilterButton = React.forwardRef<HTMLButtonElement, FilterButtonProps>(
    ({ label, className, ...props }, ref) => {
        return (
            <button
                ref={ref}
                type="button"
                className={`
                h-10
                flex-1 sm:flex-none
                flex items-center justify-between sm:justify-start gap-2
                px-4
                border border-slate-800
                rounded-lg
                text-sm text-slate-700
                bg-white
                shadow-[0px_1.5px_0px_rgba(29,41,61)]
                transition-all duration-200 ease-out
                hover:translate-x-px hover:translate-y-px hover:shadow-none
                focus:translate-x-px focus:translate-y-px focus:shadow-none
                cursor-pointer
                ${className ?? ""}
                `}
                {...props}
            >
                <span>{label}</span>
                <CaretDownIcon className="w-4 h-4 text-slate-600" />
            </button>
        );
    }
);

FilterButton.displayName = "FilterButton";

export default FilterButton;