"use client";

import SidebarKreator from "~/components/layout/sidebarkreator";
import HeaderKreator from "~/components/layout/headerkreator";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { useState, useEffect } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsSidebarCollapsed(true);
            } else {
                setIsSidebarCollapsed(false);
            }
        };

        // Initial check on mount
        handleResize();

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
            {/* Docked Sidebar for Tablet & Desktop (visible on md screens and up) */}
            <div className="hidden md:flex shrink-0">
                <SidebarKreator isCollapsed={isSidebarCollapsed} />
            </div>

            {/* Mobile Slide-out Drawer (visible on < md screens) */}
            {isMobileSidebarOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex">
                    {/* Backdrop overlay */}
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsMobileSidebarOpen(false)}
                    />

                    {/* Sidebar container */}
                    <div className="relative flex w-auto max-w-xs transition-transform duration-300 ease-out">
                        <SidebarKreator onCloseMobile={() => setIsMobileSidebarOpen(false)} isMobile />
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <HeaderKreator onMenuClick={handleHeaderMenuClick} />

                <main className="bg-slate-50 flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-6">
                    <div className="max-w-none">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}