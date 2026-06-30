"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LockIcon } from "@phosphor-icons/react";
import { PortalCombinedHeader } from "~/components/portal/portal-combined-header";
import { cn } from "~/lib/utils";

export const getCookie = (name: string) => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
};

export const deleteCookie = (name: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

function PortalDashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState("");
  const [isInitializing, setIsInitializing] = useState(true);

  const [backHref, setBackHref] = useState("/");

  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const ref = searchParams.get("ref");
    setBackHref(ref ? (ref.startsWith("/") ? ref : `/${ref}`) : "/");
  }, [searchParams]);

  useEffect(() => {
    if (status === "loading") return;

    const authorizedEmail = getCookie("history_authorized_email");
    const decodedEmail = authorizedEmail ? decodeURIComponent(authorizedEmail) : null;
    const savedToken = localStorage.getItem("history_access_token");

    // Jika user login via Next-Auth (Creator/User utama)
    if (session?.user?.email) {
      // Jika email token tamu tidak sama dengan email Next-Auth, bersihkan token tamu agar tidak bentrok
      if (decodedEmail && decodedEmail.toLowerCase() !== session.user.email.toLowerCase()) {
        localStorage.removeItem("history_access_token");
        deleteCookie("history_authorized_email");
      }
      setEmail(session.user.email);
      setIsInitializing(false);
    }
    // Jika tidak login via Next-Auth, tapi ada token tamu (Guest)
    else if (decodedEmail && savedToken) {
      setEmail(decodedEmail);
      setIsInitializing(false);
    }
    // Jika tidak ada dua-duanya, arahkan ke login portal
    else {
      router.replace("/portal/login");
    }
  }, [session, status, router]);

  const handleLogout = async () => {
    deleteCookie("history_authorized_email");
    localStorage.removeItem("history_access_token");
    setEmail("");

    toast.success("Berhasil keluar dari portal.");
    router.replace("/portal/login");
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <PortalCombinedHeader backHref={backHref} email="..." handleLogout={handleLogout} />
        <main className="flex-1 flex items-center justify-center">
          <svg className="animate-spin h-10 w-10 text-cuan-cyan" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <PortalCombinedHeader backHref={backHref !== "/" ? backHref : undefined} email={email} handleLogout={handleLogout} />

      {/* Tab Menu */}
      <div className="bg-white border-b border-slate-200 pt-4">
        <div className="mx-auto w-full max-w-6xl px-4 flex items-center gap-2">
          <Link
            href={backHref !== "/" ? `/portal/dashboard?ref=${encodeURIComponent(backHref)}` : "/portal/dashboard"}
            className={cn(
              "px-4 py-3 text-sm font-semibold border-b-2 transition-colors",
              pathname === "/portal/dashboard" || pathname.startsWith("/portal/dashboard/produk")
                ? "border-cuan-cyan text-cuan-cyan"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            Produk Saya
          </Link>
          <Link
            href={backHref !== "/" ? `/portal/dashboard/riwayat?ref=${encodeURIComponent(backHref)}` : "/portal/dashboard/riwayat"}
            className={cn(
              "px-4 py-3 text-sm font-semibold border-b-2 transition-colors",
              pathname.startsWith("/portal/dashboard/riwayat")
                ? "border-cuan-cyan text-cuan-cyan"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            Riwayat Pembelian
          </Link>
        </div>
      </div>

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">
        {children}
      </main>

      <footer className="text-center py-6 border-t border-slate-200 mt-auto bg-white">
        <div className="flex items-center justify-center gap-4 text-xs text-slate-400 font-bold uppercase tracking-wider">
          <LockIcon size={12} weight="fill" />
          <span>Powered by</span>
          <Image
            src="/logo-cuanin.svg"
            alt="CuanIN"
            width={60}
            height={18}
            className="h-4 w-auto object-contain"
          />
        </div>
      </footer>
    </div>
  );
}

export default function PortalDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <PortalDashboardLayoutContent>{children}</PortalDashboardLayoutContent>
    </Suspense>
  );
}
