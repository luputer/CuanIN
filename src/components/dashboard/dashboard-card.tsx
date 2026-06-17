import { ArrowUpRightIcon } from "@phosphor-icons/react";

export type DashboardCardProps = {
    title: string;
    value: string;
    icon: React.ReactNode;
    iconColor?: string;
    bgColor?: string;
    showArrow?: boolean;
    change?: number | null;
};

export function DashboardCard({
    title,
    value,
    icon,
    iconColor,
    bgColor,
    showArrow,
    change,
}: DashboardCardProps) {
    const isPositive = change === null || (change ?? 0) >= 0;

    return (
        <div
            className={`${bgColor ?? "bg-white"} gap-1 rounded-xl border border-slate-800 shadow-[0px_1px_0px_rgba(29,41,61)] p-4 flex flex-col transition-transform hover:scale-101`}
        >
            {/* TOP ROW: ICON & ARROW */}
            <div className="flex justify-between items-start mb-3">
                <div className={`rounded-full text-2xl ${iconColor}`}>
                    {icon}
                </div>
                {showArrow && (
                    <div className="flex items-center justify-center p-1.5 rounded-full bg-cyan-600 text-white cursor-pointer">
                        <ArrowUpRightIcon size={14} weight="bold" />
                    </div>
                )}
            </div>

            {/* TITLE & VALUE */}
            <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-slate-800">{title}</p>
                <h2 className="text-lg font-semibold text-cyan-600">{value}</h2>
            </div>

            {/* INFO */}
            <div className="mt-1 flex items-center justify-between font-regular text-xs text-slate-600">
                <span>30 hari terakhir</span>
                {change !== undefined && (
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-regular ${isPositive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                    >
                        {change === null
                            ? "Baru"
                            : `${isPositive ? "+" : ""}${Math.max(-100, Math.min(100, change)).toFixed(1)}%`}
                    </span>
                )}
            </div>
        </div>
    );
}

export function DashboardCardSkeleton() {
    return (
        <div className="bg-white gap-1 rounded-xl border border-slate-800 shadow-[0px_1px_0px_rgba(29,41,61)] p-4 flex flex-col animate-pulse">
            <div className="flex justify-between items-start mb-3">
                <div className="size-8 rounded-full bg-slate-200" />
            </div>
            <div className="flex flex-col gap-2">
                <div className="h-3 w-24 bg-slate-200 rounded" />
                <div className="h-5 w-32 bg-slate-200 rounded" />
            </div>
            <div className="mt-1 flex items-center justify-between">
                <div className="h-3 w-20 bg-slate-200 rounded" />
                <div className="h-5 w-12 bg-slate-200 rounded-full" />
            </div>
        </div>
    );
}
