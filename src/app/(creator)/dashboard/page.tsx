"use client"

import {
    WalletIcon,
    ShoppingBagIcon,
    UsersIcon,
    ChartLineUpIcon,
    ArrowUpRightIcon,
} from "@phosphor-icons/react";
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
import { api } from "~/trpc/react";
import { formatPrice } from "~/lib/utils";

type CardProps = {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    iconColor?: string;
    bgColor?: string;
    showArrow?: boolean;
    change?: number;
};

function Card({
    title,
    value,
    icon,
    iconColor,
    bgColor,
    showArrow,
    change = 0,
}: CardProps) {

    return (
        <div className={`${bgColor ?? "bg-white"} gap-1 rounded-xl border border-slate-800 shadow-[0px_1px_0px_rgba(29,41,61)] p-4 flex flex-col`}>

            {/* TOP ROW: ICON & ARROW */}
            <div className="flex justify-between items-start mb-3">
                {/* MAIN ICON */}
                <div className={`rounded-full text-2xl ${iconColor}`}>
                    {icon}
                </div>

                {/* ARROW UP RIGHT */}
                {showArrow && (
                    <button className="flex items-center justify-center p-1.5 rounded-full bg-cyan-600 text-white cursor-pointer">
                        <ArrowUpRightIcon size={14} weight="bold" />
                    </button>
                )}
            </div>

            {/* TITLE & VALUE */}
            <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-slate-800">
                    {title}
                </p>
                <h2 className="text-lg font-semibold text-cyan-600">
                    {value}
                </h2>
            </div>

            {/* INFO */}
            <div className="mt-1 flex items-center justify-between font-regular text-xs text-slate-600">
                <span>30 hari terakhir</span>
                <span className={`${change >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"} px-2 py-1 rounded-full text-xs font-regular`}>
                    {change >= 0 ? "+" : ""}{change.toFixed(1)}%
                </span>
            </div>

        </div>
    );
}

export default function DashboardPage() {
    const { data: stats, isLoading } = api.analytics.getDashboardStats.useQuery();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
            </div>
        );
    }

    if (!stats) return null;

    return (

        <div className="space-y-6">
            {/* Header */}
            <div className="bg-slate-50">
                <div className="sticky top-[74px] bg-slate-50 z-40 -mx-4 px-4 mb-2">
                    <div className="text-2xl font-bold mb-2 text-cyan-600">Dashboard</div>
                    <div className="text-sm font-regular text-slate-600">Selamat datang, {stats.userName ?? "Kreator"}. Kelola produk dan pantau penjualan Anda di sini.</div>
                </div>
            </div>

            {/* TOP CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <Card
                    title="Total Penghasilan"
                    value={formatPrice(stats.totalIncome)}
                    icon={<WalletIcon weight="fill" className="w-8 h-8" />}
                    iconColor="text-cyan-600"
                    bgColor="bg-cyan-50"
                    showArrow={true}
                    change={stats.incomeChange}
                />

                <Card
                    title="Total Produk"
                    value={stats.totalProducts}
                    icon={<ShoppingBagIcon weight="fill" className="w-8 h-8" />}
                    iconColor="text-yellow-500"
                    change={stats.productsChange}
                />

                <Card
                    title="Total User"
                    value={stats.totalUsers}
                    icon={<UsersIcon weight="fill" className="w-8 h-8" />}
                    iconColor="text-orange-500"
                    change={stats.usersChange}
                />

                <Card
                    title="Total Pengunjung"
                    value={stats.totalVisitors}
                    icon={<ChartLineUpIcon weight="fill" className="w-8 h-8" color="currentColor" />}
                    iconColor="text-green-500"
                    change={stats.visitorsChange}
                />
            </div>

            {/* CHART ROW 1 */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
                <div className="lg:col-span-1 xl:col-span-2 bg-white rounded-xl border-1 border-slate-800 shadow-[0px_1px_0px_rgba(29,41,61)] p-4 overflow-hidden">
                    <h2 className="pl-2 font-semibold text-lg mb-6 text-slate-800">Pendapatan Mingguan</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={stats.weeklyRevenue}>
                            <defs>
                                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#FDC700" stopOpacity={0.4} />
                                    <stop offset="100%" stopColor="#ffffffff" stopOpacity={0} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid strokeDasharray="3 3"
                                stroke="#A2F4FD" />
                            <XAxis
                                dataKey="day"
                                tick={{ fill: "#0f172a", fontSize: 12, fontWeight: 500 }}
                                tickMargin={10}
                                stroke="#A2F4FD"
                            />
                            <YAxis
                                tick={{ fill: "#06b6d4", fontSize: 14, fontWeight: 600 }}
                                tickMargin={10}
                                width={55}
                                stroke="#A2F4FD"
                            />
                            <Tooltip formatter={(value: unknown) => formatPrice(Number(value))} />
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
                </div>

                <div className="lg:col-span-1 bg-white rounded-xl border-1 border-slate-800 shadow-[0px_1px_0px_rgba(29,41,61)] p-4 overflow-hidden">
                    <h2 className="pl-2 font-semibold text-lg mb-6 text-slate-800">Total per Kategori</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats.categoryData} barCategoryGap="20%">
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
                            <Tooltip />

                            <Bar dataKey="total" radius={[8, 8, 0, 0]} maxBarSize={60}>
                                {stats.categoryData.map((entry, index) => {
                                    const colors = ["#FFF085", "#FFB86A"];
                                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                })}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* CHART ROW 2 */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
                <div className="lg:col-span-1 xl:col-span-3 bg-white rounded-xl border-1 border-slate-800 shadow-[0px_1px_0px_rgba(29,41,61)] p-4 overflow-hidden">
                    <h2 className="pl-2 font-semibold text-lg mb-6 text-slate-800">Traffic Website</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={stats.trafficData}>
                            <defs>
                                <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#FDC700" stopOpacity={0.4} />
                                    <stop offset="100%" stopColor="#ffffffff" stopOpacity={0} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid strokeDasharray="3 3"
                                stroke="#A2F4FD" />
                            <XAxis
                                dataKey="day"
                                tick={{ fill: "#0f172a", fontSize: 12, fontWeight: 500 }}
                                tickMargin={10}
                                stroke="#A2F4FD"
                            />
                            <YAxis
                                tick={{ fill: "#06b6d4", fontSize: 14, fontWeight: 600 }}
                                tickMargin={10}
                                width={55}
                                stroke="#A2F4FD"
                            />
                            <Tooltip />

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
                </div>

                <div className="lg:col-span-1 xl:col-span-2 bg-white rounded-xl border border-slate-800 shadow-[0px_1px_0px_rgba(29,41,61)] p-4 overflow-hidden">
                    <h2 className="pl-2 font-semibold text-lg mb-6 text-slate-800">Jumlah Pembeli</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats.buyerData} barCategoryGap="20%">
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
                                width={50}
                                stroke="#A2F4FD"
                            />
                            <Tooltip />

                            <Bar dataKey="total" radius={[8, 8, 0, 0]} maxBarSize={60}>
                                {stats.buyerData.map((entry, index) => {
                                    const colors = ["#FFF085", "#FFB86A"];
                                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                })}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
