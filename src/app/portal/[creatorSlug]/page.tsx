"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import Image from "next/image";
import {
  SpinnerIcon,
  LinkIcon,
  NoteIcon,
  CalendarCheckIcon,
  StorefrontIcon,
  EnvelopeSimpleIcon,
  ArrowCounterClockwiseIcon,
  SignOutIcon,
  MagnifyingGlassIcon,
  CreditCardIcon,
  LockIcon,
  CurrencyCircleDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  DeviceTabletIcon,
  PresentationChartIcon,
  GraduationCapIcon,
  SquaresFourIcon,
  DownloadSimpleIcon,
} from "@phosphor-icons/react";
import { generateInvoicePDF } from "~/lib/invoice";

const PORTAL_TOKEN_KEY = "portal_token_";

type TabType = "DIGITAL_PRODUCT" | "WEBINAR" | "ALL" | "KELAS_ONLINE" | "payment";

const TABS: { key: TabType; label: string; icon: typeof DeviceTabletIcon }[] = [
  { key: "DIGITAL_PRODUCT", label: "Digital", icon: DeviceTabletIcon },
  { key: "WEBINAR", label: "Webinar", icon: PresentationChartIcon },
  { key: "ALL", label: "Semua", icon: SquaresFourIcon },
  { key: "KELAS_ONLINE", label: "Kelas", icon: GraduationCapIcon },
  { key: "payment", label: "Payment", icon: CreditCardIcon },
];

function getPortalTokenKey(creatorSlug: string) {
  return `${PORTAL_TOKEN_KEY}${creatorSlug}`;
}

