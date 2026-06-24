import Button from "~/components/shared/buttonlogin";
import CatalogMockup from "~/components/landing/catalog-mockup";
import Star8 from "~/components/stars/s8";

export default function HeroSection() {
  return (
    <section className="bg-cuan-cyan/15 w-full relative py-12 md:py-20 text-center lg:text-left border-b-2 border-slate-800 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-start pt-8 md:pt-12">
          {/* Konten Teks */}
          <div>
            <div className="inline-block px-4 py-1 mb-4 rounded-full bg-white text-slate-700 font-semibold -rotate-2 border-1 border-slate-800 animate-bounce">
              All-in-One Platform
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-slate-800 leading-tight">
              Jual Webinar, Kelas dan Produk Digital
            </h1>
            <span className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight">
              Tanpa Ribet!
            </span>
            <p className="text-base md:text-lg text-slate-600 mt-4 mb-8">
              Dari pendaftaran hingga pembayaran, <br /> semuanya terintegrasi dalam satu tempat.
            </p>
            <div className="mb-8 flex items-center justify-center lg:justify-start gap-4">
              <Button text="Mulai Gratis" href="/sign-in" />
              <Star8 size={36} className="text-yellow-300 rotate-4 -mt-6 hidden sm:block" stroke="black" strokeWidth={6} />
            </div>
          </div>

          {/* Catalog Mockup */}
          <div className="mt-12 lg:mt-0">
            <CatalogMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
