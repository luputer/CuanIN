"use client";

import {
	WalletIcon,
	BasketIcon,
	UsersIcon,
	ChartLineUpIcon,
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
import { StatCard } from "~/components/admin/dashboard/stat-card";
import { api } from "~/trpc/react";
import { formatPrice } from "~/lib/utils";
import Loading from "./loading";

const CHART_COLORS = ["#FFF085", "#FFB86A"];

export default function DashboardPage() {
	const { data, isLoading, isError } = api.analytics.adminGetStats.useQuery();

	if (isLoading) return <Loading />;

	if (isError) {
		return (
			<div className="flex items-center justify-center h-64 text-red-500 text-sm">
				Gagal memuat data dashboard. Silakan coba lagi.
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="bg-slate-50">
				<div className="sticky top-[74px] bg-slate-50 z-40 -mx-4 px-4 mb-2">
					<div className="text-2xl font-bold mb-2 text-cyan-600">Dashboard</div>
					<div className="text-sm font-regular text-slate-600">
						Selamat datang Admin. Kelola platform dan pantau statistik di sini.
					</div>
				</div>
			</div>

			{/* TOP CARDS */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
				<StatCard
					title="Total Penghasilan"
					value={formatPrice(data?.totalIncome ?? 0)}
					icon={<WalletIcon weight="fill" className="w-8 h-8" />}
					iconColor="text-cyan-600"
					bgColor="bg-cyan-50"
					showArrow={true}
					change={data?.incomeChange}
				/>

				<StatCard
					title="Total Produk"
					value={(data?.totalProducts ?? 0).toLocaleString("id-ID")}
					icon={<BasketIcon weight="fill" className="w-8 h-8" />}
					iconColor="text-yellow-500"
					change={data?.productsChange}
				/>

				<StatCard
					title="Total Kreator"
					value={(data?.totalCreators ?? 0).toLocaleString("id-ID")}
					icon={<UsersIcon weight="fill" className="w-8 h-8" />}
					iconColor="text-orange-500"
					change={data?.creatorsChange}
				/>

				<StatCard
					title="Total Pengunjung"
					value={(data?.totalVisitors ?? 0).toLocaleString("id-ID")}
					icon={<ChartLineUpIcon weight="fill" className="w-8 h-8" />}
					iconColor="text-green-500"
					change={data?.visitorsChange}
				/>
			</div>

			{/* CHART ROW 1 */}
			<div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
				<div className="lg:col-span-1 xl:col-span-2 bg-white rounded-xl border border-slate-800 shadow-[0px_1px_0px_rgba(29,41,61)] p-4 overflow-hidden">
					<h2 className="pl-2 font-semibold text-lg mt-2 mb-6 text-slate-800">Pendapatan Mingguan</h2>
					<ResponsiveContainer width="100%" height={300}>
						<AreaChart data={data?.weeklyRevenue ?? []}>
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
								tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
							/>
							<Tooltip
								formatter={(value) => [formatPrice(Number(value) || 0), "Pendapatan"]}
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
				</div>

				<div className="lg:col-span-1 bg-white rounded-xl border border-slate-800 shadow-[0px_1px_0px_rgba(29,41,61)] p-4 overflow-hidden">
					<h2 className="pl-2 font-semibold text-lg mt-2 mb-6 text-slate-800">Total per Kategori</h2>
					<ResponsiveContainer width="100%" height={300}>
						<BarChart data={data?.categoryData ?? []} barCategoryGap="20%">
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
								{(data?.categoryData ?? []).map((_, index) => (
									<Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length] ?? "#FFF085"} />
								))}
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* CHART ROW 2 */}
			<div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
				<div className="lg:col-span-1 xl:col-span-3 bg-white rounded-xl border border-slate-800 shadow-[0px_1px_0px_rgba(29,41,61)] p-4 overflow-hidden">
					<h2 className="pl-2 font-semibold text-lg mt-2 mb-6 text-slate-800">Traffic Website</h2>
					<ResponsiveContainer width="100%" height={300}>
						<AreaChart data={data?.trafficData ?? []}>
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

				<div className="lg:col-span-1 xl:col-span-2 bg-white rounded-xl border border-slate-800 shadow-[0px_1px_0px_rgba(29,41,61)] p-4 overflow-hidden">
					<h2 className="pl-2 font-semibold text-lg mt-2 mb-6 text-slate-800">Jumlah Kreator (Per Minggu)</h2>
					<ResponsiveContainer width="100%" height={300}>
						<BarChart data={data?.buyerData ?? []} barCategoryGap="20%">
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
							<Tooltip />

							<Bar dataKey="total" radius={[8, 8, 0, 0]} maxBarSize={60}>
								{(data?.buyerData ?? []).map((_, index) => (
									<Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length] ?? "#FFF085"} />
								))}
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>
		</div>
	);
}

