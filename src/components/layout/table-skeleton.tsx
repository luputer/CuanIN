import { Skeleton } from "~/components/ui/skeleton";

export function TableSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-80" />
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <Skeleton className="h-10 w-full md:w-96 rounded-lg" />
                <div className="flex gap-3">
                    <Skeleton className="h-10 w-32 rounded-lg" />
                    <Skeleton className="h-10 w-40 rounded-lg" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="h-12 bg-slate-50 border-b border-slate-100 flex items-center px-6 gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <div className="divide-y divide-slate-100">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="p-6 flex items-center gap-4">
                            <Skeleton className="h-4 flex-1" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                            <Skeleton className="h-8 w-24" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
