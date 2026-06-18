"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { ReceiptIcon, SignOutIcon, CaretUpDownIcon } from "@phosphor-icons/react";
import { Button } from "~/components/ui/button";
import { CatalogNavHeader } from "~/components/layout/catalog-nav-header";
import { VerificationForm } from "~/components/catalog/history/VerificationForm";
import { HistoryList } from "~/components/catalog/history/HistoryList";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { cn } from "~/lib/utils";

const getCookie = (name: string) => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
};

const setCookie = (name: string, value: string, days: number) => {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
};

const deleteCookie = (name: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

function PurchaseHistoryPageInner() {
  const [step, setStep] = useState<"EMAIL" | "OTP" | "HISTORY">("EMAIL");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const backHref = ref === "dashboard" ? "/dashboard" : "/";

  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email);
      setStep("HISTORY");
    } else {
      const authorizedEmail = getCookie("history_authorized_email");
      const savedToken = sessionStorage.getItem("history_access_token");
      if (authorizedEmail && savedToken) {
        setEmail(authorizedEmail);
        setAccessToken(savedToken);
        setStep("HISTORY");
      }
    }
  }, [session]);

  const handleLogout = () => {
    deleteCookie("history_authorized_email");
    sessionStorage.removeItem("history_access_token");
    setEmail("");
    setAccessToken(null);
    setStep("EMAIL");
    toast.success("Berhasil keluar dari sesi riwayat pembelian.");
  };

  const sendOtp = api.purchases.sendPurchaseHistoryOtp.useMutation({
    onSuccess: () => setStep("OTP"),
    onError: (err) => toast.error(err.message),
  });

  const verifyOtp = api.purchases.verifyPurchaseHistoryOtp.useMutation({
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      sessionStorage.setItem("history_access_token", data.accessToken);
      setCookie("history_authorized_email", email, 30);
      setStep("HISTORY");
    },
    onError: (err) => toast.error(err.message),
  });

  const { data: historyData } = api.purchases.getPurchaseHistoryByToken.useQuery(
    { accessToken: accessToken! },
    { enabled: !!accessToken && step === "HISTORY" && !session?.user }
  );

  const { data: authPurchases, isLoading: isLoadingAuth } =
    api.purchases.getPurchaseHistoryForCreator.useQuery(undefined, {
      enabled: !!session?.user && step === "HISTORY",
    });

  const rawPurchases =
    (session?.user ? authPurchases?.purchases : historyData?.purchases) ?? [];

  const currentPurchases = [...rawPurchases].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  const isLoading = session?.user
    ? isLoadingAuth
    : !historyData && step === "HISTORY";

  // ── List / Verifikasi ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      <CatalogNavHeader backHref={backHref} />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 md:px-10 md:pt-10 md:pb-12 shadow-sm">
          {/* Header baris */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <ReceiptIcon size={28} />
                Riwayat Pembelian
              </h1>
              {step === "HISTORY" && email && (
                <p className="text-sm text-slate-500 font-medium ml-10">
                  Menampilkan riwayat untuk:{" "}
                  <span className="font-semibold text-slate-700">{email}</span>
                </p>
              )}
            </div>

            {step === "HISTORY" && (
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-slate-500 hover:text-red-600 hover:bg-transparent flex items-center gap-2 cursor-pointer h-10 px-4"
              >
                <SignOutIcon size={20} />
                Logout
              </Button>
            )}
          </div>

          {/* Filter sort */}
          {step === "HISTORY" && (
            <div className="mb-6">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex h-10 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50 cursor-pointer">
                    {sortOrder === "newest" ? "Terbaru" : "Terlama"}
                    <CaretUpDownIcon className="h-4 w-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2" align="start">
                  <div className="flex flex-col gap-1">
                    <p className="px-2.5 py-1.5 text-xs font-semibold text-slate-400">
                      Urutkan Berdasarkan:
                    </p>
                    <button
                      onClick={() => setSortOrder("newest")}
                      className={cn(
                        "w-full cursor-pointer rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-all hover:bg-slate-100",
                        sortOrder === "newest"
                          ? "bg-cyan-50 text-cyan-600"
                          : "text-slate-700"
                      )}
                    >
                      Terbaru
                    </button>
                    <button
                      onClick={() => setSortOrder("oldest")}
                      className={cn(
                        "w-full cursor-pointer rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-all hover:bg-slate-100",
                        sortOrder === "oldest"
                          ? "bg-cyan-50 text-cyan-600"
                          : "text-slate-700"
                      )}
                    >
                      Terlama
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Konten utama */}
          <div className="w-full">
            {step !== "HISTORY" ? (
              <div className="max-w-md mx-auto">
                <VerificationForm
                  step={step}
                  email={email}
                  setEmail={setEmail}
                  otp={otp}
                  setOtp={setOtp}
                  onSubmitEmail={(e: any) => {
                    e.preventDefault();
                    sendOtp.mutate({ email });
                  }}
                  onSubmitOtp={(e: any) => {
                    e.preventDefault();
                    verifyOtp.mutate({ email, otp });
                  }}
                  isPending={sendOtp.isPending || verifyOtp.isPending}
                  onBack={() => setStep("EMAIL")}
                />
              </div>
            ) : (
              <HistoryList
                purchases={currentPurchases}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PurchaseHistoryPage() {
  return (
    <Suspense>
      <PurchaseHistoryPageInner />
    </Suspense>
  );
}
