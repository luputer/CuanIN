import Image from "next/image";
import Button from "~/components/ui/buttonlogin";
import Figure11 from "public/assets/Figure11.png";

export default function CtaSection() {
  return (
    <section className="relative max-w-6xl w-full py-16 md:py-30 px-4 md:px-6 mx-auto">
      <div className="relative bg-yellow-200 py-12 md:py-16 rounded-xl border-2 border-slate-800 shadow-[2px_3px_0px_rgba(29,41,61)] px-6 md:px-12 text-center">
        {/* Dekorasi atas kiri */}
        <div className="hidden sm:block absolute top-[-20px] left-[-10px] md:left-[-30px] w-16 h-16 md:w-20 md:h-20">
          <Image src={Figure11} alt="Decor Top Left" className="w-full h-full object-contain" />
        </div>

        {/* Dekorasi bawah kanan */}
        <div className="hidden sm:block absolute bottom-[-20px] right-[-10px] md:right-[-30px] w-16 h-16 md:w-20 md:h-20">
          <Image src={Figure11} alt="Decor Bottom Right" className="w-full h-full object-contain" />
        </div>

        {/* Konten text */}
        <h2 className="text-3xl md:text-4xl font-semibold mb-8 md:mb-10 text-slate-800 leading-tight">
          Siap mengelola semuanya tanpa ribet?<br className="hidden sm:block" />
          <span className="sm:inline block mt-2">Mulai sekarang gratis!</span>
        </h2>

        <Button text="Daftar Sekarang" href="/sign-in" />
      </div>
    </section>
  );
}
