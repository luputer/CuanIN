"use client";

import { ArrowLeftIcon } from "@phosphor-icons/react";
import { api } from "~/trpc/react";
import { Skeleton } from "~/components/ui/skeleton";
import { FormGroup, SectionHeader, FormInput, FormTextarea } from "~/components/ui/form-layout";

export function DetailPembeli({ purchaseId, onBack }: { purchaseId: string; onBack: () => void }) {
    const { data: purchase, isLoading } = api.purchases.getDetail.useQuery(
        { purchaseId },
        { enabled: !!purchaseId }
    );

    if (isLoading) {
        return (
            <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-6 animate-pulse">
                {/* Header */}
                <div className="flex items-center gap-2 mb-2">
                    <Skeleton className="h-5 w-5 rounded-md" />
                    <Skeleton className="h-8 w-48 rounded-md" />
                </div>

                <div className="bg-white overflow-hidden">
                    <div className="py-4 sm:py-6 px-0 sm:px-6 space-y-6">
                        {/* Section 1 */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <Skeleton className="h-5 w-32" />
                            </div>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-10 pb-5">
                                        <Skeleton className="h-4 w-40" />
                                        <Skeleton className="flex-1 h-[52px] rounded-lg" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section 2 */}
                        <div className="pt-6">
                            <div className="flex justify-between items-center mb-3">
                                <Skeleton className="h-5 w-32" />
                            </div>
                            <div className="space-y-4">
                                {[1, 2].map((i) => (
                                    <div key={i} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-10 pb-5">
                                        <Skeleton className="h-4 w-40" />
                                        <Skeleton className="flex-1 h-[52px] rounded-lg" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!purchase) {
        return (
            <div className="space-y-6">
                <div className="bg-slate-50">
                    <div className="bg-slate-50 -mx-4 px-4 mb-2">
                        <button
                            onClick={onBack}
                            className="group flex items-center gap-2 text-sm font-regular text-slate-600 hover:text-slate-800 transition-colors w-fit mb-2 cursor-pointer"
                        >
                            <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                            <span className="leading-none">Kembali</span>
                        </button>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-800 p-10 text-center text-slate-500">
                    Data tidak ditemukan.
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 sm:px-6 py-4 sm:py-6">
            {/* Header */}
            <button
                onClick={onBack}
                className="group flex items-center gap-2 text-lg sm:text-xl font-semibold text-slate-800 hover:text-slate-800 transition-colors w-fit mb-2 cursor-pointer"
            >
                <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                <h1 className="">
                    {purchase.buyerName}
                </h1>
            </button>

            <div className="bg-white overflow-hidden">
                <div className="py-4 sm:py-6 px-0 sm:px-6">
                    {/* Informasi User Section */}
                    <SectionHeader title="Informasi User" />


                    <FormGroup label="Nama">
                        <FormInput value={purchase.buyerName} readOnly className="bg-slate-50 cursor-default" />
                    </FormGroup>

                    <FormGroup label="Email">
                        <FormInput value={purchase.buyerEmail} readOnly className="bg-slate-50 cursor-default" />
                    </FormGroup>

                    <FormGroup label="Nomor Hp">
                        <FormInput value={purchase.buyerPhone} readOnly className="bg-slate-50 cursor-default" />
                    </FormGroup>


                    {/* Jawaban Form Section */}
                    <div className="mt-6">
                        <SectionHeader title="Jawaban Form" />
                        {purchase.answers.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {purchase.answers.map((answer) => (
                                    <FormGroup key={answer.id} label={answer.formField.label} align={answer.answer.length > 50 ? "start" : "center"}>
                                        {answer.answer.length > 50 ? (
                                            <FormTextarea value={answer.answer} readOnly className="bg-slate-50 cursor-default min-h-25" />
                                        ) : (
                                            <FormInput value={answer.answer} readOnly className="bg-slate-50 cursor-default" />
                                        )}
                                    </FormGroup>
                                ))}
                            </div>
                        ) : (
                            <p className="pt-4 text-slate-500 text-sm">Tidak ada data form</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DetailPembeli;
