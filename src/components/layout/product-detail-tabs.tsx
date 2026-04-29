"use client";

import React, { createContext, useContext, useState } from "react";
import { cn } from "~/lib/utils";

const ACTIVE_TAB_CLASSES = "border-cyan-600 text-cyan-600";

interface TabsContextProps {
    activeTab: string;
    setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextProps | undefined>(undefined);

interface ProductDetailTabsProps {
    defaultTab: string;
    buyerCount: number;
    children: React.ReactNode;
    className?: string;
}

export function ProductDetailTabs({ defaultTab, buyerCount, children, className }: ProductDetailTabsProps) {
    const [activeTab, setActiveTab] = useState(defaultTab);

    const TabButton = ({ value, label, count }: { value: string; label: string; count?: number }) => {
        const isActive = activeTab === value;
        return (
            <button
                onClick={() => setActiveTab(value)}
                className={cn(
                    "relative pt-6 pb-4 px-4 transition-all cursor-pointer text-center text-md border-b-4 -mb-[1px]",
                    isActive
                        ? cn("z-20 font-semibold", ACTIVE_TAB_CLASSES)
                        : "font-normal text-slate-500 hover:text-slate-800 border-transparent"
                )}
            >
                {label} {count !== undefined && `(${count})`}
            </button>
        );
    };

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
            <div className="flex flex-col">
                <div className={cn("bg-cyan-50 border-b border-cyan-200 px-4 sm:px-10", className)}>
                    <div className="flex gap-6 sm:gap-10 items-end -mb-[1px] overflow-x-auto no-scrollbar">
                        <TabButton value="detail" label="Detail Produk" />
                        <TabButton value="user" label="Pembeli" count={buyerCount} />
                        <TabButton value="form" label="Kustomisasi Form" />
                    </div>
                </div>
                <div className="relative z-10">
                    {children}
                </div>
            </div>
        </TabsContext.Provider>
    );
}

export function ProductDetailTabContent({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
    const context = useContext(TabsContext);
    if (!context) return null;

    if (context.activeTab !== value) return null;

    return (
        <div className="p-2 bg-white">
            <div className={cn("bg-white rounded-xl overflow-hidden", className)}>
                {children}
            </div>
        </div>
    );
}
