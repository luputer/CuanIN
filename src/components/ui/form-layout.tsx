"use client";

import React from "react";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import { CaretDownIcon } from "@phosphor-icons/react";

interface FormGroupProps {
    label: string;
    children: React.ReactNode;
    error?: string;
    description?: string;
    className?: string;
    align?: "start" | "center";
    labelWidth?: string;
    layout?: "horizontal" | "vertical";
}

export const FormGroup = ({
    label,
    children,
    error,
    description,
    className,
    align = "center",
    labelWidth = "md:w-[200px]",
    layout = "horizontal",
}: FormGroupProps) => (
    <div className={cn(
        "flex py-4 last:border-0",
        layout === "horizontal"
            ? cn("flex-col md:flex-row gap-4 md:gap-10", align === "center" ? "md:items-center" : "md:items-start")
            : "flex-col gap-2",
        className
    )}>
        <Label className={cn(
            "text-sm text-slate-600 font-medium shrink-0",
            layout === "horizontal" ? labelWidth : "w-full",
            align === "start" && layout === "horizontal" && "md:pt-1"
        )}>
            {label}
        </Label>
        <div className="flex-1">
            {children}
            {description && <p className="text-slate-500 text-xs mt-2 italic">{description}</p>}
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        </div>
    </div>
);

interface SectionHeaderProps {
    title: string;
    children?: React.ReactNode;
    className?: string;
}

export const SectionHeader = ({ title, children, className }: SectionHeaderProps) => (
    <div className={cn("flex items-center justify-between border-b border-cyan-600 pb-2 mb-2", className)}>
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
                    "w-full flex items-center bg-white h-[52px] rounded-lg border border-slate-400 focus-within:ring-2 focus-within:ring-cyan-600/50 transition-all px-4 gap-2",
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
                    "w-full px-4 py-3 min-h-[100px] bg-white rounded-lg text-slate-800 font-regular border border-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-600/50 text-sm placeholder:text-slate-400 placeholder:text-sm leading-relaxed transition-all",
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
        <div className="relative group w-full">
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

/**
 * Custom Combobox for forms (Select + Custom Input)
 */
interface FormComboboxProps extends Omit<FormInputProps, "onChange"> {
    options: string[];
    onValueChange?: (value: string) => void;
    value?: string;
}

export const FormCombobox = React.forwardRef<HTMLInputElement, FormComboboxProps>(
    ({ options, onValueChange, value, className, ...props }, ref) => {
        const [inputValue, setInputValue] = React.useState(value ?? "");
        const [isCustomMode, setIsCustomMode] = React.useState(false);

        React.useEffect(() => {
            if (value !== undefined) {
                setInputValue(value);
                // Jika value dari luar tidak ada di opsi, otomatis masuk mode custom
                if (value !== "" && !options.includes(value)) {
                    setIsCustomMode(true);
                }
            }
        }, [value, options]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            setInputValue(newValue);
            onValueChange?.(newValue);
        };

        const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
            const newValue = e.target.value;
            if (newValue === "custom") {
                setIsCustomMode(true);
                setInputValue("");
                onValueChange?.("");
            } else {
                setIsCustomMode(false);
                setInputValue(newValue);
                onValueChange?.(newValue);
            }
        };

        const toggleCustomMode = () => {
            setIsCustomMode(!isCustomMode);
            if (isCustomMode) {
                // Jika keluar dari custom mode, reset ke kosong
                setInputValue("");
                onValueChange?.("");
            }
        };

        return (
            <div className="flex flex-col gap-2 w-full">
                {!isCustomMode ? (
                    <div className="relative group w-full">
                        <select
                            className={cn(
                                "w-full px-4 bg-white h-[52px] rounded-lg text-slate-800 font-regular border border-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-600/50 text-sm appearance-none cursor-pointer transition-all",
                                className
                            )}
                            value={options.includes(inputValue) ? inputValue : ""}
                            onChange={handleSelectChange}
                        >
                            <option value="" disabled>Pilih format...</option>
                            {options.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                            <option value="custom" className="font-semibold text-cyan-600">+ Input Custom...</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-800 group-focus-within:text-cyan-600 transition-colors">
                            <CaretDownIcon size={18} weight="regular" />
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <FormInput
                                {...props}
                                ref={ref}
                                value={inputValue}
                                onChange={handleChange}
                                placeholder="Masukkan format custom..."
                                autoFocus
                            />
                        </div>
                        <button
                            type="button"
                            onClick={toggleCustomMode}
                            className="px-4 text-xs font-medium text-slate-500 hover:text-red-500 transition-colors border border-slate-300 rounded-lg bg-slate-50"
                        >
                            Batal
                        </button>
                    </div>
                )}
            </div>
        );
    }
);
FormCombobox.displayName = "FormCombobox";
