"use client";

import React from "react";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import { CaretDownIcon } from "@phosphor-icons/react";

interface FormGroupProps {
    label: string;
    children: React.ReactNode;
    error?: string;
    className?: string;
    align?: "start" | "center";
}

export const FormGroup = ({
    label,
    children,
    error,
    className,
    align = "center",
}: FormGroupProps) => (
    <div className={cn(
        "flex flex-col md:flex-row gap-10 py-4 last:border-0",
        align === "center" ? "md:items-center" : "md:items-start",
        className
    )}>
        <Label className={cn(
            "text-sm text-slate-600 font-medium w-[200px]",
            align === "start" && "md:pt-1"
        )}>
            {label}
        </Label>
        <div className="flex-1">
            {children}
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        </div>
    </div>
);

interface SectionHeaderProps {
    title: string;
    children?: React.ReactNode;
}

export const SectionHeader = ({ title, children }: SectionHeaderProps) => (
    <div className="flex items-center justify-between border-b border-cyan-600 pb-4 mb-4">
        <h2 className="text-md font-semibold text-cyan-600">{title}</h2>
        {children}
    </div>
);

/**
 * Custom Input for forms with optional prefix (e.g., "Rp")
 * Uses raw HTML input to avoid interference from base UI components
 */
interface FormInputProps extends React.ComponentProps<"input"> {
    prefix?: string;
    prefixClassName?: string;
    icon?: React.ElementType;
    iconClassName?: string;
    suffix?: React.ReactNode;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
    ({ prefix, prefixClassName, icon: Icon, iconClassName, suffix, className, ...props }, ref) => {
        if (prefix || Icon || suffix) {
            return (
                <div className={cn(
                    "flex items-center bg-white h-[52px] rounded-lg border border-slate-400 focus-within:ring-2 focus-within:ring-cyan-600/50 transition-all px-4 gap-2",
                    className
                )}>
                    {Icon && (
                        <Icon className={cn("w-5 h-5 text-slate-400 shrink-0", iconClassName)} />
                    )}
                    {prefix && (
                        <span className={cn("text-slate-500 text-sm font-medium shrink-0", prefixClassName)}>
                            {prefix}
                        </span>
                    )}
                    <input
                        ref={ref}
                        className="flex-1 bg-transparent h-full focus:outline-none text-sm placeholder:text-slate-400 placeholder:text-sm"
                        {...props}
                    />
                    {suffix && (
                        <div className="flex items-center gap-1 shrink-0">
                            {suffix}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <input
                ref={ref}
                className={cn(
                    "w-full px-4 bg-white h-[52px] rounded-lg border border-slate-400 text-slate-800 font-regular focus:outline-none focus:ring-2 focus:ring-cyan-600/50 text-sm placeholder:text-slate-400 placeholder:text-sm transition-all",
                    className
                )}
                {...props}
            />
        );
    }
);
FormInput.displayName = "FormInput";

/**
 * Custom Textarea for forms
 * Uses raw HTML textarea to avoid interference from base UI components
 */
export const FormTextarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                ref={ref}
                className={cn(
                    "w-full px-4 py-3 min-h-[120px] bg-white rounded-lg text-slate-800 font-regular border border-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-600/50 text-sm placeholder:text-slate-400 placeholder:text-sm leading-relaxed transition-all",
                    className
                )}
                {...props}
            />
        );
    }
);
FormTextarea.displayName = "FormTextarea";

/**
 * Custom Select for forms
 * Uses raw HTML select to avoid interference from base UI components
 */
export const FormSelect = React.forwardRef<HTMLSelectElement, React.ComponentProps<"select">>(
    ({ className, children, ...props }, ref) => (
        <div className="relative group">
            <select
                ref={ref}
                className={cn(
                    "w-full px-4 bg-white h-[52px] rounded-lg text-slate-800 font-regular border border-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-600/50 text-sm appearance-none cursor-pointer transition-all",
                    className
                )}
                {...props}
            >
                {children}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-800 group-focus-within:text-cyan-600 transition-colors">
                <CaretDownIcon size={18} weight="regular" />
            </div>
        </div>
    )
);
FormSelect.displayName = "FormSelect";
