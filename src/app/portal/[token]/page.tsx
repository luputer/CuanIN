"use client";

import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import Image from "next/image";
import {
  SpinnerIcon,
  LinkIcon,
  NoteIcon,
  CalendarCheckIcon,
  StorefrontIcon,
} from "@phosphor-icons/react";

export default function PortalPage() {
  const params = useParams<{ token: string }>();
  const { data: purchase, isLoading, error } = api.purchases.getByPortalToken.useQuery(
    { token: params.token },
    { enabled: !!params.token }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3">
          <SpinnerIcon className="animate-spin text-cyan-600" size={32} />
          <p className="text-slate-500 text-sm">Memuat portal...</p>
        </div>
      </div>
    );
  }

  if (error || !purchase) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-red-500 text-2xl font-bold">!</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800">Portal Tidak Ditemukan</h1>
          <p className="text-slate-500 text-sm">
            Link portal ini tidak valid atau sudah tidak aktif. Silakan cek email kamu untuk link yang benar.
          </p>
        </div>
      </div>
    );
  }

  const product = purchase.product;
  const links = Array.isArray(product.links)
    ? (product.links as string[]).filter((l) => l && l.trim().length > 0)
    : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <StorefrontIcon size={24} weight="bold" className="text-cyan-600" />
          <span className="text-lg font-bold text-slate-800">CuanIN</span>
        </div>

        {/* Product Card */}
        <div className="rounded-xl border-2 border-slate-800 bg-white shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] overflow-hidden">
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
          <div className="p-5 space-y-2">
            {product.contentType && (
              <span className="inline-block text-xs font-medium bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full">
                {product.contentType}
              </span>
            )}
            <h1 className="text-xl font-bold text-slate-800">{product.name}</h1>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <CalendarCheckIcon size={14} />
              <span>Dibeli {new Date(purchase.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
          </div>
        </div>

        {/* Buyer Info */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1">
          <p className="text-xs text-slate-400 font-medium">Pembeli</p>
          <p className="text-sm font-semibold text-slate-800">{purchase.buyerName}</p>
          <p className="text-xs text-slate-500">{purchase.buyerEmail}</p>
        </div>

        {/* Main Link CTA */}
        {product.link && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <LinkIcon size={18} weight="bold" className="text-cyan-600" />
              Akses Produk
            </h2>
            <a
              href={product.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-xl border-2 border-slate-800 shadow-[3px_3px_0px_0px_rgba(30,41,59,1)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all"
            >
              Masuk ke Produk
            </a>
          </div>
        )}

        {/* Additional Links */}
        {links.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <LinkIcon size={18} weight="bold" className="text-slate-500" />
              Link Tambahan
            </h2>
            <div className="space-y-2">
              {links.map((link, index) => (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 rounded-lg bg-slate-50 border border-slate-200 hover:bg-cyan-50 hover:border-cyan-200 transition-colors"
                >
                  <p className="text-xs text-slate-400 font-medium">Link {index + 1}</p>
                  <p className="text-sm text-cyan-700 break-all truncate">{link}</p>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {product.notes && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <NoteIcon size={18} weight="bold" className="text-amber-500" />
              Catatan
            </h2>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{product.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-400">
            Portal ini hanya untuk pembeli yang sah. Jangan bagikan link ini.
          </p>
        </div>
      </div>
    </div>
  );
}
