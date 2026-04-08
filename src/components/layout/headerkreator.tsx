"use client";
import { CaretDown } from "phosphor-react";
import { useState } from "react";

export default function HeaderKreator() {
    const [open, setOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 bg-white shadow px-12 py-3 flex items-center justify-end border-b-2 border-indigo-950">

            <div className="flex items-center gap-4">

                {/* 🔹 Bungkus jadi satu */}
                <div className="relative w-50">

                    {/* 🔹 Profile */}
                    <div
                        onClick={() => setOpen(!open)}
                        className="flex items-center justify-between cursor-pointer border-2 border-indigo-950 rounded-full py-2 px-4 w-full gap-3 shadow-[0px_2px_0px_rgba(30,27,75)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition duration-200 ease-out"
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 p-1 rounded-full bg-blue-500 text-white flex items-center justify-center">
                                MB
                            </div>
                            <span className="text-sm font-regular text-indigo-950">
                                Masoon Brooks
                            </span>
                        </div>

                        <CaretDown size={16} className="text-gray-600" />
                    </div>

                    {/* 🔹 Dropdown */}
                    {open && (
                        <div className="absolute right-0 top-14 w-full bg-white border-2 border-indigo-950 rounded-xl shadow-md p-2">
                            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm text-red-600">
                                Logout
                            </button>
                        </div>
                    )}

                </div>

            </div>
        </header>
    );
}