import {
  ProductManagementMockup,
  PaymentMockup,
  FormBuilderMockup,
  DashboardMockup,
} from "~/components/landing/feature-mockups";

export default function FeaturesSection() {
  return (
    <section id="fitur" className="py-20 md:py-40 bg-yellow-200 w-full">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-800 mb-12 md:mb-20 text-center px-2">
          Semua yang kamu butuhkan ada di CuanIN
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 md:gap-8">
          {/* Card 1 (lebar besar) */}
          <div className="lg:col-span-6 p-6 rounded-xl border-2 border-slate-800 bg-white transition-all duration-300 hover:-translate-y-2">
            <div className="w-full h-80 bg-white rounded-xl flex items-center justify-center border-2 border-slate-800 overflow-hidden">
              <ProductManagementMockup />
            </div>
            <h3 className="mt-6 text-xl md:text-2xl font-medium text-slate-800">
              All-in-One Platform
            </h3>
            <p className="mt-2 text-slate-600 font-regular text-base md:text-lg">
              Kelola produk, form, pembeli hingga pembayaran dalam satu sistem terintegrasi.
            </p>
          </div>

          {/* Card 2 (kecil) */}
          <div className="lg:col-span-5 p-6 rounded-xl border-2 border-slate-800 bg-white transition-all duration-300 hover:-translate-y-2">
            <div className="w-full h-80 bg-white rounded-xl flex items-center justify-center border-2 border-slate-800 overflow-hidden">
              <PaymentMockup />
            </div>
            <h3 className="mt-6 text-xl md:text-2xl font-medium text-slate-800">
              Payment Gateway
            </h3>
            <p className="mt-2 text-slate-600 font-regular text-base md:text-lg">
              Terima pembayaran otomatis dengan verifikasi instan, tanpa perlu cek manual.
            </p>
          </div>

          {/* Card 3 (kecil) */}
          <div className="lg:col-span-5 p-6 rounded-xl border-2 border-slate-800 bg-white transition-all duration-300 hover:-translate-y-2">
            <div className="w-full h-80 bg-white rounded-xl flex items-center justify-center border-2 border-slate-800 overflow-hidden">
              <FormBuilderMockup />
            </div>
            <h3 className="mt-6 text-xl md:text-2xl font-medium text-slate-800">
              Kustomisasi Form
            </h3>
            <p className="mt-2 text-slate-600 font-regular text-base md:text-lg">
              Buat form pendaftaran dengan bebas sesuai kebutuhanmu.
            </p>
          </div>

          {/* Card 4 (lebar besar) */}
          <div className="lg:col-span-6 p-6 rounded-xl border-2 border-slate-800 bg-white transition-all duration-300 hover:-translate-y-2">
            <div className="w-full h-80 bg-white rounded-xl flex items-center justify-center border-2 border-slate-800 overflow-hidden">
              <DashboardMockup />
            </div>
            <h3 className="mt-6 text-xl md:text-2xl font-medium text-slate-800">
              Dashboard Analitik
            </h3>
            <p className="mt-2 text-slate-600 font-regular text-base md:text-lg">
              Pantau pembeli, pendapatan, dan performa produk secara real-time dalam satu dashboard.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
