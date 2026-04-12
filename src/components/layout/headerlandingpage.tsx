import Link from "next/link";
import Button from "~/components/ui/buttonlogin";

type HeaderProps = {
    buttonText: string;
    buttonHref: string;
};

export default function HeaderLandingPage({ buttonText, buttonHref }: HeaderProps) {
    return (
        <header className="sticky top-0 z-50 w-full bg-white shadow-[0px_0px_4px_rgba(0,0,0,0.25)]">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6">

                {/* Logo */}
                <div className="text-yellow-500 text-2xl font-bold">
                    <Link href="/">CuanIN</Link>
                </div>

                {/* Button */}
                <div>
                    <Button text={buttonText} href={buttonHref} />
                </div>
            </div>
        </header>
    );
}