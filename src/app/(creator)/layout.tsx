import SidebarKreator from "~/components/layout/sidebarkreator";
import HeaderKreator from "~/components/layout/headerkreator";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex">
            <SidebarKreator />
            <div className="flex-1">
                <HeaderKreator />

                <main className="p-6 min-h-screen">
                    {children}
                </main>
            </div>

        </div>
    );
}