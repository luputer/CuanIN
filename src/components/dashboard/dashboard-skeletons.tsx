export function ChartSkeleton({ height = 300 }: { height?: number }) {
    return (
        <div
            className="w-full bg-slate-100 rounded-lg animate-pulse"
            style={{ height }}
        />
    );
}

export function ChartCardSkeleton({ height = 300 }: { height?: number }) {
    return (
        <div className="bg-white rounded-xl border border-slate-800 shadow-[0px_1px_0px_rgba(29,41,61)] p-4 overflow-hidden animate-pulse">
            <div className="h-5 w-40 bg-slate-200 rounded mb-6 ml-2 mt-2" />
            <div
                className="w-full bg-slate-100 rounded-lg"
                style={{ height }}
            />
        </div>
    );
}
