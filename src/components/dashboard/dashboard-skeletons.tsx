export function Shimmer({ className }: { className?: string }) {
    return (
        <div className={`relative overflow-hidden bg-slate-200 ${className ?? ""}`}>
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        </div>
    );
}

export function ChartSkeleton({ height = 300 }: { height?: number }) {
    return (
        <div className="w-full relative rounded-lg overflow-hidden" style={{ height }}>
            <div className="absolute inset-y-0 left-0 w-10 flex flex-col justify-between py-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Shimmer key={i} className="h-2.5 w-7 rounded" />
                ))}
            </div>
            <div className="absolute inset-0 left-12 right-2 top-3 bottom-8">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute left-0 right-0 border-t border-dashed border-slate-200"
                        style={{ top: `${(i / 3) * 100}%` }}
                    />
                ))}
                <div className="absolute inset-0 flex items-end gap-2 px-1">
                    {[55, 75, 40, 85, 60, 45, 70, 50].map((h, i) => (
                        <div key={i} className="flex-1 relative overflow-hidden rounded-t-md bg-slate-200" style={{ height: `${h}%` }}>
                            <div
                                className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent"
                                style={{ animationDelay: `${i * 100}ms` }}
                            />
                        </div>
                    ))}
                </div>
            </div>
            <div className="absolute bottom-0 left-12 right-2 flex justify-between">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Shimmer key={i} className="h-2.5 w-5 rounded" />
                ))}
            </div>
        </div>
    );
}

export function ChartCardSkeleton({ height = 300 }: { height?: number }) {
    return (
        <div className="bg-white rounded-xl border border-slate-800 shadow-[0px_1px_0px_rgba(29,41,61)] p-5 overflow-hidden">
            <div className="flex items-center gap-3 mb-5">
                <Shimmer className="h-4 w-32 rounded" />
                <Shimmer className="h-3 w-16 rounded" />
            </div>
            <div className="w-full relative" style={{ height }}>
                <div className="absolute inset-y-0 left-0 w-10 flex flex-col justify-between py-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Shimmer key={i} className="h-2.5 w-7 rounded" />
                    ))}
                </div>
                <div className="absolute inset-0 left-12 right-2 top-3 bottom-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute left-0 right-0 border-t border-dashed border-slate-200"
                            style={{ top: `${(i / 3) * 100}%` }}
                        />
                    ))}
                    <div className="absolute inset-0 flex items-end gap-2 px-1">
                        {[55, 75, 40, 85, 60, 45, 70, 50].map((h, i) => (
                            <div key={i} className="flex-1 relative overflow-hidden rounded-t-md bg-slate-200" style={{ height: `${h}%` }}>
                                <div
                                    className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent"
                                    style={{ animationDelay: `${i * 100}ms` }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="absolute bottom-0 left-12 right-2 flex justify-between">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Shimmer key={i} className="h-2.5 w-5 rounded" />
                    ))}
                </div>
            </div>
        </div>
    );
}
