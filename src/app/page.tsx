"use client"
import React from 'react';
import { Search, ChevronDown, Eye, Copy, Trash2, Bell, CreditCard, Grid3x3, TrendingUp, Phone, Mail } from 'lucide-react';

import Link from "next/link";

export default function FormateLanding() {


  const webinars = [
    {
      name: 'Webinar UI/UX Dasar',
      date: '12 Maret 2025',
      time: '13.00 - 15.00 WIB',
      type: 'Gratis',
      price: 'Rp 0',
      period: '2T',
      status: 'Selesai'
    },
    {
      name: 'Webinar UI/UX Dasar',
      date: '12 Maret 2025',
      time: '13.00 - 15.00 WIB',
      type: 'Berbayar',
      price: 'Rp 349.000',
      period: '2T',
      status: 'Mendatang'
    },
    {
      name: 'Webinar UI/UX Dasar',
      date: '12 Maret 2025',
      time: '13.00 - 15.00 WIB',
      type: 'Gratis',
      price: 'Rp 0',
      period: '2T',
      status: 'Selesai'
    },
    {
      name: 'Webinar Personal Branding',
      date: '12 Maret 2025',
      time: '13.00 - 15.00 WIB',
      type: 'Berbayar',
      price: 'Rp 349.000',
      period: '2T',
      status: 'Lingkungan'
    },
    {
      name: 'Webinar UI/UX Dasar',
      date: '12 Maret 2025',
      time: '13.00 - 15.00 WIB',
      type: 'Gratis',
      price: 'Rp 0',
      period: '2T',
      status: 'Selesai'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Selesai': return 'bg-emerald-100 text-emerald-700';
      case 'Mendatang': return 'bg-amber-100 text-amber-700';
      case 'Lingkungan': return 'bg-slate-200 text-slate-600';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-500">
              CuanIN
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#" className="text-slate-700 hover:text-blue-600 transition-colors">Tentang</a>
              <a href="#" className="text-slate-700 hover:text-blue-600 transition-colors">Fitur</a>
              <a href="#" className="text-slate-700 hover:text-blue-600 transition-colors">Cara Kerja</a>
              <a href="#" className="text-slate-700 hover:text-blue-600 transition-colors">Kontak</a>
            </div>
            <Link
              href="/auth/login"
              className="rounded-full bg-linear-to-r from-blue-500 to-indigo-500 px-6 py-2 font-semibold text-white shadow-md transition-transform hover:scale-105"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-blue-600 mb-6 leading-tight">
          Kelola Webinar, Kelas dan Produk Digital<br />
          <span className="text-blue-900">dalam Satu Platform</span>
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
          Buat form pendaftaran, jual produk, terima pembayaran — semua tanpa ribet.
        </p>
        <div className="mb-16">
          <button className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg font-medium transition-all shadow-lg hover:shadow-xl hover:scale-105">
            Mulai Gratis
          </button>
        </div>

        {/* Dashboard Mockup Container */}
        <div className="relative mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
            <div className="p-2 bg-gray-50 border-b border-gray-100 flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="p-6 md:p-8 text-left bg-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Daftar Webinar</h3>
                  <p className="text-slate-500 mt-1">Kelola semua webinar anda dalam satu tempat</p>
                </div>
                <div className="flex gap-3">
                  <div className="hidden md:block relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input type="text" placeholder="Cari webinar..." className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48" />
                  </div>
                  <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors">
                    Tambah Produk <span>+</span>
                  </button>
                </div>
              </div>

              {/* Table Mockup */}
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs">
                    <tr>
                      <th className="px-6 py-3">Nama</th>
                      <th className="px-6 py-3">Waktu</th>
                      <th className="px-6 py-3">Tipe</th>
                      <th className="px-6 py-3">Harga</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {webinars.map((webinar, index) => (
                      <tr key={index} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-700">{webinar.name}</td>
                        <td className="px-6 py-4 text-slate-500">
                          <div className="text-xs">{webinar.date}</div>
                          <div className="text-xs opacity-75">{webinar.time}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${webinar.type === 'Gratis' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                            {webinar.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700">{webinar.price}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(webinar.status)}`}>
                            {webinar.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 text-slate-400">
                            <Eye className="w-4 h-4 hover:text-blue-600 cursor-pointer" />
                            <Copy className="w-4 h-4 hover:text-slate-600 cursor-pointer" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-center text-blue-600 mb-12">
          Masalah yang Sering Terjadi
        </h2>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            { icon: <Bell className="w-10 h-10 text-blue-600" />, title: "Data Peserta Berantakan" },
            { icon: <CreditCard className="w-10 h-10 text-blue-600" />, title: "Konfirmasi Pembayaran Manual" },
            { icon: <Grid3x3 className="w-10 h-10 text-blue-600" />, title: "Aplikasi Terpisah" },
            { icon: <TrendingUp className="w-10 h-10 text-blue-600" />, title: "Sulit Melihat Analitik & Laporan" }
          ].map((item, index) => (
            <div key={index} className="text-center group">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                {item.icon}
              </div>
              <h3 className="font-semibold text-slate-900 text-lg">{item.title}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full bg-[#f8fbff] py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-blue-600 mb-20 leading-tight">
            Semua yang kamu butuhkan ada di Formate
          </h2>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Card 1: Kustomisasi Form */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-shadow duration-300 border border-slate-100">
              <div className="bg-white border border-gray-100 rounded-xl overflow-hidden mb-8 shadow-sm">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-700">Kustomisasi Isian Form</span>
                </div>
                <div className="p-6 bg-[#f8fbff] space-y-4">
                  {/* Form Item 1 */}
                  <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm relative">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-bold text-gray-700">Alamat</span>
                      <div className="px-2 py-1 bg-gray-50 rounded border border-gray-200 text-[8px] text-gray-500 flex items-center gap-1">Jawaban Singkat <ChevronDown className="w-2 h-2" /></div>
                    </div>
                    <div className="h-8 bg-gray-50 border border-gray-100 rounded mb-2"></div>
                    <div className="flex justify-end items-center gap-2 mt-2 pt-2 border-t border-gray-50">
                      <div className="w-6 h-3 bg-blue-500 rounded-full relative"><div className="absolute right-0.5 top-0.5 w-2 h-2 bg-white rounded-full"></div></div>
                      <span className="text-[8px] text-blue-600 font-medium">Wajib diisi</span>
                    </div>
                    <div className="absolute top-2 left-1 text-blue-300">::</div>
                    <Trash2 className="absolute top-4 right-2 w-3 h-3 text-red-300" />
                  </div>
                  {/* Form Item 2 */}
                  <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm relative">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-bold text-gray-700">Rentang Usia</span>
                      <div className="px-2 py-1 bg-gray-50 rounded border border-gray-200 text-[8px] text-gray-500 flex items-center gap-1">Jawaban Singkat <ChevronDown className="w-2 h-2" /></div>
                    </div>
                    <div className="h-8 bg-gray-50 border border-gray-100 rounded mb-2"></div>
                    <div className="flex justify-end items-center gap-2 mt-2 pt-2 border-t border-gray-50">
                      <div className="w-6 h-3 bg-blue-500 rounded-full relative"><div className="absolute right-0.5 top-0.5 w-2 h-2 bg-white rounded-full"></div></div>
                      <span className="text-[8px] text-blue-600 font-medium">Wajib diisi</span>
                    </div>
                    <div className="absolute top-2 left-1 text-blue-300">::</div>
                    <Trash2 className="absolute top-4 right-2 w-3 h-3 text-red-300" />
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Kustomisasi Form</h3>
              <p className="text-gray-500 leading-relaxed">
                Buat form pendaftaran dengan template atau custom sesuai kebutuhan.
              </p>
            </div>

            {/* Card 2: Payment Gateway */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-shadow duration-300 border border-slate-100">
              <div className="bg-white border border-gray-100 rounded-xl overflow-hidden mb-8 shadow-sm h-[320px] flex flex-col justify-center p-6 bg-[#f8fbff]">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-2 block">Alasan membeli Kelas ini? <span className="text-red-500">*</span></label>
                    <div className="h-16 border border-gray-200 rounded-lg bg-white"></div>
                  </div>
                  <div className="flex gap-4 items-center">
                    <span className="text-xs font-bold text-gray-700 w-12">Total</span>
                    <div className="flex-1 h-10 border border-blue-200 rounded-lg bg-white flex items-center px-4 text-blue-600 font-bold text-sm shadow-[0_0_0_4px_rgba(59,130,246,0.1)]">
                      Rp 149.000
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-2 block">Pilih Metode Pembayaran</label>
                    <div className="h-10 border border-gray-200 rounded-lg bg-white flex items-center justify-between px-4 text-gray-400 text-xs">
                      <span>Pilih</span>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Payment Gateway</h3>
              <p className="text-gray-500 leading-relaxed">
                Pembayaran terverifikasi otomatis berbagai metode tanpa perlu cek mutasi manual.
              </p>
            </div>

            {/* Card 3: All-in-One Platform */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-shadow duration-300 border border-slate-100">
              <div className="bg-white border border-gray-100 rounded-xl overflow-hidden mb-8 shadow-sm h-[320px] relative">
                <div className="absolute top-0 left-0 right-0 p-4 border-b border-gray-100 bg-[#f8fbff]">
                  <div className="flex gap-2 mb-2">
                    <div className="h-2 w-20 bg-gray-200 rounded"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 w-24 border border-blue-200 rounded bg-white"></div>
                    <div className="h-6 w-20 border border-gray-200 rounded bg-white"></div>
                    <div className="h-6 w-24 bg-blue-600 rounded ml-auto"></div>
                  </div>
                </div>
                <div className="pt-24 px-4 pb-4">
                  <div className="w-full border border-gray-100 rounded-lg overflow-hidden">
                    <div className="bg-blue-50/50 p-2 grid grid-cols-12 gap-2 text-[8px] font-bold text-gray-500 uppercase">
                      <div className="col-span-4">Nama</div>
                      <div className="col-span-2">Waktu</div>
                      <div className="col-span-2">Tipe</div>
                      <div className="col-span-2">Harga</div>
                      <div className="col-span-2">Status</div>
                    </div>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="p-2 grid grid-cols-12 gap-2 border-b border-gray-50 items-center text-[8px]">
                        <div className="col-span-4 font-medium text-gray-700 truncate">Webinar UI/UX Dasar</div>
                        <div className="col-span-2 text-gray-400">27 Mar</div>
                        <div className="col-span-2"><span className="px-1 py-0.5 bg-gray-100 rounded">Gratis</span></div>
                        <div className="col-span-2">Rp 0</div>
                        <div className="col-span-2"><span className="px-1 py-0.5 bg-green-100 text-green-600 rounded-full">Selesai</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">All-in-One Platform</h3>
              <p className="text-gray-500 leading-relaxed">
                Kelola form, produk, pembeli dan pembayaran di satu sistem.
              </p>
            </div>

            {/* Card 4: Dashboard Analitik */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-shadow duration-300 border border-slate-100">
              <div className="bg-white border border-gray-100 rounded-xl overflow-hidden mb-8 shadow-sm h-[320px] p-4 bg-[#f8fbff]">
                <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm mb-3">
                  <div className="flex gap-2 mb-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex-1 p-2 bg-blue-50/50 rounded border border-blue-50">
                        <div className="w-4 h-4 bg-blue-100 rounded mb-1"></div>
                        <div className="h-1 w-12 bg-gray-200 rounded mb-1"></div>
                        <div className="h-3 w-8 bg-blue-600 rounded"></div>
                      </div>
                    ))}
                  </div>
                  <div className="border border-gray-100 rounded p-2 h-24 relative flex items-end justify-between px-2 gap-1">
                    {[30, 50, 40, 70, 60, 80, 55].map((h, i) => (
                      <div key={i} className="flex-1 bg-blue-100 rounded-t-sm hover:bg-blue-200 relative group" style={{ height: `${h}%` }}>
                        <div className="w-full h-full border-t-2 border-blue-400 opacity-20"></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 bg-white border border-gray-100 rounded-lg p-3 h-20 shadow-sm">
                    <div className="text-[8px] font-bold text-gray-500 mb-1">Traffic Website</div>
                    <div className="text-lg font-bold text-gray-800">1000</div>
                  </div>
                  <div className="flex-1 bg-white border border-gray-100 rounded-lg p-3 h-20 shadow-sm">
                    <div className="text-[8px] font-bold text-gray-500 mb-1">Grafik Pembeli</div>
                    <div className="flex gap-1 h-8 items-end">
                      <div className="w-2 bg-blue-500 h-full"></div>
                      <div className="w-2 bg-blue-300 h-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Dashboard Analitik</h3>
              <p className="text-gray-500 leading-relaxed">
                Pantau pembeli, pendapatan, produk dan performa website secara instan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          {/* Left: Mobile Mockups Stack */}
          <div className="relative w-full max-w-md mx-auto lg:mx-0 h-[500px] flex items-center justify-center">
            {/* Back Card: Daftar Akun */}
            <div className="absolute top-0 left-4 w-72 h-[420px] bg-white rounded-[2rem] border-4 border-blue-100 shadow-xl overflow-hidden z-10">
              <div className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-blue-500 font-bold text-lg mb-1">Daftar Akun</h3>
                  <p className="text-[10px] text-gray-400">Buat akun untuk mengakses fitur platform</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-blue-400 font-medium block mb-1">Nama Lengkap</label>
                    <div className="h-8 border border-blue-100 rounded-lg flex items-center px-2 text-[10px] text-gray-400">
                      <span className="mr-2">👤</span> Masukkan Nama Lengkap Anda
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-blue-400 font-medium block mb-1">Email</label>
                    <div className="h-8 border border-blue-100 rounded-lg flex items-center px-2 text-[10px] text-gray-400">
                      <span className="mr-2">✉️</span> Masukkan Email Aktif
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-blue-400 font-medium block mb-1">Nomor HP</label>
                    <div className="h-8 border border-blue-100 rounded-lg flex items-center px-2 text-[10px] text-gray-400">
                      <span className="mr-2">📞</span> Masukkan Nomor HP
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-blue-400 font-medium block mb-1">Password</label>
                    <div className="h-8 border border-blue-100 rounded-lg flex items-center px-2 text-[10px] text-gray-400">
                      <span className="mr-2">🔒</span> Buat Password
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-blue-400 font-medium block mb-1">Konfirmasi Password</label>
                    <div className="h-8 border border-blue-100 rounded-lg flex items-center px-2 text-[10px] text-gray-400">
                      <span className="mr-2">🔒</span> Ulangi Password
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Front Card: Daftar Webinar */}
            <div className="absolute bottom-4 right-0 w-64 h-[280px] bg-white rounded-[2rem] border-4 border-blue-200 shadow-2xl overflow-hidden z-20">
              <div className="p-5">
                <h3 className="text-blue-600 font-bold text-md mb-1">Daftar Webinar</h3>
                <p className="text-[9px] text-gray-400 mb-4">Pantau dan kelola semua webinar yang kamu buat</p>

                <div className="mb-4">
                  <div className="h-8 border border-blue-200 rounded-lg flex items-center px-3 text-[10px] text-gray-400 bg-blue-50/30">
                    <Search className="w-3 h-3 mr-2" /> Cari berdasarkan Nama Webinar
                  </div>
                </div>

                <div className="border border-blue-100 rounded-lg overflow-hidden">
                  <div className="bg-blue-100/50 p-2 flex justify-between items-center text-[10px] font-bold text-gray-600">
                    <span>Nama</span>
                    <div className="flex flex-col gap-[1px]">
                      <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[4px] border-b-gray-500"></div>
                      <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
                    </div>
                  </div>
                  <div className="p-3 text-[10px] text-gray-600 font-medium border-t border-blue-50">
                    Webinar UI/UX Dasar
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Steps List */}
          <div className="flex-1 max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-600 mb-2 leading-tight">
              Kelola seluruh proses dengan<br />
              mudah hanya dalam 4 langkah
            </h2>
            <div className="w-20 h-1 bg-transparent mb-12"></div>

            <div className="space-y-8">
              {[
                "Daftarkan Akunmu",
                "Tambah Produk",
                "Share Link Produk",
                "Pembeli Daftar & Bayar"
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-6 group">
                  <div className="flex-shrink-0 w-16 h-16 rounded-full border-2 border-blue-400 flex items-center justify-center text-3xl font-bold text-blue-600 bg-white group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                    {i + 1}
                  </div>
                  <h4 className="text-xl font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                    {step}
                  </h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-3xl shadow-sm p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-blue-600 leading-tight">
            Siap mengelola semuanya tanpa ribet?<br />
            Mulai sekarang gratis!
          </h2>
          <button className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-full text-lg font-bold transition-all shadow-lg hover:shadow-xl mt-6 hover:scale-105 text-white">
            Mulai Gratis
          </button>
        </div>
      </section>

      {/* Footer */}
      {/* Footer */}
      <footer className="w-full bg-blue-900 py-10 text-white mt-auto">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="max-w-xs">
              <h3 className="text-xl font-bold text-blue-400 mb-2">Formate</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Platform all-in-one untuk kelola produk anda dengan mudah.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-3">Kontak Kami</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <Phone size={16} />
                  <span>+62 8123 4567 890</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail size={16} />
                  <span>formate@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-blue-800 pt-6 text-center text-xs text-blue-200">
            &copy; 2026 Formate. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}