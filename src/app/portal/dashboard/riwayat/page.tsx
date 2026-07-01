"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";
import { ReceiptIcon, Funnel } from "@phosphor-icons/react";
import { getCookie } from "~/app/portal/dashboard/layout";
import SearchInput from "~/components/ui/search";
import { PortalPurchaseCard } from "~/components/portal/portal-purchase-card";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { cn } from "~/lib/utils";

import type { TabType, PortalPurchaseType } from "~/types/portal";

const TABS: { key: TabType; label: string }[] = [
  { key: "ALL", label: "Semua Riwayat" },
  { key: "DIGITAL_PRODUCT", label: "Produk Digital" },
  { key: "WEBINAR", label: "Webinar" },
  { key: "KELAS_ONLINE", label: "Kelas" },
];

function PortalRiwayatPageInner() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("ALL");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status === "loading") return;

    const ref = searchParams.get("ref");
    const isFromDashboard = ref === "/dashboard" || ref === "dashboard" || ref?.startsWith("/dashboard") || ref?.startsWith("dashboard");

    if (isFromDashboard && session?.user?.email) {
      localStorage.removeItem("history_access_token");
      setAccessToken(null);
      return;
    }

    const token = localStorage.getItem("history_access_token");
    const email = getCookie("history_authorized_email");

    if (token && email) {
      setAccessToken(token);
      return;
    }

    if (!session?.user) {
      router.replace("/portal/login");
    }
  }, [session, status, router, searchParams]);


  const { data: historyData, isLoading: isLoadingGuest, error: historyError } =
    api.purchases.getPurchaseHistoryByToken.useQuery(
      { accessToken: accessToken!, mode: "riwayat" },
      { enabled: !!accessToken, retry: false }
    );

  useEffect(() => {
    if (historyError && accessToken) {
      localStorage.removeItem("history_access_token");
      setAccessToken(null);
    }
  }, [historyError, accessToken]);

  const { data: authPurchases, isLoading: isLoadingAuth } = api.purchases.getPurchaseHistoryForCreator.useQuery(
    { mode: "riwayat" },
    { enabled: !accessToken && !!session?.user }
  );

  const rawPurchases = ((accessToken ? historyData?.purchases : authPurchases?.purchases) ?? []) as unknown as PortalPurchaseType[];
  const isLoading = accessToken ? (isLoadingGuest && !!accessToken) : isLoadingAuth;

  const sortedPurchases = useMemo(() => {
    return [...rawPurchases].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [rawPurchases, sortOrder]);

  const filteredPurchases = useMemo(() => {
    let filtered = activeTab === "ALL"
      ? sortedPurchases
      : sortedPurchases.filter((p) => p.product.type === activeTab);

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter((p) => p.product.name.toLowerCase().includes(q));
    }

    return filtered;
  }, [sortedPurchases, activeTab, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full items-center gap-3 md:w-auto">
          <div className="w-full flex-1 md:w-96 md:flex-initial">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari riwayat pembelian..."
              className="w-full rounded-full border border-slate-400 !shadow-none"
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-400 bg-white text-slate-600 transition-all duration-200 ease-out hover:bg-slate-50 hover:text-slate-800 hover:translate-x-[1px] hover:translate-y-[1px] !shadow-none m-0 p-0 box-border"
                title="Urutkan Riwayat"
              >
                <Funnel className="h-5 w-5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="end">
              <div className="flex flex-col gap-1">
                <p className="px-2.5 py-1.5 text-xs font-semibold text-slate-400">Urutkan Berdasarkan:</p>
                <button
                  onClick={() => setSortOrder("newest")}
                  className={cn(
                    "w-full cursor-pointer rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-all hover:bg-slate-100",
                    sortOrder === "newest" ? "bg-cuan-cyan/10 text-cuan-cyan" : "text-slate-600"
                  )}
                >
                  Terbaru
                </button>
                <button
                  onClick={() => setSortOrder("oldest")}
                  className={cn(
                    "w-full cursor-pointer rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-all hover:bg-slate-100",
                    sortOrder === "oldest" ? "bg-cuan-cyan/10 text-cuan-cyan" : "text-slate-600"
                  )}
                >
                  Terlama
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSearch(""); }}
              className={`h-9 md:h-10 cursor-pointer rounded-full px-3 md:px-4 py-2 text-xs md:text-sm font-medium transition-all ${activeTab === tab.key
                ? "border border-cuan-cyan bg-cuan-cyan text-white"
                : "border border-slate-400 bg-white text-slate-600 hover:bg-cuan-cyan/10"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-start">
        <p className="text-md md:text-lg font-medium text-slate-800">
          {TABS.find((t) => t.key === activeTab)?.label ?? "Semua Kategori"}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 w-full rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filteredPurchases.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-24 text-slate-400 text-center px-4">
          <ReceiptIcon className="h-12 w-12" strokeWidth={1} />
          <p className="text-sm">
            {search.trim() ? `Pencarian "${search}" tidak ditemukan.` : "Belum ada riwayat pembelian."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredPurchases.map((purchase) => (
            <PortalPurchaseCard key={purchase.id} purchase={purchase} isHistoryTab={true} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PortalRiwayatPage() {
  return (
    <Suspense>
      <PortalRiwayatPageInner />
    </Suspense>
  );
}
