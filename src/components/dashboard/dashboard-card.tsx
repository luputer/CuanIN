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
            className={`${bgColor ?? "bg-white"} gap-1 rounded-xl border border-slate-800 shadow-[0px_1px_0px_#000] p-5 flex flex-col transition-all hover:translate-y-px hover:shadow-none`}
        >
            {/* TOP ROW: ICON & ARROW */}
            <div className="flex justify-between items-start mb-3">
                <div className={`text-3xl ${iconColor}`}>
                    {icon}
                </div>
                {showArrow && (
                    <div className="flex items-center justify-center p-2 rounded-lg border border-slate-800 bg-cuan-cyan/20 text-slate-800 cursor-pointer hover:bg-cyan-200 active:translate-y-px active:shadow-none transition-all">
                        <ArrowUpRightIcon size={16} weight="bold" />
                    </div>
                )}
            </div>

            {/* TITLE & VALUE */}
            <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-slate-800">{title}</p>
                <h2 className="text-2xl font-semibold text-cuan-blue">{value}</h2>
            </div>

            {/* INFO */}
            <div className="mt-2 flex items-center justify-between font-medium text-xs text-slate-700">
                30 hari terakhir
                {change !== undefined && (
                    <span
                        className={`px-3 py-1 rounded-md text-sm font-medium border border-slate-800 ${isPositive
                            ? "bg-green-200 text-slate-800"
                            : "bg-red-100 text-slate-800"
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

export function DashboardCardSkeleton({ bgColor }: { bgColor?: string }) {
    return (
        <div className={`${bgColor ?? "bg-white"} gap-1 rounded-xl border border-slate-800 shadow-[0px_1px_0px_#000] p-5 flex flex-col animate-pulse`}>
            <div className="flex justify-between items-start mb-3">
                <div className="size-8 rounded-lg bg-slate-200" />
            </div>
            <div className="flex flex-col gap-1">
                <div className="h-4 w-28 bg-slate-200 rounded" />
                <div className="h-8 w-36 bg-slate-200 rounded" />
            </div>
            <div className="mt-2 flex items-center justify-between">
                <div className="h-4 w-24 bg-slate-200 rounded" />
                <div className="h-7 w-16 bg-slate-200 rounded-md border border-slate-300" />
            </div>
        </div>
    );
}
