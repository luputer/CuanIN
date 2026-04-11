// Next.js uses loading.tsx (or loding.tsx as named here) as the Suspense fallback
// for the route segment. This skeleton mirrors the layout of dashboard/page.tsx.

export default function Loading() {
    return (
        <div className="animate-pulse">
            {/* Page title */}
            <div className="h-7 w-40 bg-indigo-100 rounded-lg mb-2" />
            <div className="h-4 w-80 bg-slate-100 rounded mb-6" />

            {/* TOP CARDS — 4 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="bg-white rounded-xl border border-indigo-950/10 shadow-sm p-4 flex flex-col gap-3"
                    >
                        {/* icon placeholder */}
                        <div className="w-8 h-8 rounded-full bg-slate-200" />
                        {/* title */}
                        <div className="h-3 w-24 bg-slate-200 rounded" />
                        {/* value */}
                        <div className="h-5 w-32 bg-indigo-100 rounded" />
                        {/* footer */}
                        <div className="flex justify-between mt-1">
                            <div className="h-3 w-20 bg-slate-100 rounded" />
                            <div className="h-5 w-10 bg-green-100 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>

            {/* CHART ROW 1 — 2/3 + 1/3 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
                {/* Area chart placeholder */}
                <div className="col-span-2 bg-white rounded-xl border border-indigo-950/10 shadow-sm p-4">
                    <div className="h-5 w-48 bg-slate-200 rounded mb-6" />
                    <div className="h-[300px] bg-slate-100 rounded-lg" />
                </div>
                {/* Bar chart placeholder */}
                <div className="col-span-1 bg-white rounded-xl border border-indigo-950/10 shadow-sm p-4">
                    <div className="h-5 w-36 bg-slate-200 rounded mb-6" />
                    <div className="h-[300px] bg-slate-100 rounded-lg" />
                </div>
            </div>

            {/* CHART ROW 2 — 3/5 + 2/5 */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
                {/* Traffic chart */}
                <div className="col-span-3 bg-white rounded-xl border border-indigo-950/10 shadow-sm p-4">
                    <div className="h-5 w-40 bg-slate-200 rounded mb-6" />
                    <div className="h-[300px] bg-slate-100 rounded-lg" />
                </div>
                {/* Buyer chart */}
                <div className="col-span-2 bg-white rounded-xl border border-indigo-950/10 shadow-sm p-4">
                    <div className="h-5 w-36 bg-slate-200 rounded mb-6" />
                    <div className="h-[300px] bg-slate-100 rounded-lg" />
                </div>
            </div>
        </div>
    );
}
