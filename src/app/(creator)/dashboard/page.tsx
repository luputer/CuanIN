"use client"

import {
    WalletIcon,
    BasketIcon,
    UsersIcon,
    ChartLineUpIcon,
} from "@phosphor-icons/react";
import { api } from "~/trpc/react";
import Link from "next/link";
import { DashboardCard, DashboardCardSkeleton } from "~/components/dashboard/dashboard-card";
import { ChartSkeleton } from "~/components/dashboard/dashboard-skeletons";
import {
    WeeklyRevenueChart,
    CategoryBarChart,
    TrafficAreaChart,
    WeeklyBarChart,
    formatRupiah,
} from "~/components/dashboard/dashboard-charts";
import { PageHeader } from "~/components/shared/page-header";

export default function DashboardPage() {
    const { data, isLoading, isError } = api.analytics.getDashboardStats.useQuery();

    if (isError) {
        return (
            <div className="flex items-center justify-center h-64 text-red-500 text-sm">
                Gagal memuat data dashboard. Silakan coba lagi.
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">

            {/* Header */}
            <PageHeader
                title="Dashboard"
                description={`Selamat datang${data?.userName ? `, ${data.userName}` : ""}. Kelola produk dan pantau penjualan Anda di sini.`}
            />

            {/* TOP CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                {isLoading ? (
                    <>
                        <DashboardCardSkeleton />
                        <DashboardCardSkeleton />
                        <DashboardCardSkeleton />
                        <DashboardCardSkeleton />
                    </>
                ) : (
                    <>
                        <Link href="/pembayaran" className="block rounded-xl transition-transform hover:scale-101">
                            <DashboardCard
                                title="Total Penghasilan"
                                value={formatRupiah(data?.totalIncome ?? 0)}
                                icon={<WalletIcon weight="fill" className="size-8" />}
                                iconColor="text-cyan-600"
                                bgColor="bg-cyan-50"
                                showArrow={true}
                                change={data?.incomeChange}
                            />
                        </Link>
                        <DashboardCard
                            title="Total Produk"
                            value={(data?.totalProducts ?? 0).toLocaleString("id-ID")}
                            icon={<BasketIcon weight="fill" className="size-8" />}
                            iconColor="text-yellow-500"
                            change={data?.productsChange}
                        />
                        <DashboardCard
                            title="Total User"
                            value={(data?.totalUsers ?? 0).toLocaleString("id-ID")}
                            icon={<UsersIcon weight="fill" className="size-8" />}
                            iconColor="text-orange-500"
                            change={data?.usersChange}
                        />
                        <DashboardCard
                            title="Total Pengunjung"
                            value={(data?.totalVisitors ?? 0).toLocaleString("id-ID")}
                            icon={<ChartLineUpIcon weight="fill" className="size-8" color="currentColor" />}
                            iconColor="text-green-500"
                            change={data?.visitorsChange}
                        />
                    </>
                )}
            </div>

            {/* CHART ROW 1 */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
                <div className="lg:col-span-1 xl:col-span-2 bg-white rounded-xl border border-slate-800 shadow-[0px_1px_0px_rgba(29,41,61)] p-4 overflow-hidden">
                    <h2 className="pl-2 font-semibold text-lg mt-2 mb-6 text-slate-800">Pendapatan Mingguan</h2>
                    {isLoading
                        ? <ChartSkeleton />
                        : <WeeklyRevenueChart data={data?.weeklyRevenue ?? []} />
                    }
                </div>

                <div className="lg:col-span-1 bg-white rounded-xl border-1 border-slate-800 shadow-[0px_1px_0px_rgba(29,41,61)] p-4 overflow-hidden">
                    <h2 className="pl-2 font-semibold text-lg mt-2 mb-6 text-slate-800">Total per Kategori</h2>
                    {isLoading
                        ? <ChartSkeleton />
                        : <CategoryBarChart data={data?.categoryData ?? []} />
                    }
                </div>
            </div>

            {/* CHART ROW 2 */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
                <div className="lg:col-span-1 xl:col-span-3 bg-white rounded-xl border border-slate-800 shadow-[0px_1px_0px_rgba(29,41,61)] p-4 overflow-hidden">
                    <h2 className="pl-2 font-semibold text-lg mt-2 mb-6 text-slate-800">Traffic Website</h2>
                    {isLoading
                        ? <ChartSkeleton />
                        : <TrafficAreaChart data={data?.trafficData ?? []} />
                    }
                </div>

                <div className="lg:col-span-1 xl:col-span-2 bg-white rounded-xl border border-slate-800 shadow-[0px_1px_0px_rgba(29,41,61)] p-4 overflow-hidden">
                    <h2 className="pl-2 font-semibold text-lg mt-2 mb-6 text-slate-800">Jumlah Pembeli</h2>
                    {isLoading
                        ? <ChartSkeleton />
                        : <WeeklyBarChart data={data?.buyerData ?? []} tooltipLabel="Pembeli" />
                    }
                </div>
            </div>

        </div>
    );
}