"use client";

import { ArrowLeft } from "lucide-react";
import { api } from "~/trpc/react";
import { Skeleton } from "~/components/ui/skeleton";

export function DetailPembeli({ purchaseId, onBack }: { purchaseId: string; onBack: () => void }) {
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
            <div className="bg-white p-6 border-x border-b border-slate-800 rounded-b-xl">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-500 font-semibold text-[16px] mb-6 hover:text-slate-800 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Kembali
                </button>
                <p className="text-center text-slate-500 py-10">Data tidak ditemukan.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 md:p-8 border-x border-b border-slate-800 rounded-b-xl">
            {/* Header / Back Button */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 cursor-pointer text-slate-800 font-bold text-lg mb-8 hover:opacity-70 transition-opacity"
                title="Kembali"
            >
                <ArrowLeft className="w-5 h-5" />
                {purchase.buyerName}
            </button>

            <div className="space-y-10">
                {/* Informasi User Section */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-[16px] font-bold text-slate-800 uppercase tracking-tight">Informasi User</h3>
                        <div className="h-[1px] bg-slate-800 flex-1 opacity-20"></div>
                    </div>

                    <div className="grid gap-5">
                        {[
                            { label: "Nama", value: purchase.buyerName },
                            { label: "Email", value: purchase.buyerEmail },
                            { label: "Nomor Hp", value: purchase.buyerPhone },
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                                <span className="text-sm font-bold text-slate-500 md:w-40 uppercase tracking-wider">
                                    {item.label}
                                </span>
                                <div className="flex-1 bg-slate-50 border border-slate-800 rounded-lg p-3.5 text-[15px] text-slate-800 font-semibold shadow-[2px_2px_0px_0px_rgba(30,41,59,1)]">
                                    {item.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Jawaban Form Section */}
                {purchase.answers.length > 0 && (
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <h3 className="text-[16px] font-bold text-slate-800 uppercase tracking-tight">Jawaban Form</h3>
                            <div className="h-[1px] bg-slate-800 flex-1 opacity-20"></div>
                        </div>

                        <div className="grid gap-6">
                            {purchase.answers.map((answer) => (
                                <div key={answer.id} className="space-y-2">
                                    <label className="text-sm font-bold text-slate-500 block uppercase tracking-wider">
                                        {answer.formField.label}
                                    </label>
                                    <div className="w-full bg-slate-50 border border-slate-800 rounded-lg p-3.5 text-[15px] text-slate-800 font-semibold min-h-[48px] shadow-[2px_2px_0px_0px_rgba(30,41,59,1)]">
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

export default DetailPembeli;