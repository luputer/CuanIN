"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftIcon, CopyIcon, ShareNetworkIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { useEffect, useState } from "react";

// ─── Social Icon SVGs ─────────────────────────────────────────────────────────

const WhatsappIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.058 5.348 5.4 0 12.008 0c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.347 12.006-11.957 12.006-.003 0-.005 0-.008 0-2.005-.001-3.978-.502-5.733-1.45L0 24zM5.889 19.538c1.678.995 3.335 1.523 5.305 1.524 5.358 0 9.713-4.321 9.716-9.63.001-2.574-1.002-4.997-2.825-6.82S13.9 1.83 11.328 1.83c-5.362 0-9.717 4.317-9.72 9.629-.002 1.892.487 3.739 1.471 5.314l-.997 3.64 3.742-.975zm11.367-4.82c-.08-.13-.294-.21-.617-.37-.324-.16-1.917-.94-2.21-1.05-.294-.11-.507-.16-.72.16-.214.32-.83.105-1.017.32-.188.21-.375.24-.7.08-.324-.16-1.365-.5-2.602-1.6-1-.89-1.676-2-1.87-2.32-.196-.32-.02-.49.14-.65.147-.14.324-.37.487-.56.16-.19.214-.32.324-.54.11-.21.05-.4-.03-.56-.08-.16-.72-1.73-.986-2.37-.26-.63-.524-.55-.72-.56-.188-.01-.403-.01-.617-.01-.214 0-.56.08-.854.4-.294.32-1.123 1.1-1.123 2.68 0 1.58 1.15 3.11 1.31 3.33.16.21 2.26 3.45 5.48 4.84.76.33 1.36.53 1.82.68.77.24 1.47.21 2.03.12.62-.09 1.917-.78 2.19-1.54.27-.76.27-1.41.19-1.54z" />
  </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.173.054 1.808.256 2.232.422.565.22.969.48 1.391.902.422.422.682.826.902 1.391.166.424.368 1.059.422 2.232.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.173-.256 1.808-.422 2.232-.22.565-.48.969-.902 1.391-.422.422-.826.682-1.391.902-.424.166-1.059.368-2.232.422-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.173-.054-1.808-.256-2.232-.422-.565-.22-.969-.48-1.391-.902-.422-.422-.682-.826-.902-1.391-.166-.424-.368-1.059-.422-2.232-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.054-1.173.256-1.808.422-2.232.22-.565.48-.969.902-1.391.422-.422.826-.682 1.391-.902.424-.166 1.059-.368 2.232-.422 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-1.277.058-2.15.258-2.913.556-.788.305-1.455.714-2.122 1.381s-1.076 1.334-1.381 2.122c-.298.763-.498 1.636-.556 2.913-.058 1.28-.072 1.688-.072 4.947s.014 3.667.072 4.947c.058 1.277.258 2.15.556 2.913.305.788.714 1.455 1.381 2.122s1.334 1.076 2.122 1.381c.763.298 1.636.498 2.913.556 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.277-.058 2.15-.258 2.913-.556.788-.305 1.455-.714 2.122-1.381s1.076-1.334 1.381-2.122c.298-.763.498-1.636.556-2.913.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.058-1.277-.258-2.15-.556-2.913-.305-.788-.714-1.455-1.381-2.122s-1.334-1.076-2.122-1.381c-.763-.298-1.636-.498-2.913-.556-1.28-.058-1.688-.072-4.947-.072zM12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.441s.645 1.441 1.441 1.441 1.441-.645 1.441-1.441-.645-1.441-1.441-1.441z" />
  </svg>
);

// ─── Props ───────────────────────────────────────────────────────────────────

interface CatalogNavHeaderProps {
  /** URL tujuan tombol back (kiri). Jika tidak diisi, tombol back tidak akan muncul */
  backHref?: string;
  /** Judul & deskripsi produk untuk share (opsional — jika tidak disediakan, tombol share tidak tampil) */
  shareData?: {
    title: string;
    text?: string;
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CatalogNavHeader({ backHref, shareData }: CatalogNavHeaderProps) {
  const router = useRouter();
  const [shareUrl, setShareUrl] = useState("");
  const [navigatorShareSupported, setNavigatorShareSupported] = useState(false);

  useEffect(() => {
    setShareUrl(window.location.href);
    setNavigatorShareSupported(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link produk berhasil disalin!");
    } catch {
      toast.error("Gagal menyalin link");
    }
  };

  const handleNativeShare = async () => {
    if (!shareData) return;
    try {
      await navigator.share({
        title: shareData.title,
        text: shareData.text ?? "",
        url: shareUrl,
      });
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        await handleCopyLink();
      }
    }
  };

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <div className="sticky top-0 z-10 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Back button — selalu muncul, fallback ke history.back() */}
        <button
          onClick={handleBack}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeftIcon className="h-5 w-5 text-slate-600" />
        </button>

        {/* Share button — hanya tampil jika shareData disediakan */}
        {shareData && (
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 hover:bg-slate-100 cursor-pointer transition-all duration-200">
                <ShareNetworkIcon className="h-5 w-5 text-slate-600" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-80 p-4 rounded-xl border border-slate-200 bg-white shadow-xl"
              align="end"
            >
              <div className="flex flex-col gap-4">
                <h4 className="text-sm font-semibold text-slate-800">Bagikan Produk</h4>

                {/* Social share buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareData.title + " - " + shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg border border-slate-100 hover:bg-emerald-50 hover:border-emerald-200 group transition-all duration-200 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 transition-all duration-200 group-hover:scale-110">
                      <WhatsappIcon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-600 group-hover:text-emerald-700">
                      WhatsApp
                    </span>
                  </a>

                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg border border-slate-100 hover:bg-blue-50 hover:border-blue-200 group transition-all duration-200 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 transition-all duration-200 group-hover:scale-110">
                      <FacebookIcon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-600 group-hover:text-blue-700">
                      Facebook
                    </span>
                  </a>

                  <a
                    href={`https://www.instagram.com/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg border border-slate-100 hover:bg-pink-50 hover:border-pink-200 group transition-all duration-200 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 transition-all duration-200 group-hover:scale-110">
                      <InstagramIcon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-600 group-hover:text-pink-700">
                      Instagram
                    </span>
                  </a>
                </div>

                <div className="h-px bg-slate-100" />

                {/* Link copy */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Tautan Produk
                  </span>
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1.5">
                    <span className="flex-1 truncate text-xs text-slate-600 px-1 font-mono">
                      {shareUrl}
                    </span>
                    <button
                      onClick={handleCopyLink}
                      className="flex h-7 px-3 items-center justify-center gap-1 rounded-md bg-cuan-cyan hover:bg-007EA5 text-white font-medium text-[11px] cursor-pointer shadow-sm active:translate-y-[1px] transition-all shrink-0"
                    >
                      <CopyIcon className="w-3.5 h-3.5" weight="bold" />
                      <span>Salin</span>
                    </button>
                  </div>
                </div>

                {/* Native share (mobile) */}
                {navigatorShareSupported && (
                  <button
                    onClick={handleNativeShare}
                    className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 py-2 text-xs font-semibold text-slate-700 cursor-pointer transition-all duration-200"
                  >
                    <ShareNetworkIcon className="w-4 h-4 text-slate-500" />
                    <span>Metode Berbagi Lainnya</span>
                  </button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function CatalogNavHeaderSkeleton({ withShare = false }: { withShare?: boolean }) {
  return (
    <div className="sticky top-0 z-10 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
        {withShare && (
          <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
        )}
      </div>
    </div>
  );
}
