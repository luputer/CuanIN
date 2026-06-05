import type { Metadata } from "next";
import { Suspense } from "react";
import { SpinnerIcon } from "@phosphor-icons/react/dist/ssr";
import { PaymentSuccessContent } from "./success-content";

export const metadata: Metadata = {
    title: "Pembayaran Berhasil - CuanIN",
    description: "Terima kasih! Pembayaran Anda telah berhasil dikonfirmasi.",
};

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <SpinnerIcon className="size-8 animate-spin text-cyan-600" />
            </div>
        }>
            <PaymentSuccessContent />
        </Suspense>
    );
}
