"use client";

import * as React from "react";
import { format, setHours, setMinutes } from "date-fns";
import { id } from "date-fns/locale"; // Untuk format Indonesia
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "~/components/ui/popover";
import { ScrollArea } from "./scroll-area";
import { CaretDownIcon } from "@phosphor-icons/react";

interface DateTimePickerProps {
    date?: Date;
    setDate: (date: Date) => void;
    placeholder?: string;
    disabled?: (date: Date) => boolean;
    className?: string;
}

export function DateTimePicker({ date, setDate, placeholder = "Pilih Tanggal & Waktu", disabled, className }: DateTimePickerProps) {
    // Generate array waktu (00:00, 00:30, dst)
    const timeOptions = Array.from({ length: 48 }).map((_, i) => {
        const hour = Math.floor(i / 2);
        const minute = i % 2 === 0 ? "00" : "30";
        return `${hour.toString().padStart(2, "0")}:${minute}`;
    });

    const handleTimeSelect = (time: string) => {
        const [hours, minutes] = time.split(":").map(Number);
        const newDate = date ? new Date(date) : new Date();
        const updatedDate = setHours(setMinutes(newDate, minutes ?? 0), hours ?? 0);
        setDate(updatedDate);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-between text-left bg-white border-slate-400 hover:bg-slate-50 h-[52px] hover:text-slate-600 px-4 rounded-lg focus:ring-2 focus:ring-cyan-600/50 transition-all shadow-none",
                        !date ? "text-slate-400 font-regular" : "text-slate-800 font-regular",
                        className
                    )}
                >
                    <div className="flex items-center">
                        <CalendarIcon className="mr-2.5 h-5 w-5 text-slate-400 shrink-0" />
                        {date ? (
                            <span className="text-sm">{format(date, "PPP HH:mm", { locale: id })}</span>
                        ) : (
                            <span className="text-sm">{placeholder}</span>
                        )}
                    </div>
                    <CaretDownIcon className="h-4 w-4 text-slate-400" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 flex flex-row" align="start">
                {/* Bagian Kalender */}
                <div className="p-2">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(d) => d && setDate(d)}
                        initialFocus
                        disabled={disabled}
                    />
                </div>

                {/* Bagian List Waktu (Time Picker) */}
                <div className="flex flex-col border-l border-slate-200 w-[120px]">
                    <div className="p-3 text-center font-regular text-sm border-b">
                        Time
                    </div>
                    <ScrollArea className="h-[300px]">
                        <div className="flex flex-col p-2">
                            {timeOptions.map((time) => {
                                const [hours, minutes] = time.split(":").map(Number);
                                const testDate = date ? setHours(setMinutes(new Date(date), minutes ?? 0), hours ?? 0) : undefined;
                                const isTimeDisabled = testDate && disabled ? disabled(testDate) : false;

                                return (
                                    <Button
                                        key={time}
                                        variant="ghost"
                                        disabled={isTimeDisabled}
                                        className={cn(
                                            "text-sm font-normal justify-center hover:bg-blue-50 hover:text-blue-600",
                                            date && format(date, "HH:mm") === time && "bg-blue-100 text-blue-700 font-bold"
                                        )}
                                        onClick={() => handleTimeSelect(time)}
                                    >
                                        {time}
                                    </Button>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </div>
            </PopoverContent>
        </Popover>
    );
}