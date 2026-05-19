import { Skeleton } from "~/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="w-full max-w-7xl mx-auto animate-pulse space-y-6">
            {/* Header */}
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
                            {[1, 2, 3].map((i) => (
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
