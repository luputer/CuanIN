import Link from "next/link";
import Button from "~/components/ui/buttonlogin";

export default function HeaderLandingPage() {
    return (
        <header className="sticky top-0 z-50 w-full bg-white border-b-2 border-indigo-950">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6">

                {/* Logo */}
                <div className="text-yellow-500 text-2xl font-bold">
                    <Link href="/">CuanIN</Link>
                </div>

                {/* Menu */}
                <nav className="hidden gap-10 md:flex">
                    <Link href="#tentang" className="hover:text-cyan-600">
                        Tentang
                    </Link>
                    <Link href="#fitur" className="hover:text-cyan-600">
                        Fitur
                    </Link>
                    <Link href="#cara-kerja" className="hover:text-cyan-600">
                        Cara Kerja
                    </Link>
                    <Link href="#footer" className="hover:text-cyan-600">
                        Kontak
                    </Link>
                </nav>

                {/* Button */}
                <div>
                    <Link href="/sign-in">
                        <Button text="Login" />
                    </Link>
                </div>
            </div>
        </header>
    );
}