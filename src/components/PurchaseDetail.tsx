"use client";

import { ArrowLeft } from "lucide-react";
import { api } from "~/trpc/react";
import { Skeleton } from "~/components/ui/skeleton";

export default function PurchaseDetail({ purchaseId, onBack }: { purchaseId: string; onBack: () => void }) {
    const { data: purchase, isLoading } = api.purchases.getDetail.useQuery(
        { purchaseId },
        { enabled: !!purchaseId }
    );

    if (isLoading) {
        return (
            <div className="bg-[#f0f9fa] p-4 md:p-6 rounded-b-xl border border-slate-200 animate-pulse">
                {/* Back button skeleton */}
                <Skeleton className="h-6 w-32 mb-6" />

                <div className="space-y-8">
                    <section>
                        <Skeleton className="h-6 w-32 mb-2" />
                        <div className="h-[2px] bg-[#00B4D8] opacity-20 w-full mb-6"></div>

                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                    <Skeleton className="h-5 w-24 md:w-32" />
                                    <Skeleton className="flex-1 h-[46px] rounded-lg" />
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        );
    }

    if (!purchase) {
        return (
            <div className="bg-[#f0f9fa] cursor-pointer p-4 md:p-6 rounded-b-xl border border-slate-200">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-[#00B4D8] font-semibold text-[16px] mb-6 hover:text-[#009bc2] transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Kembali
                </button>
                <p className="text-center text-slate-500">Data tidak ditemukan.</p>
            </div>
        );
    }

    return (
        <div className="bg-[#f0f9fa] p-4 md:p-6 rounded-b-xl border border-slate-200">
            <button
                onClick={onBack}
                className="flex items-center gap-2 cursor-pointer text-[#00B4D8] font-semibold text-[16px] mb-6 hover:text-[#009bc2] transition-colors"
                title="Kembali"
            >
                <ArrowLeft className="w-5 h-5" />
                {purchase.buyerName}
            </button>

            <div className="space-y-8">
                {/* Informasi User Section */}
                <section>
                    <h3 className="text-[17px] font-bold text-slate-700 mb-2">Informasi User</h3>
                    <div className="h-[2px] bg-[#00B4D8] w-full mb-6"></div>

                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                            <span className="text-[15px] font-bold text-slate-700 md:w-32">Nama</span>
                            <div className="flex-1 bg-white border border-slate-200 rounded-lg p-3 text-[15px] text-slate-600 font-medium">
                                {purchase.buyerName}
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                            <span className="text-[15px] font-bold text-slate-700 md:w-32">Email</span>
                            <div className="flex-1 bg-white border border-slate-200 rounded-lg p-3 text-[15px] text-slate-600 font-medium">
                                {purchase.buyerEmail}
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                            <span className="text-[15px] font-bold text-slate-700 md:w-32">Nomor Hp</span>
                            <div className="flex-1 bg-white border border-slate-200 rounded-lg p-3 text-[15px] text-slate-600 font-medium">
                                {purchase.buyerPhone}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Jawaban Form Section */}
                {purchase.answers.length > 0 && (
                    <section>
                        <h3 className="text-[17px] font-bold text-slate-700 mb-2">Jawaban Form</h3>
                        <div className="h-[2px] bg-[#00B4D8] w-full mb-6"></div>

                        <div className="space-y-4">
                            {purchase.answers.map((answer) => (
                                <div key={answer.id} className="space-y-2">
                                    <span className="text-[15px] font-bold text-slate-700 block">
                                        {answer.formField.label}
                                    </span>
                                    <div className="w-full bg-white border border-slate-200 rounded-lg p-3 text-[15px] text-slate-600 font-medium min-h-[46px]">
                                        {answer.answer}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

