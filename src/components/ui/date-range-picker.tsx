"use client";

import * as React from "react";
import { format, setHours, setMinutes } from "date-fns";
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
import { ScrollArea } from "./scroll-area";
import type { DateRange } from "react-day-picker";

interface DateRangePickerProps {
    startDate?: Date;
    endDate?: Date;
    onChange: (range: { startDate?: Date; endDate?: Date }) => void;
    placeholder?: string;
    className?: string;
    disabled?: (date: Date) => boolean;
    showEndTime?: boolean;
}

export function DateRangePicker({
    startDate,
    endDate,
    onChange,
    placeholder = "Pilih tanggal & waktu",
    className,
    disabled,
    showEndTime = true,
}: DateRangePickerProps) {
    // We use the startDate as the primary date reference
    const date = startDate || new Date();

    const timeOptions = Array.from({ length: 48 }).map((_, i) => {
        const hour = Math.floor(i / 2);
        const minute = i % 2 === 0 ? "00" : "30";
        return `${hour.toString().padStart(2, "0")}:${minute}`;
    });

    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (!selectedDate) return;

        // Apply existing times to the new date
        const newStart = setHours(setMinutes(new Date(selectedDate), startDate?.getMinutes() ?? 0), startDate?.getHours() ?? 0);
        const newEnd = showEndTime 
            ? setHours(setMinutes(new Date(selectedDate), endDate?.getMinutes() ?? 0), endDate?.getHours() ?? 0)
            : undefined;

        onChange({ startDate: newStart, endDate: newEnd });
    };

    const handleTimeSelect = (type: "start" | "end", time: string) => {
        const [hours, minutes] = time.split(":").map(Number);
        if (type === "start") {
            const current = startDate ? new Date(startDate) : new Date(date);
            const updated = setHours(setMinutes(current, minutes ?? 0), hours ?? 0);
            onChange({ startDate: updated, endDate });
        } else {
            const current = endDate ? new Date(endDate) : new Date(date);
            const updated = setHours(setMinutes(current, minutes ?? 0), hours ?? 0);
            onChange({ startDate, endDate: updated });
        }
    };

    const label = startDate
        ? showEndTime && endDate
            ? `${format(startDate, "d MMMM yyyy", { locale: id })}, ${format(startDate, "HH:mm")} - ${format(endDate, "HH:mm")}`
            : `${format(startDate, "d MMMM yyyy, HH:mm", { locale: id })}`
        : placeholder;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full justify-between text-left bg-white border-slate-400 hover:bg-slate-50 h-[52px] px-4 rounded-lg focus:ring-2 focus:ring-cyan-600/50 transition-all shadow-none font-normal cursor-pointer",
                        !startDate && "text-slate-800",
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
            <PopoverContent className="w-auto p-0 flex flex-row" align="start">
                <div className="p-4 border-r border-slate-200">
                    <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={handleDateSelect}
                        initialFocus
                        disabled={disabled}
                    />
                    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500 max-w-[200px]">
                        Pilih tanggal, lalu tentukan jam {showEndTime ? "mulai dan selesai" : ""}.
                    </div>
                </div>

                {/* Time Selection Columns */}
                <div className="flex">
                    {/* Start Time */}
                    <div className={cn("flex flex-col border-r border-slate-100 w-[100px]", !showEndTime && "border-r-0")}>
                        <div className="p-3 text-center font-semibold text-xs border-b bg-slate-50 text-slate-600">
                            {showEndTime ? "Mulai" : "Jam"}
                        </div>
                        <ScrollArea className="h-[300px]">
                            <div className="flex flex-col p-1.5">
                                {timeOptions.map((time) => (
                                    <Button
                                        key={time}
                                        variant="ghost"
                                        size="sm"
                                        className={cn(
                                            "text-xs font-normal justify-center h-8",
                                            startDate && format(startDate, "HH:mm") === time && "bg-cyan-100 text-cyan-700 font-bold"
                                        )}
                                        onClick={() => handleTimeSelect("start", time)}
                                    >
                                        {time}
                                    </Button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* End Time (Optional) */}
                    {showEndTime && (
                        <div className="flex flex-col w-[100px]">
                            <div className="p-3 text-center font-semibold text-xs border-b bg-slate-50 text-slate-600">
                                Selesai
                            </div>
                            <ScrollArea className="h-[300px]">
                                <div className="flex flex-col p-1.5">
                                    {timeOptions.map((time) => (
                                        <Button
                                            key={time}
                                            variant="ghost"
                                            size="sm"
                                            className={cn(
                                                "text-xs font-normal justify-center h-8",
                                                endDate && format(endDate, "HH:mm") === time && "bg-cyan-100 text-cyan-700 font-bold"
                                            )}
                                            onClick={() => handleTimeSelect("end", time)}
                                        >
                                            {time}
                                        </Button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
