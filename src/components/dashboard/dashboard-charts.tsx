"use client";

import {
    XAxis,
    YAxis,
    CartesianGrid,
    BarChart,
    Bar,
    AreaChart,
    Area,
    Cell,
} from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "~/components/ui/chart";

// ─── Constants & Utilities ───────────────────────────────────────────────────

export const CHART_COLORS = ["#506CBF", "#00B3E9"];

export function formatRupiah(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

// ─── Types ───────────────────────────────────────────────────────────────────

type DayValue = { day: string; value: number };
type NameTotal = { name: string; total: number };
type WeekTotal = { week: string; total: number };

// ─── Chart Components ─────────────────────────────────────────────────────────

/**
 * AreaChart untuk pendapatan mingguan.
 */
export function WeeklyRevenueChart({ data }: { data: DayValue[] }) {
    const config = {
        value: {
            label: "Pendapatan",
            color: "#506CBF",
        },
    } satisfies ChartConfig;

    return (
        <ChartContainer config={config} className="h-[300px] w-full">
            <AreaChart data={data}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
                <XAxis
                    dataKey="day"
                    tick={{ fill: "#0f172a", fontSize: 12, fontWeight: 500 }}
                    tickMargin={12}
                    axisLine={{ stroke: "#0f172a", strokeWidth: 2 }}
                />
                <YAxis
                    tick={{ fill: "#506CBF", fontSize: 12, fontWeight: 700 }}
                    tickMargin={12}
                    width={60}
                    axisLine={{ stroke: "#0f172a", strokeWidth: 2 }}
                    tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                />
                <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                <Area
                    type="monotone"
                    dataKey="value"
                    stroke="none"
                    fill="#506CBF"
                    fillOpacity={0.5}
                    dot={{ r: 5, fill: "#506CBF", stroke: "none", fillOpacity: 1 }}
                    activeDot={{ r: 7, fill: "#506CBF", stroke: "none", fillOpacity: 1 }}
                />
            </AreaChart>
        </ChartContainer>
    );
}

/**
 * BarChart untuk total produk per kategori.
 */
export function CategoryBarChart({ data }: { data: NameTotal[] }) {
    const config = {
        total: {
            label: "Produk",
            color: "#00B3E9",
        },
    } satisfies ChartConfig;

    return (
        <ChartContainer config={config} className="h-[300px] w-full">
            <BarChart data={data} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
                <XAxis
                    dataKey="name"
                    tick={{ fill: "#0f172a", fontSize: 12, fontWeight: 500 }}
                    tickMargin={12}
                    axisLine={{ stroke: "#0f172a", strokeWidth: 2 }}
                />
                <YAxis
                    tick={{ fill: "#506CBF", fontSize: 12, fontWeight: 700 }}
                    tickMargin={12}
                    width={50}
                    axisLine={{ stroke: "#0f172a", strokeWidth: 2 }}
                />
                <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={60} fillOpacity={0.5}>
                    {data.map((_, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                            fillOpacity={0.5}
                        />
                    ))}
                </Bar>
            </BarChart>
        </ChartContainer>
    );
}

/**
 * AreaChart untuk traffic website (pengunjung harian).
 */
export function TrafficAreaChart({ data }: { data: DayValue[] }) {
    const config = {
        value: {
            label: "Pengunjung",
            color: "#00B3E9",
        },
    } satisfies ChartConfig;

    return (
        <ChartContainer config={config} className="h-[300px] w-full">
            <AreaChart data={data}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
                <XAxis
                    dataKey="day"
                    tick={{ fill: "#0f172a", fontSize: 12, fontWeight: 500 }}
                    tickMargin={12}
                    axisLine={{ stroke: "#0f172a", strokeWidth: 2 }}
                />
                <YAxis
                    tick={{ fill: "#506CBF", fontSize: 12, fontWeight: 700 }}
                    tickMargin={12}
                    width={40}
                    axisLine={{ stroke: "#0f172a", strokeWidth: 2 }}
                />
                <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                <Area
                    type="monotone"
                    dataKey="value"
                    stroke="none"
                    fill="#00B3E9"
                    fillOpacity={0.5}
                    dot={{ r: 5, fill: "#00B3E9", stroke: "none", fillOpacity: 1 }}
                    activeDot={{ r: 7, fill: "#00B3E9", stroke: "none", fillOpacity: 1 }}
                />
            </AreaChart>
        </ChartContainer>
    );
}

/**
 * BarChart mingguan.
 */
export function WeeklyBarChart({
    data,
    tooltipLabel,
}: {
    data: WeekTotal[];
    tooltipLabel: string;
}) {
    const config = {
        total: {
            label: tooltipLabel,
            color: "#506CBF",
        },
    } satisfies ChartConfig;

    return (
        <ChartContainer config={config} className="h-[300px] w-full">
            <BarChart data={data} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
                <XAxis
                    dataKey="week"
                    tick={{ fill: "#0f172a", fontSize: 12, fontWeight: 500 }}
                    tickMargin={12}
                    axisLine={{ stroke: "#0f172a", strokeWidth: 2 }}
                />
                <YAxis
                    tick={{ fill: "#506CBF", fontSize: 12, fontWeight: 700 }}
                    tickMargin={12}
                    width={40}
                    axisLine={{ stroke: "#0f172a", strokeWidth: 2 }}
                />
                <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={60} fillOpacity={0.5}>
                    {data.map((_, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                            fillOpacity={0.5}
                        />
                    ))}
                </Bar>
            </BarChart>
        </ChartContainer>
    );
}

