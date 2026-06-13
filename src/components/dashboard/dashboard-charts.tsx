"use client";

import {
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    BarChart,
    Bar,
    ResponsiveContainer,
    AreaChart,
    Area,
    Cell,
} from "recharts";

// ─── Constants & Utilities ───────────────────────────────────────────────────

export const CHART_COLORS = ["#FFF085", "#FFB86A"];

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
 * XAxis: "day", YAxis: nilai dalam ribuan (k), dataKey: "value"
 */
export function WeeklyRevenueChart({ data }: { data: DayValue[] }) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FDC700" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#ffffffff" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#A2F4FD" />
                <XAxis
                    dataKey="day"
                    tick={{ fill: "#0f172a", fontSize: 12, fontWeight: 500 }}
                    tickMargin={10}
                    stroke="#A2F4FD"
                />
                <YAxis
                    tick={{ fill: "#06b6d4", fontSize: 14, fontWeight: 600 }}
                    tickMargin={10}
                    width={60}
                    stroke="#A2F4FD"
                    tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                    formatter={(value) => [
                        formatRupiah(Number(value) || 0),
                        "Pendapatan",
                    ]}
                />
                <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#FFDF20"
                    strokeWidth={3}
                    fill="url(#areaGradient)"
                    fillOpacity={1}
                    dot={{ r: 4, fill: "#FFDF20", stroke: "#FFB86A", strokeWidth: 2 }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}

/**
 * BarChart untuk total produk per kategori.
 * XAxis: "name", dataKey bar: "total"
 */
export function CategoryBarChart({ data }: { data: NameTotal[] }) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#A2F4FD" />
                <XAxis
                    dataKey="name"
                    tick={{ fill: "#0f172a", fontSize: 11, fontWeight: 500 }}
                    tickMargin={10}
                    stroke="#A2F4FD"
                />
                <YAxis
                    tick={{ fill: "#06b6d4", fontSize: 14, fontWeight: 600 }}
                    tickMargin={10}
                    width={50}
                    stroke="#A2F4FD"
                />
                <Tooltip
                    formatter={(value) => [value as number | string, "Produk"]}
                />
                <Bar dataKey="total" radius={[8, 8, 0, 0]} maxBarSize={60}>
                    {data.map((_, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length] ?? "#FFF085"}
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

/**
 * AreaChart untuk traffic website (pengunjung harian).
 * XAxis: "day", dataKey: "value"
 */
export function TrafficAreaChart({ data }: { data: DayValue[] }) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FDC700" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#ffffffff" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#A2F4FD" />
                <XAxis
                    dataKey="day"
                    tick={{ fill: "#0f172a", fontSize: 12, fontWeight: 500 }}
                    tickMargin={10}
                    stroke="#A2F4FD"
                />
                <YAxis
                    tick={{ fill: "#06b6d4", fontSize: 14, fontWeight: 600 }}
                    tickMargin={10}
                    width={40}
                    stroke="#A2F4FD"
                />
                <Tooltip
                    formatter={(value) => [value as number | string, "Pengunjung"]}
                />
                <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#FFDF20"
                    strokeWidth={3}
                    fill="url(#trafficGradient)"
                    fillOpacity={1}
                    dot={{ r: 4, fill: "#FFDF20", stroke: "#FFB86A", strokeWidth: 2 }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}

/**
 * BarChart mingguan — dipakai untuk "Jumlah Pembeli" (creator) dan
 * "Jumlah Kreator" (admin). Bedakan lewat prop `tooltipLabel`.
 * XAxis: "week", dataKey bar: "total"
 */
export function WeeklyBarChart({
    data,
    tooltipLabel,
}: {
    data: WeekTotal[];
    tooltipLabel: string;
}) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#A2F4FD" />
                <XAxis
                    dataKey="week"
                    tick={{ fill: "#0f172a", fontSize: 11, fontWeight: 500 }}
                    tickMargin={10}
                    stroke="#A2F4FD"
                />
                <YAxis
                    tick={{ fill: "#06b6d4", fontSize: 14, fontWeight: 600 }}
                    tickMargin={10}
                    width={40}
                    stroke="#A2F4FD"
                />
                <Tooltip
                    formatter={(value) => [value as number | string, tooltipLabel]}
                />
                <Bar dataKey="total" radius={[8, 8, 0, 0]} maxBarSize={60}>
                    {data.map((_, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length] ?? "#FFF085"}
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
