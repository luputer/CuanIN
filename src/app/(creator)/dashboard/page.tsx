"use client"

import {
    Wallet,
    Bag,
    Users,
    ChartLineUp,
    ArrowUpRight,
} from "phosphor-react";
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

type CardProps = {
    title: string;
    value: string;
    icon: React.ReactNode;
    iconColor?: string;
    bgColor?: string;
    showArrow?: boolean;
};

function Card({
    title,
    value,
    icon,
    iconColor,
    bgColor,
    showArrow,
}: CardProps) {

    return (
        <div className={`${bgColor ?? "bg-white"} gap-1 rounded-xl border border-indigo-950 shadow-[0px_1px_0px_rgba(30,27,75)] p-4 flex flex-col`}>

            {/* TOP ROW: ICON & ARROW */}
            <div className="flex justify-between items-start mb-3">
                {/* MAIN ICON */}
                <div className={`rounded-full text-2xl ${iconColor}`}>
                    {icon}
                </div>

                {/* ARROW UP RIGHT */}
                {showArrow && (
                    <button className="flex items-center justify-center p-1.5 rounded-full bg-cyan-600 text-white cursor-pointer">
                        <ArrowUpRight size={14} weight="bold" />
                    </button>
                )}
            </div>

            {/* TITLE & VALUE */}
            <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-indigo-950">
                    {title}
                </p>
                <h2 className="text-lg font-semibold text-cyan-600">
                    {value}
                </h2>
            </div>

            {/* INFO */}
            <div className="mt-1 flex items-center justify-between font-regular text-xs text-slate-600">
                <span>30 hari terakhir</span>
                <span className="bg-green-100 px-2 py-1 rounded-full text-xs font-regular text-green-800">30%</span>
            </div>

        </div>
    );
}

const weeklyRevenue = [
    { day: "Senin", value: 400 },
    { day: "Selasa", value: 700 },
    { day: "Rabu", value: 500 },
    { day: "Kamis", value: 900 },
    { day: "Jumat", value: 1200 },
    { day: "Sabtu", value: 800 },
    { day: "Minggu", value: 1000 },
];

const categoryData = [
    { name: "Webinar", total: 40 },
    { name: "Kelas", total: 65 },
    { name: "Produk Digital", total: 30 },
];

const trafficData = [
    { day: "Senin", value: 200 },
    { day: "Selasa", value: 400 },
    { day: "Rabu", value: 350 },
    { day: "Kamis", value: 600 },
    { day: "Jumat", value: 750 },
    { day: "Sabtu", value: 500 },
    { day: "Minggu", value: 650 },
];

const buyerData = [
    { week: "Minggu 1", total: 50 },
    { week: "Minggu 2", total: 80 },
    { week: "Minggu 3", total: 65 },
    { week: "Minggu 4", total: 100 },
];

export default function DashboardPage() {
    return (
        <div className="bg-slate-50">
            <div className="sticky top-[74px] bg-slate-50 z-40 -mx-4 px-4 pt-4 pb-4 mb-2">
                <div className="text-2xl font-semibold mb-1 text-indigo-950">Dashboard</div>
                <div className="text-sm font-regular text-slate-600">Selamat datang, Mason Brooks. Kelola produk dan pantau penjualan Anda di sini.</div>
            </div>

            {/* TOP CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <Card
                    title="Total Penghasilan"
                    value="Rp 12.500.000"
                    icon={<Wallet weight="fill" className="w-8 h-8" />}
                    iconColor="text-cyan-600"
                    bgColor="bg-cyan-50"
                    showArrow={true}
                />

                <Card
                    title="Total Produk"
                    value="120"
                    icon={<Bag weight="fill" className="w-8 h-8" />}
                    iconColor="text-yellow-500"
                />

                <Card
                    title="Total User"
                    value="850"
                    icon={<Users weight="fill" className="w-8 h-8" />}
                    iconColor="text-orange-500"
                />

                <Card
                    title="Total Pengunjung"
                    value="5.430"
                    icon={<ChartLineUp weight="fill" className="w-8 h-8" color="currentColor" />}
                    iconColor="text-green-500"
                />
            </div>

            {/* CHART ROW 1 */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
                <div className="lg:col-span-1 xl:col-span-2 bg-white rounded-xl border-2 border-indigo-950 shadow-[0px_2px_0px_rgba(30,27,75)] p-4 overflow-hidden">
                    <h2 className="pl-2 font-semibold text-lg mb-6 text-indigo-950">Pendapatan Mingguan</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={weeklyRevenue}>
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
                                width={60}
                                stroke="#A2F4FD"
                            />
                            <Tooltip />

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

                <div className="lg:col-span-1 bg-white rounded-xl border-2 border-indigo-950 shadow-[0px_2px_0px_rgba(30,27,75)] p-4 overflow-hidden">
                    <h2 className="pl-2 font-semibold text-lg mb-6 text-indigo-950">Total per Kategori</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={categoryData} barCategoryGap="20%">
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
                                width={30}
                                stroke="#A2F4FD"
                            />
                            <Tooltip />

                            <Bar dataKey="total" radius={[8, 8, 0, 0]} maxBarSize={60}>
                                {categoryData.map((entry, index) => {
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
                <div className="lg:col-span-1 xl:col-span-3 bg-white rounded-xl border-2 border-indigo-950 shadow-[0px_2px_0px_rgba(30,27,75)] p-4 overflow-hidden">
                    <h2 className="pl-2 font-semibold text-lg mb-6 text-indigo-950">Traffic Website</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={trafficData}>
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
                                width={40}
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

                <div className="lg:col-span-1 xl:col-span-2 bg-white rounded-xl border-2 border-indigo-950 shadow-[0px_2px_0px_rgba(30,27,75)] p-4 overflow-hidden">
                    <h2 className="pl-2 font-semibold text-lg mb-6 text-indigo-950">Jumlah Pembeli</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={buyerData} barCategoryGap="20%">
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
                                width={30}
                                stroke="#A2F4FD"
                            />
                            <Tooltip />

                            <Bar dataKey="total" radius={[8, 8, 0, 0]} maxBarSize={60}>
                                {buyerData.map((entry, index) => {
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
