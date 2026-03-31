"use client";

import {
    ArrowUpRight,
    ShoppingBag,
    Users,
    TrendingUp
} from "lucide-react";

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-blue-600">Dashboard</h1>
                <p className="text-slate-500 mt-1">
                    Selamat datang, Mason Brooks. Kelola produk dan pantau penjualan Anda di sini.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Card 1: Total Penghasilan */}
                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex flex-col justify-between h-40 relative group hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <CreditCardIcon className="w-5 h-5" />
                        </div>
                        <div className="p-1.5 bg-blue-500 rounded-full text-white">
                            <ArrowUpRight className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Total Penghasilan</p>
                        <h3 className="text-2xl font-bold text-blue-600">Rp 1.500.000</h3>
                    </div>
                    <div className="flex justify-between items-center text-xs mt-2">
                        <span className="text-slate-400">30 hari terakhir</span>
                        <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded-full font-medium">+ 30%</span>
                    </div>
                </div>

                {/* Card 2: Total Produk */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col justify-between h-40 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div className="p-2 bg-amber-50 rounded-lg text-amber-500">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Total Produk</p>
                        <h3 className="text-2xl font-bold text-slate-800">590</h3>
                    </div>
                    <div className="flex justify-between items-center text-xs mt-2">
                        <span className="text-slate-400">30 hari terakhir</span>
                        <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded-full font-medium">+ 30%</span>
                    </div>
                </div>

                {/* Card 3: Total User */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col justify-between h-40 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-500">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Total User</p>
                        <h3 className="text-2xl font-bold text-slate-800">590</h3>
                    </div>
                    <div className="flex justify-between items-center text-xs mt-2">
                        <span className="text-slate-400">30 hari terakhir</span>
                        <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded-full font-medium">+ 30%</span>
                    </div>
                </div>

                {/* Card 4: Total Pengunjung */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col justify-between h-40 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div className="p-2 bg-teal-50 rounded-lg text-teal-500">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Total Pengunjung</p>
                        <h3 className="text-2xl font-bold text-slate-800">590</h3>
                    </div>
                    <div className="flex justify-between items-center text-xs mt-2">
                        <span className="text-slate-400">30 hari terakhir</span>
                        <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded-full font-medium">+ 30%</span>
                    </div>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Line Chart: Pendapatan Per Minggu */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6">Pendapatan Per Minggu</h3>
                    <div className="h-64 w-full relative">
                        <div className="absolute inset-0 flex flex-col justify-between text-xs text-slate-400">
                            <div>1000k</div>
                            <div>750k</div>
                            <div>500k</div>
                            <div>250k</div>
                            <div>0</div>
                        </div>
                        {/* Grid Lines */}
                        <div className="absolute inset-0 left-8 right-0 flex flex-col justify-between pointer-events-none">
                            {[0, 1, 2, 3, 4].map((_, i) => (
                                <div key={i} className="border-b border-dashed border-slate-100 h-0 w-full relative top-2"></div>
                            ))}
                        </div>
                        {/* Chart Area */}
                        <div className="absolute inset-0 left-8 right-0 top-2 bottom-6">
                            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                                {/* Area Gradient */}
                                <defs>
                                    <linearGradient id="gradient-blue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path
                                    d="M0,80 Q15,60 25,65 T50,40 T75,20 T100,30 V100 H0 Z"
                                    fill="url(#gradient-blue)"
                                />
                                {/* Line */}
                                <path
                                    d="M0,80 Q15,60 25,65 T50,40 T75,20 T100,30"
                                    fill="none"
                                    stroke="#3b82f6"
                                    strokeWidth="2"
                                    vectorEffect="non-scaling-stroke"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                {/* Points */}
                                {[
                                    { x: 0, y: 80 }, { x: 25, y: 65 }, { x: 50, y: 40 }, { x: 75, y: 20 }, { x: 100, y: 30 }
                                ].map((p, i) => (
                                    <circle key={i} cx={p.x} cy={p.y} r="1.5" fill="white" stroke="#3b82f6" strokeWidth="0.5" />
                                ))}
                            </svg>
                        </div>
                        {/* X-Axis Labels */}
                        <div className="absolute bottom-0 left-8 right-0 flex justify-between text-xs text-slate-500 pt-2">
                            <span>Senin</span>
                            <span>Selasa</span>
                            <span>Rabu</span>
                            <span>Kamis</span>
                            <span>Jumat</span>
                            <span>Sabtu</span>
                            <span>Minggu</span>
                        </div>
                    </div>
                </div>

                {/* Bar Chart: Total Per Kategori */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6">Total Per Kategori</h3>
                    <div className="h-64 w-full relative">
                        <div className="absolute inset-0 flex flex-col justify-between text-xs text-slate-400 pr-2">
                            <div>1000</div>
                            <div>750</div>
                            <div>500</div>
                            <div>250</div>
                            <div>0</div>
                        </div>
                        {/* Grid Lines */}
                        <div className="absolute inset-0 left-8 right-0 flex flex-col justify-between pointer-events-none">
                            {[0, 1, 2, 3, 4].map((_, i) => (
                                <div key={i} className="border-b border-dashed border-slate-100 h-0 w-full relative top-2"></div>
                            ))}
                        </div>
                        {/* Chart Bars */}
                        <div className="absolute inset-0 left-8 right-0 top-2 bottom-6 flex items-end justify-around px-2">
                            {/* Bar 1 */}
                            <div className="w-12 bg-blue-400 rounded-t-md hover:bg-blue-500 transition-colors relative group h-[80%]">
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">800</div>
                            </div>
                            {/* Bar 2 */}
                            <div className="w-12 bg-indigo-300 rounded-t-md hover:bg-indigo-400 transition-colors relative group h-[50%]">
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">500</div>
                            </div>
                            {/* Bar 3 */}
                            <div className="w-12 bg-blue-400 rounded-t-md hover:bg-blue-500 transition-colors relative group h-[70%]">
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">700</div>
                            </div>
                        </div>
                        {/* X-Axis Labels */}
                        <div className="absolute bottom-0 left-8 right-0 flex justify-around text-xs text-slate-500 pt-2 px-2">
                            <span>Webinar</span>
                            <span>Kelas</span>
                            <span className="text-[10px]">Produk Digital</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Line Chart: Traffic Website */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6">Traffic Website</h3>
                    <div className="h-64 w-full relative">
                        <div className="absolute inset-0 flex flex-col justify-between text-xs text-slate-400 text-right pr-2 w-8">
                            <div>1000</div>
                            <div>750</div>
                            <div>500</div>
                            <div>250</div>
                            <div>0</div>
                        </div>
                        {/* Grid Lines */}
                        <div className="absolute inset-0 left-10 right-0 flex flex-col justify-between pointer-events-none">
                            {[0, 1, 2, 3, 4].map((_, i) => (
                                <div key={i} className="border-b border-dashed border-slate-100 h-0 w-full relative top-2"></div>
                            ))}
                        </div>
                        {/* Chart Area */}
                        <div className="absolute inset-0 left-10 right-0 top-2 bottom-6">
                            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <path
                                    d="M0,90 Q15,70 30,80 T60,50 T80,75 T100,60"
                                    fill="none"
                                    stroke="#3b82f6"
                                    strokeWidth="2"
                                    vectorEffect="non-scaling-stroke"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                {[
                                    { x: 0, y: 90 }, { x: 30, y: 80 }, { x: 60, y: 50 }, { x: 80, y: 75 }, { x: 100, y: 60 }
                                ].map((p, i) => (
                                    <circle key={i} cx={p.x} cy={p.y} r="1.5" fill="white" stroke="#3b82f6" strokeWidth="0.5" />
                                ))}
                            </svg>
                        </div>
                        {/* X-Axis Labels */}
                        <div className="absolute bottom-0 left-10 right-0 flex justify-between text-xs text-slate-500 pt-2">
                            <span>Senin</span>
                            <span>Selasa</span>
                            <span>Rabu</span>
                            <span>Kamis</span>
                            <span>Jumat</span>
                            <span>Sabtu</span>
                            <span>Minggu</span>
                        </div>
                    </div>
                </div>

                {/* Bar Chart: Grafik Pembeli */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6">Grafik Pembeli</h3>
                    <div className="h-64 w-full relative">
                        <div className="absolute inset-0 flex flex-col justify-between text-xs text-slate-400 text-right pr-2 w-8">
                            <div>100</div>
                            <div>75</div>
                            <div>50</div>
                            <div>25</div>
                            <div>0</div>
                        </div>
                        {/* Grid Lines */}
                        <div className="absolute inset-0 left-10 right-0 flex flex-col justify-between pointer-events-none">
                            {[0, 1, 2, 3, 4].map((_, i) => (
                                <div key={i} className="border-b border-dashed border-slate-100 h-0 w-full relative top-2"></div>
                            ))}
                        </div>
                        {/* Chart Bars */}
                        <div className="absolute inset-0 left-10 right-0 top-2 bottom-6 flex items-end justify-around px-4 gap-4">
                            {/* Bar 1 */}
                            <div className="flex-1 bg-indigo-300 rounded-t-md hover:bg-indigo-400 transition-colors relative group h-[40%]"></div>
                            {/* Bar 2 */}
                            <div className="flex-1 bg-blue-400 rounded-t-md hover:bg-blue-500 transition-colors relative group h-[70%]"></div>
                            {/* Bar 3 */}
                            <div className="flex-1 bg-indigo-300 rounded-t-md hover:bg-indigo-400 transition-colors relative group h-[60%]"></div>
                            {/* Bar 4 */}
                            <div className="flex-1 bg-blue-400 rounded-t-md hover:bg-blue-500 transition-colors relative group h-[80%]"></div>
                        </div>
                        {/* X-Axis Labels */}
                        <div className="absolute bottom-0 left-10 right-0 flex justify-around text-xs text-slate-500 pt-2">
                            <span>Minggu 1</span>
                            <span>Minggu 2</span>
                            <span>Minggu 3</span>
                            <span>Minggu 4</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CreditCardIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
    )
}
