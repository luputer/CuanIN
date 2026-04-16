import SidebarKreator from "~/components/layout/sidebarkreator";
import HeaderKreator from "~/components/layout/headerkreator";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen overflow-hidden">
            <SidebarKreator />
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <HeaderKreator />

                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>

        </div>
    );
}