import type { Metadata } from "next";
import { Suspense } from "react";
import { SpinnerIcon } from "@phosphor-icons/react/dist/ssr";
import { PaymentFailedContent } from "./failed-content";

export const metadata: Metadata = {
    title: "Pembayaran Gagal - CuanIN",
    description: "Transaksi tidak dapat diproses. Silakan coba lagi atau hubungi kami.",
};

export default function PaymentFailedPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <SpinnerIcon className="size-8 animate-spin text-cyan-600" />
            </div>
        }>
            <PaymentFailedContent />
        </Suspense>
    );
}
