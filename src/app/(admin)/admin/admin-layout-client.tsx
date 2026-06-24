"use client";

import SidebarAdmin from "~/components/admin/sidebar";
import HeaderAdmin from "~/components/admin/header";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { useState, useEffect } from "react";

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        if (typeof window !== "undefined") {
            return window.innerWidth < 1024;
        }
        return false;
    });

    useEffect(() => {
        const handleResize = () => {
            setIsSidebarCollapsed(window.innerWidth < 1024);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleHeaderMenuClick = () => {
        if (window.innerWidth < 768) {
            setIsMobileSidebarOpen(prev => !prev);
        } else {
            setIsSidebarCollapsed(prev => !prev);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Docked Sidebar for Tablet & Desktop */}
            <div className="hidden md:flex shrink-0">
                <SidebarAdmin isCollapsed={isSidebarCollapsed} />
            </div>

            {/* Mobile Slide-out Drawer */}
            {isMobileSidebarOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex">
                    {/* Backdrop overlay */}
                    <div
                        className="fixed inset-0 bg-slate-800/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsMobileSidebarOpen(false)}
                    />

                    {/* Sidebar container */}
                    <div className="relative flex w-auto max-w-xs transition-transform duration-300 ease-out">
                        <SidebarAdmin onCloseMobile={() => setIsMobileSidebarOpen(false)} isMobile />
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <HeaderAdmin onMenuClick={handleHeaderMenuClick} />

                <main className="bg-slate-50 flex-1 overflow-y-auto overflow-x-hidden p-6 scroll-smooth">
                    <div className="max-w-none">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
