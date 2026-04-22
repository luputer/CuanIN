"use client";

import React, { createContext, useContext, useState } from "react";
import { cn } from "~/lib/utils";

const ACTIVE_TAB_CLASSES = "border-t-cyan-600 text-slate-800";

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
                    "relative py-3.5 px-10 transition-all cursor-pointer text-center text-sm min-w-[120px]",
                    isActive
                        ? cn("bg-cyan-50 border-t-4 border-l border-r border-slate-800 rounded-t-lg font-semibold -mb-[1px] z-20", ACTIVE_TAB_CLASSES)
                        : "border-b border-slate-800 text-slate-500 hover:text-slate-800 font-medium hover:bg-cyan-50 rounded-t-lg"
                )}
            >
                {label} {count !== undefined && `(${count})`}
            </button>
        );
    };

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
            <div className="flex flex-col">
                <div className={cn("bg-white border-b border-slate-800 px-6 pt-4", className)}>
                    <div className="flex gap-1 items-end -mb-[1px]">
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
        <div className="p-6 bg-cyan-50">
            <div className={cn("bg-white rounded-xl overflow-hidden", className)}>
                {children}
            </div>
        </div>
    );
}
