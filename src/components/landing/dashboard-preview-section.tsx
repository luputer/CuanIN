import Image from "next/image";
import CatalogPreview from "~/components/landing/catalog-preview";
import Figure10 from "public/assets/Figure10.png";

export default function DashboardPreviewSection() {
  return (
    <section className="relative mt-12 md:mt-16 w-full max-w-6xl mx-auto px-4 sm:px-6 mb-20 md:mb-10">
      <div className="w-full h-[300px] sm:h-[450px] lg:h-[640px] rounded-xl flex items-center justify-center bg-cyan-50 shadow-[0px_2px_0px_rgba(29,41,61)] relative z-10">
        <CatalogPreview />
      </div>

      {/* Kotak kecil (overlap) */}
      <div className="w-[90%] lg:w-full max-w-4xl absolute -bottom-16 md:-bottom-10 left-1/2 flex -translate-x-1/2 items-center justify-center rounded-xl border-2 border-slate-800 bg-yellow-200 py-6 md:py-10 px-4 text-center shadow-[0px_4px_0px_rgba(29,41,61)] z-20">
        {/* Dekorasi atas kiri */}
        <div className="hidden sm:block absolute top-[-15px] left-[-15px] md:left-[-20px] w-12 h-12 md:w-16 md:h-16">
          <Image src={Figure10} alt="Decor Top Left" className="w-full h-full object-contain" />
        </div>

        {/* Dekorasi bawah kanan */}
        <div className="hidden sm:block absolute bottom-[-15px] right-[-15px] md:right-[-20px] w-12 h-12 md:w-16 md:h-16">
          <Image src={Figure10} alt="Decor Bottom Right" className="w-full h-full object-contain" />
        </div>

        {/* Konten text */}
        <div className="text-2xl sm:text-3xl lg:text-4xl font-medium text-slate-800 px-2 lg:px-8">
          “Ubah Keahlian Jadi Penghasilan”
        </div>
      </div>
    </section>
  );
}
