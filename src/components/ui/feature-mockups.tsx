import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  DotsSixVerticalIcon,
  CaretDownIcon,
  PlusIcon,
  WalletIcon,
  ShoppingBagIcon,
  EyeIcon,
  PencilSimpleIcon,
  ArrowUpRightIcon,
  CopyIcon,
  ShareNetworkIcon,
  InstagramLogo,
  WhatsappLogo,
  GlobeIcon,
} from "@phosphor-icons/react";

// ─── 5. STEPS ILLUSTRATION MOCKUP ────────────────────────────────────────────

export function StepsIllustrationMockup() {
  return (
    <div className="w-full h-full rounded-2xl bg-cyan-50 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Background decoration: Polka Dot Pattern */}
      <div className="absolute inset-0 opacity-[0.15]"
        style={{ backgroundImage: 'radial-gradient(#0891b2 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      />

      {/* Decorative Floating Elements */}
      <div className="absolute top-10 left-10 w-24 h-24 bg-yellow-300 rounded-full blur-[60px] opacity-30" />
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-cyan-400 rounded-full blur-[80px] opacity-30" />

      {/* Main Container */}
      <div className="w-full max-w-[500px] aspect-[4/3] relative z-10 scale-90 sm:scale-100">

        {/* Step 1: Buat Akun (Back Left) */}
        <div className="absolute top-0 left-0 w-44 bg-white border-2 border-slate-800 p-4 rounded-xl shadow-[2px_2px_0px_rgba(29,41,61)] z-10 transform -rotate-3 transition-all hover:rotate-0 hover:scale-105 duration-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-cyan-600 border-2 border-slate-800 flex items-center justify-center text-white text-xs font-black shadow-[1.5px_1.5px_0px_rgba(29,41,61)]">1</div>
            <span className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">Buat Akun</span>
          </div>
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="h-1.5 w-8 bg-slate-200 rounded" />
              <div className="h-5 w-full bg-slate-50 border border-slate-200 rounded" />
            </div>
            <div className="space-y-1">
              <div className="h-1.5 w-12 bg-slate-200 rounded" />
              <div className="h-5 w-full bg-slate-50 border border-slate-200 rounded" />
            </div>
            <div className="h-7 w-full bg-cyan-600 rounded-lg mt-2 border-2 border-slate-800 shadow-[1px_1px_0px_rgba(29,41,61)] flex items-center justify-center">
              <div className="h-1.5 w-16 bg-white/40 rounded-full" />
            </div>
          </div>
        </div>

        {/* Step 2: Tambahkan Produk (Middle/Center) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 bg-white border-2 border-slate-800 rounded-xl shadow-[2px_2px_0px_rgba(29,41,61)] z-20 overflow-hidden flex flex-col transition-all hover:scale-105 duration-500">
          <div className="h-7 bg-slate-100 border-b-2 border-slate-800 flex items-center px-2 gap-1.5 shrink-0">
            <div className="w-2 h-2 rounded-full bg-red-400 border border-slate-800 shadow-sm" />
            <div className="w-2 h-2 rounded-full bg-yellow-400 border border-slate-800 shadow-sm" />
            <div className="w-2 h-2 rounded-full bg-green-400 border border-slate-800 shadow-sm" />
            <div className="ml-2 h-3 w-20 bg-white rounded-full border border-slate-200" />
          </div>
          <div className="p-4 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-600 border-2 border-slate-800 flex items-center justify-center text-white text-xs font-black shadow-[1.5px_1.5px_0px_rgba(29,41,61)]">2</div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">Tambah Produk</span>
                <span className="text-[8px] text-slate-400 font-bold uppercase leading-none">Webinar & Kelas</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="aspect-[4/3] bg-cyan-50 border-2 border-slate-800 rounded-lg shadow-[2px_2px_0px_rgba(29,41,61)] flex flex-col p-1.5">
                <div className="flex-1 bg-white rounded-md mb-1.5" />
                <div className="h-1.5 w-full bg-slate-200 rounded" />
                <div className="h-1.5 w-1/2 bg-cyan-200 rounded mt-1" />
              </div>
              <div className="aspect-[4/3] bg-yellow-50 border-2 border-slate-800 rounded-lg shadow-[2px_2px_0px_rgba(29,41,61)] flex flex-col p-1.5">
                <div className="flex-1 bg-white rounded-md mb-1.5" />
                <div className="h-1.5 w-full bg-slate-200 rounded" />
                <div className="h-1.5 w-1/2 bg-yellow-200 rounded mt-1" />
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Bagikan Link (Top Right) */}
        <div className="absolute top-4 right-0 w-48 bg-white border-2 border-slate-800 p-4 rounded-xl shadow-[2px_2px_0px_rgba(29,41,61)] z-30 transform rotate-3 transition-all hover:rotate-0 hover:scale-105 duration-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-cyan-600 border-2 border-slate-800 flex items-center justify-center text-white text-xs font-black shadow-[1.5px_1.5px_0px_rgba(29,41,61)]">3</div>
            <span className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">Bagikan Link</span>
          </div>
          <div className="space-y-3">
            <div className="flex gap-2 items-center bg-cyan-50 border-2 border-slate-800 p-2 rounded-lg shadow-[2px_2px_0px_rgba(29,41,61)]">
              <GlobeIcon size={12} className="text-cyan-600" />
              <div className="flex-1 h-1.5 bg-cyan-200 rounded-full" />
              <CopyIcon size={12} className="text-cyan-600" />
            </div>
            <div className="flex justify-center gap-3 pt-1">
              <div className="w-6 h-6 rounded-full bg-pink-50 flex items-center justify-center border border-pink-100"><InstagramLogo size={12} className="text-pink-500" /></div>
              <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100"><WhatsappLogo size={12} className="text-emerald-500" /></div>
              <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100"><ShareNetworkIcon size={12} className="text-blue-500" /></div>
            </div>
          </div>
        </div>

        {/* Step 4: Terima Pembayaran (Bottom Right) */}
        <div className="absolute bottom-0 right-4 w-56 bg-emerald-50 border-2 border-emerald-500 p-4 rounded-2xl shadow-[2px_2px_0px_rgba(16,185,129)] z-40 animate-bounce-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-600 border-2 border-slate-800 rounded-full flex items-center justify-center text-white text-lg font-black shadow-[2px_2px_0px_rgba(29,41,61)] shrink-0">4</div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-tighter">Terima Pembayaran</span>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black text-emerald-600">+ Rp 150.000</span>
              </div>
              <span className="text-[8px] text-emerald-500 font-bold mt-0.5">VERIFIKASI OTOMATIS</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── 1. MANAJEMEN WEBINAR MOCKUP ──────────────────────────────────────────────

export function ProductManagementMockup() {
  const items = [
    {
      name: "Mastering UI/UX Design",
      date: "12 Mei 2024",
      price: "Rp 150.000",
      status: "Published",
      color: "bg-green-100 text-green-700"
    },
    {
      name: "Webinar Bisnis Digital",
      date: "20 Mei 2024",
      price: "Gratis",
      status: "Published",
      color: "bg-green-100 text-green-700"
    },
    {
      name: "React Framework Guide",
      date: "05 Jun 2024",
      price: "Rp 250.000",
      status: "Draft",
      color: "bg-slate-200 text-slate-500"
    },
  ];

  return (
    <div className="w-full h-full bg-slate-50 flex flex-col p-4 overflow-y-auto no-scrollbar">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <h3 className="text-sm font-bold text-cyan-600">Webinar</h3>
        <div className="bg-cyan-600 text-white px-4 py-2 rounded-lg text-[10px] font-bold border border-slate-800 shadow-[1.5px_1.5px_0px_rgba(29,41,61)] flex items-center gap-1.5 cursor-default transition-all">
          <PlusIcon size={12} weight="bold" />
          <span>Tambah Webinar</span>
        </div>
      </div>

      <Table className="border-slate-300">
        <TableHeader className="bg-cyan-50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-[10px] py-3 px-4 font-bold border-cyan-100">Nama</TableHead>
            <TableHead className="text-[10px] py-3 px-4 font-bold border-cyan-100">Harga</TableHead>
            <TableHead className="text-[10px] py-3 px-4 font-bold border-cyan-100">Status</TableHead>
            <TableHead className="text-[10px] py-3 px-4 font-bold border-cyan-100 text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, i) => (
            <TableRow key={i} className="hover:bg-slate-50/50 transition-colors">
              <TableCell className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg border-2 border-dashed border-slate-300 bg-slate-100" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-semibold text-slate-800 truncate max-w-[80px]">{item.name}</span>
                    <span className="text-[8px] text-slate-400">{item.date}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-3 px-4 text-[10px] text-cyan-600 font-bold">{item.price}</TableCell>
              <TableCell className="py-3 px-4">
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-medium ${item.color}`}>{item.status}</span>
              </TableCell>
              <TableCell className="py-3 px-4">
                <div className="flex justify-end gap-2">
                  <div className="w-4 h-4 flex items-center justify-center"><EyeIcon size={12} className="text-slate-400" /></div>
                  <div className="w-4 h-4 flex items-center justify-center"><PencilSimpleIcon size={12} className="text-slate-400" /></div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── 2. PEMBAYARAN MOCKUP ────────────────────────────────────────────────────

export function PaymentMockup() {
  const transactions = [
    { id: "TX-9012", total: "Rp 150.000", buyer: "Budi Santoso", status: "Sudah Bayar", color: "bg-green-100 text-green-700" },
    { id: "TX-9011", total: "Rp 50.000", buyer: "Ani Wijaya", status: "Sudah Bayar", color: "bg-green-100 text-green-700" },
    { id: "TX-9010", total: "Rp 350.000", buyer: "Siska Putri", status: "Menunggu", color: "bg-yellow-100 text-yellow-700" },
    { id: "TX-9009", total: "Rp 200.000", buyer: "Dedi Kurnia", status: "Sudah Bayar", color: "bg-green-100 text-green-700" },
  ];

  return (
    <div className="w-full h-full bg-slate-50 flex flex-col p-4 gap-4 overflow-y-auto no-scrollbar">
      {/* Balance Section */}
      <div className="bg-cyan-50 border border-slate-800 p-4 rounded-xl shadow-[0px_1px_0px_rgba(29,41,61)] flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <WalletIcon className="h-4 w-4 text-cyan-600" weight="fill" />
            <span className="text-[10px] font-medium text-slate-800">Saldo saat ini</span>
          </div>
          <h3 className="text-lg font-bold text-cyan-600">Rp 4.820.000</h3>
        </div>
        <div className="bg-cyan-600 text-white p-2 rounded-full shadow-sm">
          <ArrowUpRightIcon size={14} weight="bold" />
        </div>
      </div>

      <Table className="bg-white">
        <TableHeader className="bg-cyan-50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-[9px] py-3 px-4 font-bold">ID</TableHead>
            <TableHead className="text-[9px] py-3 px-4 font-bold">Total</TableHead>
            <TableHead className="text-[9px] py-3 px-4 font-bold">Pembeli</TableHead>
            <TableHead className="text-[9px] py-3 px-4 font-bold text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx, i) => (
            <TableRow key={i} className="hover:bg-slate-50/50">
              <TableCell className="text-[9px] py-3 px-4 font-medium text-slate-400 truncate max-w-[50px]">{tx.id}</TableCell>
              <TableCell className="text-[9px] py-3 px-4 text-slate-800 font-bold">{tx.total}</TableCell>
              <TableCell className="text-[9px] py-3 px-4 text-slate-600 truncate max-w-[70px]">{tx.buyer}</TableCell>
              <TableCell className="py-3 px-4 text-center">
                <span className={`px-2 py-1 rounded-full text-[8px] font-medium ${tx.color}`}>{tx.status}</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── 3. FORM CUSTOMIZER MOCKUP ───────────────────────────────────────────────

export function FormBuilderMockup() {
  return (
    <div className="w-full h-full p-6 flex flex-col gap-4 bg-white overflow-y-auto no-scrollbar">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="text-sm font-bold text-slate-800">Kustomisasi Isian Form</h3>
        <div className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-medium">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Tersimpan
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Field 1 */}
        <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-white p-4">
          <DotsSixVerticalIcon className="h-5 w-5 text-slate-300" />
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 border-b border-slate-300 pb-1">
                <span className="text-[11px] font-medium text-slate-700">Nama Lengkap</span>
              </div>
              <div className="relative">
                <div className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 bg-white">
                  <span className="text-[10px] font-medium text-slate-600">Jawaban Singkat</span>
                  <CaretDownIcon size={10} weight="bold" className="text-slate-400" />
                </div>
              </div>
            </div>
            <div className="flex justify-end items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-4 rounded-full bg-cyan-500 relative">
                  <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm" />
                </div>
                <span className="text-[10px] font-medium text-slate-600">Wajib diisi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Field 2 */}
        <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-white p-4">
          <DotsSixVerticalIcon className="h-5 w-5 text-slate-300" />
          <div className="flex-1">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 border-b border-slate-300 pb-1">
                <span className="text-[11px] font-medium text-slate-700">Nomor WhatsApp</span>
              </div>
              <div className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 bg-slate-50/50">
                <span className="text-[10px] font-medium text-slate-600">Jawaban Singkat</span>
                <CaretDownIcon size={10} weight="bold" className="text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        <button className="flex items-center justify-center gap-2 bg-cyan-600 text-white rounded-lg py-2.5 px-4 text-[11px] font-bold border border-slate-800 shadow-[1.5px_1.5px_0px_rgba(29,41,61)] transition-all">
          <PlusIcon size={14} weight="bold" />
          <span>Tambah Field</span>
        </button>
      </div>
    </div>
  );
}

// ─── 4. DASHBOARD MOCKUP ─────────────────────────────────────────────────────

export function DashboardMockup() {
  return (
    <div className="w-full h-full p-4 flex flex-col gap-4 bg-slate-50 overflow-y-auto no-scrollbar">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-cyan-50 rounded-xl border border-slate-800 shadow-[0px_1px_0px_rgba(29,41,61)] p-4 flex flex-col">
          <div className="flex justify-between items-start mb-3">
            <div className="rounded-full text-xl text-cyan-600">
              <WalletIcon weight="fill" className="w-7 h-7" />
            </div>
            <div className="flex items-center justify-center p-1.5 rounded-full bg-cyan-600 text-white">
              <ArrowUpRightIcon size={12} weight="bold" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-semibold text-slate-800">Total Penghasilan</p>
            <h2 className="text-lg font-bold text-cyan-600 leading-none">Rp 2.450.000</h2>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-600 font-medium">
            <span>30 hari terakhir</span>
            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800">+12.5%</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-800 shadow-[0px_1px_0px_rgba(29,41,61)] p-4 flex flex-col">
          <div className="flex justify-between items-start mb-3">
            <div className="rounded-full text-xl text-yellow-500">
              <ShoppingBagIcon weight="fill" className="w-7 h-7" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-semibold text-slate-800">Total Produk</p>
            <h2 className="text-lg font-bold text-cyan-600 leading-none">12</h2>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-600 font-medium">
            <span>30 hari terakhir</span>
            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800">+4.2%</span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="flex-1 bg-white border border-slate-800 rounded-xl shadow-[0px_1px_0px_rgba(29,41,61)] p-4 flex flex-col gap-3 overflow-hidden">
        <h2 className="font-bold text-xs text-slate-800">Pendapatan Mingguan</h2>
        <div className="flex-1 relative mt-2 border-l border-b border-cyan-100">
          {/* Cyan Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between py-1 opacity-20 pointer-events-none">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-full h-px bg-cyan-400 border-t border-dashed border-cyan-400" />
            ))}
          </div>

          <div className="absolute inset-0 flex items-end justify-between gap-2 px-2 pt-2">
            {[40, 70, 45, 90, 65, 80, 50, 100, 75, 85].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-[#FFF085] border border-slate-800 rounded-t-[4px] transition-all hover:bg-[#FFB86A]"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-between text-[8px] font-medium text-slate-400">
          <span>MON</span><span>WED</span><span>FRI</span><span>SUN</span>
        </div>
      </div>
    </div>
  );
}