function PortalRequestForm({ creatorSlug }: { creatorSlug: string }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const requestLink = api.purchases.requestCreatorPortalLink.useMutation({
    onSuccess: () => setSent(true),
    onError: (err) => setError(err.message || "Terjadi kesalahan"),
  });

  if (sent) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
            <EnvelopeSimpleIcon className="text-green-600" size={28} weight="fill" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Cek Email Kamu!</h1>
          <p className="text-slate-500 text-sm">
            Kami telah mengirim link portal ke <strong>{email}</strong>. Buka email dan klik link untuk mengakses portal kamu.
          </p>
          <p className="text-xs text-slate-400">
            Tidak menemukan email? Cek folder spam atau pastikan email yang kamu masukkan sudah benar.
          </p>
          <button
            onClick={() => { setSent(false); setError(""); }}
            className="inline-flex items-center gap-1.5 text-sm text-cuan-cyan hover:text-007EA5 font-medium mt-2"
          >
            <ArrowCounterClockwiseIcon size={16} />
            Kirim ulang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <StorefrontIcon size={24} weight="bold" className="text-cuan-cyan" />
            <span className="text-lg font-bold text-slate-800">CuanIN</span>
          </div>
          <div className="w-16 h-16 mx-auto rounded-full bg-cuan-cyan/20 flex items-center justify-center">
            <EnvelopeSimpleIcon className="text-cuan-cyan" size={28} weight="fill" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Akses Portal</h1>
          <p className="text-slate-500 text-sm">
            Masukkan email yang kamu gunakan saat pembelian. Kami akan mengirim link portal agar kamu bisa mengakses semua produk yang sudah dibeli.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError("");
            if (!email.trim()) {
              setError("Email wajib diisi");
              return;
            }
            requestLink.mutate({ email, creatorSlug });
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
              Email Pembelian
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contoh@email.com"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-cuan-cyan/100 focus:ring-2 focus:ring-cuan-cyan/30 outline-none transition-all text-sm"
              disabled={requestLink.isPending}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={requestLink.isPending}
            className="w-full bg-cuan-cyan hover:bg-007EA5 disabled:bg-slate-300 text-white font-bold py-3 px-6 rounded-xl border-2 border-slate-800 shadow-[3px_3px_0px_0px_#000] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 flex items-center justify-center gap-2"
          >
            {requestLink.isPending ? (
              <>
                <SpinnerIcon className="animate-spin" size={20} />
                Mengirim...
              </>
            ) : (
              <>
                <EnvelopeSimpleIcon size={20} weight="bold" />
                Kirim Link Portal
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-xs text-slate-400">
            Link akan dikirim ke email yang terdaftar sebagai pembeli. Link berlaku selama 24 jam.
          </p>
        </div>
      </div>
    </div>
  );
}

function BottomNav({ activeTab, onTabChange }: { activeTab: TabType; onTabChange: (tab: TabType) => void }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2">
        {TABS.map(({ key, label, icon: Icon }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              className="flex flex-col items-center gap-0.5 px-3 py-1"
            >
              <Icon
                size={22}
                weight={isActive ? "bold" : "regular"}
                className={isActive ? "text-blue-500" : "text-slate-400"}
              />
              <span className={`text-xs ${isActive ? "font-medium text-blue-500" : "text-slate-400"}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PortalFooter() {
  return (
    <div className="text-center py-4 space-y-1.5">
      <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-600">
        <span>BAHASA</span>
        <span className="text-slate-300">|</span>
        <span>ENGLISH</span>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
        <LockIcon size={12} weight="fill" />
        <span className="uppercase font-medium tracking-wide">Powered by CuanIN</span>
      </div>
    </div>
  );
}

export default function CreatorPortalPage() {
  const params = useParams<{ creatorSlug: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("ALL");
  const [search, setSearch] = useState("");

  const urlToken = searchParams.get("token") ?? "";

  const [storedToken, setStoredToken] = useState<string>("");

  useEffect(() => {
    const key = getPortalTokenKey(params.creatorSlug);
    if (urlToken) {
      localStorage.setItem(key, urlToken);
      setStoredToken(urlToken);
    } else {
      const saved = localStorage.getItem(key);
      setStoredToken(saved ?? "");
    }
  }, [urlToken, params.creatorSlug]);

  const token = urlToken || storedToken;

  const { data, isLoading, error } = api.purchases.getCreatorPortal.useQuery(
    { token },
    { enabled: !!token, retry: false }
  );

  const handleLogout = () => {
    const key = getPortalTokenKey(params.creatorSlug);
    localStorage.removeItem(key);
    setStoredToken("");
    router.replace(`/portal/${params.creatorSlug}`);
  };

  const isProductTab = activeTab !== "payment";

  const filteredPurchases = useMemo(() => {
    if (!data?.purchases) return [];

    let filtered = activeTab === "ALL"
      ? data.purchases
      : data.purchases.filter((p: any) => p.product.type === activeTab);

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter((p: any) =>
        p.product.name.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [data?.purchases, search, activeTab]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3">
          <SpinnerIcon className="animate-spin text-cuan-cyan" size={32} />
          <p className="text-slate-500 text-sm">Memuat portal...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return <PortalRequestForm creatorSlug={params.creatorSlug} />;
  }

  const { creator, buyerName, buyerEmail } = data;

  const currentTabInfo = TABS.find((t) => t.key === activeTab);

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-lg mx-auto px-4">
        {/* Header */}
        <div className="py-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-cuan-cyan/20 flex items-center justify-center shrink-0">
                <StorefrontIcon size={20} weight="bold" className="text-cuan-cyan" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-800 leading-tight">
                  {creator.name}
                </h1>
                <p className="text-xs text-slate-500 leading-tight">
                  {buyerName} - {buyerEmail}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-red-300 text-red-500 hover:bg-red-50 hover:border-red-400 transition-colors text-xs font-bold uppercase tracking-wide"
            >
              <SignOutIcon size={14} weight="bold" />
              Logout
            </button>
          </div>

          {/* Search Bar (only for product tabs) */}
          {isProductTab && (
            <div className="mt-3 relative">
              <MagnifyingGlassIcon
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name product..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-cuan-cyan/50 focus:ring-2 focus:ring-cuan-cyan/20 outline-none transition-all text-sm placeholder:text-slate-400"
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-4 py-2">
          {isProductTab ? (
            <>
              {/* Tab Title */}
              <div className="flex items-center gap-2">
                {currentTabInfo && <currentTabInfo.icon size={18} weight="bold" className="text-cuan-cyan" />}
                <h2 className="text-sm font-bold text-slate-700">
                  {currentTabInfo?.label} ({filteredPurchases.length})
                </h2>
              </div>

              {filteredPurchases.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <p className="text-slate-400 text-base font-medium">
                    {search.trim()
                      ? "No products match your search"
                      : "Product Not Available"}
                  </p>
                </div>
              ) : (
                filteredPurchases.map((purchase: any) => {
                  const product = purchase.product;
                  const links = Array.isArray(product.links)
                    ? (product.links as string[]).filter((l) => l && l.trim().length > 0)
                    : [];

                  return (
                    <div
                      key={purchase.id}
                      className="rounded-xl border-2 border-slate-800 bg-white shadow-[4px_4px_0px_0px_#000] overflow-hidden"
                    >
                      {product.image && (
                        <div className="relative w-full aspect-video bg-slate-100">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      )}
                      <div className="p-5 space-y-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {product.contentType && (
                              <span className="inline-block text-xs font-medium bg-cuan-cyan/20 text-007EA5 px-2 py-0.5 rounded-full">
                                {product.contentType}
                              </span>
                            )}
                            <span className="inline-block text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                              {product.type === "DIGITAL_PRODUCT" ? "Digital" : product.type === "WEBINAR" ? "Webinar" : "Kelas"}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-slate-800">{product.name}</h3>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <CalendarCheckIcon size={14} />
                            <span>Dibeli {new Date(purchase.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                          </div>
                        </div>

                        {product.link && (
                          <a
                            href={product.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full text-center bg-cuan-cyan hover:bg-007EA5 text-white font-bold py-2.5 px-6 rounded-xl border-2 border-slate-800 shadow-[3px_3px_0px_0px_#000] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all text-sm"
                          >
                            Masuk ke Produk
                          </a>
                        )}

                        {links.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                              <LinkIcon size={14} weight="bold" className="text-slate-500" />
                              Link Tambahan
                            </p>
                            {links.map((link, index) => (
                              <a
                                key={index}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-cuan-cyan/10 hover:border-cuan-cyan/30 transition-colors"
                              >
                                <p className="text-xs text-007EA5 break-all truncate">{link}</p>
                              </a>
                            ))}
                          </div>
                        )}

                        {product.notes && (
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                              <NoteIcon size={14} weight="bold" className="text-amber-500" />
                              Catatan
                            </p>
                            <p className="text-xs text-slate-600 whitespace-pre-wrap">{product.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </>
          ) : (
            <>
              {/* Payment History */}
              <div className="space-y-3">
                <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <CurrencyCircleDollarIcon size={18} weight="bold" className="text-cuan-cyan" />
                  Riwayat Pembayaran ({data.purchases.length})
                </h2>

                {data.purchases.map((purchase: any) => (
                  <div
                    key={purchase.id}
                    className="rounded-xl border-2 border-slate-800 bg-white shadow-[4px_4px_0px_0px_#000] p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-slate-800">{purchase.product.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {new Date(purchase.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {purchase.status === "completed" ? (
                          <>
                            <CheckCircleIcon size={16} weight="fill" className="text-green-500" />
                            <span className="text-xs font-medium text-green-600">Lunas</span>
                          </>
                        ) : (
                          <>
                            <ClockIcon size={16} className="text-amber-500" />
                            <span className="text-xs font-medium text-amber-600">Pending</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
                      <span className="text-xs text-slate-500">Total Pembayaran</span>
                      <span className="text-sm font-bold text-slate-800">
                        Rp {Number(purchase.amount).toLocaleString("id-ID")}
                      </span>
                    </div>

                    {purchase.status === "completed" && Number(purchase.amount) > 0 && (
                      <button
                        onClick={() => generateInvoicePDF(purchase as any)}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium flex items-center justify-center gap-1.5 transition cursor-pointer text-xs"
                      >
                        <DownloadSimpleIcon size={14} />
                        Download Invoice
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <PortalFooter />
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
