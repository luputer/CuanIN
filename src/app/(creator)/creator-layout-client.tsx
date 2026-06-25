"use client";
import SidebarKreator from "~/components/creator/sidebar";
import HeaderKreator from "~/components/creator/header";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

export default function CreatorLayoutClient({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { data: catalog, isLoading: isCatalogLoading } = api.catalog.getMine.useQuery();

    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isReady, setIsReady] = useState(false);

    // ── Semua useEffect di atas conditional return ──

    useEffect(() => {
        if (isCatalogLoading) return;

        // undefined = query belum resolve, skip dulu
        if (catalog === undefined) return;

        if (catalog === null) {
            router.replace("/setup");
        } else {
            setIsReady(true);
        }
    }, [catalog, isCatalogLoading, router]);

    useEffect(() => {
        const handleResize = () => {
            setIsSidebarCollapsed(window.innerWidth < 1024);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // ── Conditional return setelah semua hooks ──

    if (!isReady) return null;

    const handleHeaderMenuClick = () => {
        if (window.innerWidth < 768) {
            setIsMobileSidebarOpen(prev => !prev);
        } else {
            setIsSidebarCollapsed(prev => !prev);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden">
            <div className="hidden md:flex shrink-0">
                <SidebarKreator isCollapsed={isSidebarCollapsed} />
            </div>

            {isMobileSidebarOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex">
                    <div
                        className="fixed inset-0 bg-slate-800/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsMobileSidebarOpen(false)}
                    />
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