import { type Metadata } from "next";
import HeaderLandingPage from "~/components/layout/header-landing";
import Footer from "~/components/layout/footer";
import HeroSection from "~/components/landing/hero-section";
import DashboardPreviewSection from "~/components/landing/dashboard-preview-section";
import ProblemSection from "~/components/landing/problem-section";
import FeaturesSection from "~/components/landing/features-section";
import HowItWorksSection from "~/components/landing/how-it-works-section";
import CtaSection from "~/components/landing/cta-section";
import FAQSection from "~/components/landing/faq-section";
import { faqJsonLd } from "~/lib/seo";

export const metadata: Metadata = {
  title: "CuanIN - Jual Produk Digital, Webinar & Kelas Online",
  description:
    "Platform untuk kreator menjual produk digital, webinar, dan kelas online. Buat katalog, terima pembayaran otomatis, dan kirim produk ke pembeli tanpa ribet.",
  keywords: [
    "jual produk digital",
    "platform webinar",
    "kelas online",
    "toko online",
    "produk digital indonesia",
    "jual ebook online",
    "platform kreator",
    "monetisasi konten",
    "pembayaran digital",
    "cuanin",
  ],
  openGraph: {
    title: "CuanIN - Jual Produk Digital, Webinar & Kelas Online",
    description:
      "Buat toko produk digital kamu sendiri. Terima pembayaran otomatis dan kirim produk ke pembeli tanpa ribet.",
    url: "/",
    siteName: "CuanIN",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CuanIN - Jual Produk Digital, Webinar & Kelas Online",
    description:
      "Buat toko produk digital kamu sendiri. Terima pembayaran otomatis dan kirim produk ke pembeli tanpa ribet.",
  },
  alternates: {
    canonical: "/",
  },
};

export default function FormateLanding() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <HeaderLandingPage buttonText="Login" buttonHref="/sign-in" />

      <main id="about" className="flex min-h-screen flex-col items-center justify-center bg-white text-slate-800 overflow-hidden">
        <HeroSection />
        <DashboardPreviewSection />
        <ProblemSection />
        <FeaturesSection />
        <HowItWorksSection />
        <FAQSection />
        <CtaSection />
        <Footer />
      </main>
    </>
  );
}
