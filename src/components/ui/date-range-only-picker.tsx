"use client";

import * as React from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar as CalendarIcon, CaretDownIcon } from "@phosphor-icons/react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "~/components/ui/popover";
import type { DateRange } from "react-day-picker";

interface DateRangeOnlyPickerProps {
    startDate?: Date;
    endDate?: Date;
    onChange: (range: { startDate?: Date; endDate?: Date }) => void;
    placeholder?: string;
    className?: string;
    disabled?: (date: Date) => boolean;
}

export function DateRangeOnlyPicker({
    startDate,
    endDate,
    onChange,
    placeholder = "Pilih tanggal mulai & selesai",
    className,
    disabled,
}: DateRangeOnlyPickerProps) {
    const [open, setOpen] = React.useState(false);

    // Map props to react-day-picker DateRange shape
    const dateRange: DateRange | undefined = React.useMemo(() => {
        if (!startDate) return undefined;
        return {
            from: startDate,
            to: endDate,
        };
    }, [startDate, endDate]);

    const handleSelect = (range: DateRange | undefined) => {
        onChange({
            startDate: range?.from,
            endDate: range?.to,
        });
    };

    const label = React.useMemo(() => {
        if (!startDate) return placeholder;
        if (!endDate) {
            return format(startDate, "d MMMM yyyy", { locale: id });
        }
        return `${format(startDate, "d MMMM yyyy", { locale: id })} - ${format(endDate, "d MMMM yyyy", { locale: id })}`;
    }, [startDate, endDate, placeholder]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full justify-between text-left bg-white border-slate-400 hover:bg-slate-50 h-[52px] px-4 rounded-lg focus:ring-2 focus:ring-cyan-600/50 transition-all shadow-none font-normal cursor-pointer",
                        !startDate && "text-slate-400",
                        className
                    )}
                >
                    <div className="flex items-center">
                        <CalendarIcon className="mr-2.5 h-5 w-5 text-slate-400 shrink-0" />
                        <span className="text-sm">{label}</span>
                    </div>
                    <CaretDownIcon className="h-4 w-4 text-slate-400" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-md">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={startDate}
                        selected={dateRange}
                        onSelect={handleSelect}
                        disabled={disabled}
                        numberOfMonths={1}
                    />
                    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500 max-w-[300px] mx-auto text-center leading-relaxed">
                        Pilih tanggal mulai, lalu pilih tanggal selesai.
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
