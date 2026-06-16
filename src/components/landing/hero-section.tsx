import Image from "next/image";
import Button from "~/components/shared/buttonlogin";
import Figure6 from "public/assets/Figure6.png";

export default function HeroSection() {
  return (
    <section className="relative mt-30 max-w-7xl mx-auto px-6 text-center">
      <div className="absolute top-25 left-[-130px] w-20 h-auto transform -translate-y-1/2">
        <Image src={Figure6} alt="Figure 8" className="w-full h-auto object-contain" />
      </div>

      <div className="absolute top-40 right-[-120px] w-20 h-auto transform -translate-y-1/2">
        <Image src={Figure6} alt="Figure 12" className="w-full h-auto object-contain" />
      </div>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-slate-800 leading-tight">
        Jual Webinar, Kelas dan Produk Digital
      </h1>
      <span className="text-3xl sm:text-4xl md:text-5xl font-semibold text-slate-800 leading-tight">
        Tanpa Ribet!
      </span>
      <p className="text-lg md:text-xl text-slate-600 mt-4 mb-10 max-w-5xl mx-auto">
        Buat form pendaftaran, jual produk, terima pembayaran - semua dalam satu platform.
      </p>
      <div className="mb-10">
        <Button text="Mulai Gratis" href="/sign-in" />
      </div>
    </section>
  );
}
