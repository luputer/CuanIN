"use client";

import { Skeleton } from "~/components/ui/skeleton";

/**
 * Skeleton loading state for Admin product detail pages.
 * Used in admin/produk/[id] and admin/kreator/[id]/produk/[productId].
 */
export const AdminDetailSkeleton = () => (
    <div className="w-full max-w-7xl mx-auto animate-pulse">
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="bg-slate-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:sticky sm:top-[74px] bg-slate-50 z-40 -mx-6 px-6 pt-2 pb-0">
                    <div className="flex-1 flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 mb-2">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-7 w-64 rounded-md" />
                            <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <Skeleton className="h-10 w-[180px] rounded-lg" />
                    </div>
                </div>
            </div>

            {/* Content card Skeleton */}
            <div className="rounded-xl border border-slate-800 overflow-hidden bg-white">
                <div className="flex-1 min-w-0 bg-white rounded-xl px-4 py-6 sm:px-8 sm:py-8">
                    <Skeleton className="h-6 w-48 mb-6" />

                    <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start pt-6">
                        {/* Left detail fields */}
                        <div className="flex-1 min-w-0 w-full space-y-5">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="flex flex-col gap-1.5">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-[46px] w-full rounded-lg" />
                                </div>
                            ))}
                        </div>

                        {/* Right Sidebar */}
                        <div className="shrink-0 w-full lg:w-[400px] space-y-6">
                            {/* Thumbnail Skeleton */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <Skeleton className="h-4 w-24 mb-3" />
                                <Skeleton className="w-full aspect-square rounded-xl" />
                            </div>

                            {/* Status Skeleton */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                                <div className="space-y-1.5">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-[46px] w-full rounded-lg" />
                                </div>
                                <div className="space-y-1.5">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-[46px] w-full rounded-lg" />
                                </div>
                                <div className="pt-4 border-t border-slate-200 flex justify-end">
                                    <Skeleton className="h-6 w-16 rounded-lg" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

/**
 * Skeleton loading state for Admin profile page.
 */
export const AdminProfileSkeleton = () => (
    <div className="w-full max-w-7xl mx-auto animate-pulse">
        <div className="space-y-6">
            <div className="bg-slate-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:sticky sm:top-[74px] bg-slate-50 z-40 -mx-6 px-6 pt-2 pb-0">
                    <div className="flex-1 flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 mb-2">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-36" />
                        </div>
                        <Skeleton className="h-7 w-56 rounded-md" />
                    </div>
                </div>
            </div>

            <div className="flex-1 rounded-xl border border-slate-800 overflow-hidden bg-white">
                <div className="px-4 py-6 sm:px-8 sm:py-8">
                    <Skeleton className="h-6 w-40 mb-8" />
                    <div className="space-y-5">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex flex-col gap-1.5">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-[46px] w-full rounded-lg" />
                            </div>
                        ))}
                    </div>
                    <div className="mt-8">
                        <Skeleton className="h-6 w-32 mb-6" />
                        <div className="flex flex-col gap-1.5">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-[46px] w-full rounded-lg" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

/**
 * Skeleton loading state for Creator profile page.
 */
export const CreatorProfileSkeleton = () => (
    <div className="w-full max-w-7xl mx-auto animate-pulse">
        <div className="space-y-6">
            <div className="bg-slate-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:sticky sm:top-[74px] bg-slate-50 z-40 -mx-6 px-6 pt-2 pb-0">
                    <div className="flex-1 flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 mb-2">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-36" />
                        </div>
                        <Skeleton className="h-7 w-56 rounded-md" />
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <Skeleton className="h-10 w-40 rounded-lg" />
                    </div>
                </div>
            </div>

            <div className="flex-1 rounded-xl border border-slate-800 overflow-hidden bg-white">
                <div className="px-4 py-6 sm:px-8 sm:py-8">
                    <Skeleton className="h-6 w-40 mb-8" />
                    <div className="space-y-5">
                        <div className="flex flex-col gap-1.5">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-24 w-24 rounded-full" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="w-full aspect-[8/1] rounded-xl" />
                        </div>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex flex-col gap-1.5">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-[46px] w-full rounded-lg" />
                            </div>
                        ))}
                        <div className="flex flex-col gap-1.5">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-24 w-full rounded-lg" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

/**
 * Skeleton loading state for Admin kreator detail page.
 */
export const AdminCreatorDetailSkeleton = () => (
    <div className="w-full max-w-7xl mx-auto animate-pulse">
        <div className="space-y-6">
            <div className="bg-slate-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:sticky sm:top-[74px] bg-slate-50 z-40 -mx-6 px-6 pt-2 pb-0">
                    <div className="flex-1 flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 mb-2">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-36" />
                        </div>
                        <Skeleton className="h-7 w-56 rounded-md" />
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <Skeleton className="h-10 w-36 rounded-lg" />
                        <Skeleton className="h-10 w-40 rounded-lg" />
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start">
                <div className="flex-1 rounded-xl border border-slate-800 overflow-hidden bg-white w-full">
                    <div className="px-4 py-6 sm:px-8 sm:py-8">
                        <Skeleton className="h-6 w-40 mb-8" />
                        <div className="space-y-5">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex flex-col gap-1.5">
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-[46px] w-full rounded-lg" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="w-full lg:w-80 shrink-0 space-y-4">
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-800 space-y-4">
                        <Skeleton className="h-5 w-24" />
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-[76px] w-full rounded-2xl" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

/**
 * Skeleton loading state for Creator product detail/edit pages.
 * Used in kelas/[id], produk-digital/[id], webinar/[id].
 */
export const CreatorDetailSkeleton = () => (
    <div className="w-full max-w-7xl mx-auto animate-pulse">
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="bg-slate-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 -mx-6 px-6 pt-2 pb-0">
                    <div className="flex-1 flex flex-col gap-1.5">
                        {/* Back link */}
                        <div className="flex items-center gap-2 mb-2">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                        {/* Title and Badge */}
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-7 w-64 rounded-md" />
                            <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Skeleton className="h-10 w-36 rounded-lg" />
                        <Skeleton className="h-10 w-10 rounded-lg" />
                    </div>
                </div>
            </div>

            {/* Tabs / Card */}
            <div className="rounded-xl border border-slate-800 overflow-hidden bg-white">
                {/* Tab Headers */}
                <div className="flex border-b border-slate-800 bg-[#f9fafb] h-[52px] items-center px-4 gap-6">
                    <Skeleton className="h-6 w-24 rounded" />
                    <Skeleton className="h-6 w-24 rounded" />
                    <Skeleton className="h-6 w-24 rounded" />
                </div>
                {/* Tab Content Skeleton */}
                <div className="px-4 py-6 sm:px-8 sm:py-8 space-y-6">
                    <div className="flex justify-between items-center mb-3">
                        <Skeleton className="h-6 w-48" />
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start pt-6">
                        {/* Left Form Area */}
                        <div className="flex-1 min-w-0 space-y-6 w-full">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-[52px] w-full rounded-lg" />
                                </div>
                            ))}
                        </div>
                        {/* Right Sidebar */}
                        <div className="shrink-0 w-full lg:w-[400px] space-y-6">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-[200px] w-full rounded-lg" />
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-[52px] w-full rounded-lg" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
