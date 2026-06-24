import Button from "~/components/shared/buttonlogin";
import { Star15 } from "~/components/stars/s15";

export default function CtaSection() {
  return (
    <section className="relative max-w-6xl w-full pb-10 md:pb-36 pt-4 md:pt-10 mx-auto px-4 sm:px-6">
      <div className="relative bg-cuan-cyan/20 py-8 md:py-16 rounded-xl border-2 border-slate-800 shadow-[2px_2px_0px_#000] px-4 md:px-12 text-center overflow-hidden">
        {/* Dekorasi atas kiri */}
        <div className="hidden sm:block absolute top-[-30px] left-[-60px] z-0 opacity-50">
          <Star15 size={200} className="text-cuan-blue" />
        </div>

        {/* Dekorasi bawah kanan */}
        <div className="hidden sm:block absolute bottom-[-30px] right-[-60px] z-0 opacity-50">
          <Star15 size={200} className="text-cuan-cyan" />
        </div>

        {/* Konten text */}
        <div className="relative z-10">
          <h2 className="text-xl sm:text-3xl md:text-4xl font-semibold mb-6 md:mb-10 text-slate-800 leading-tight">
            Siap mengelola semuanya tanpa ribet?<br className="hidden sm:block" />
            <span className="sm:inline block mt-2">Mulai sekarang gratis!</span>
          </h2>

          <Button text="Daftar Sekarang" href="/sign-in" />
        </div>
      </div>
    </section>
  );
}
