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

interface DateTimePickerProps {
    date?: Date;
    setDate: (date: Date) => void;
    placeholder?: string;
}

export function DateTimePicker({ date, setDate, placeholder = "Pilih Tanggal & Waktu" }: DateTimePickerProps) {
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
                        "w-full justify-start text-left font-normal bg-white border-blue-200 hover:bg-blue-50 h-[52px]",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4 text-blue-500" />
                    {date ? (
                        format(date, "PPP HH:mm", { locale: id })
                    ) : (
                        <span>{placeholder}</span>
                    )}
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
                    />
                </div>

                {/* Bagian List Waktu (Time Picker) */}
                <div className="flex flex-col border-l border-slate-200 w-[120px]">
                    <div className="p-3 text-center font-semibold text-sm border-b">
                        Time
                    </div>
                    <ScrollArea className="h-[300px]">
                        <div className="flex flex-col p-2">
                            {timeOptions.map((time) => (
                                <Button
                                    key={time}
                                    variant="ghost"
                                    className={cn(
                                        "text-sm font-normal justify-center hover:bg-blue-50 hover:text-blue-600",
                                        date && format(date, "HH:mm") === time && "bg-blue-100 text-blue-700 font-bold"
                                    )}
                                    onClick={() => handleTimeSelect(time)}
                                >
                                    {time}
                                </Button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </PopoverContent>
        </Popover>
    );
}