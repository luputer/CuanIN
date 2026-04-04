import Link from "next/link";
import Button from "~/components/ui/buttonlogin";

export default function HeaderLogin() {
    return (
        <header className="sticky top-0 z-50 w-full bg-white border-b-2 border-indigo-950">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6">

                {/* Logo */}
                <div className="text-yellow-500 text-2xl font-bold">
                    <Link href="/">CuanIN</Link>
                </div>

                {/* Button */}
                <div>
                    <Button text="Login" />
                </div>
            </div>
        </header>
    );
}