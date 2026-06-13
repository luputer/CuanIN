import HeaderLandingPage from "~/components/layout/header-landing";
import Footer from "~/components/layout/footer";
import HeroSection from "~/components/landing/hero-section";
import DashboardPreviewSection from "~/components/landing/dashboard-preview-section";
import ProblemSection from "~/components/landing/problem-section";
import FeaturesSection from "~/components/landing/features-section";
import HowItWorksSection from "~/components/landing/how-it-works-section";
import CtaSection from "~/components/landing/cta-section";

export default function FormateLanding() {
  return (
    <>
      <HeaderLandingPage buttonText="Login" buttonHref="/sign-in" />

      <main id="about" className="flex min-h-screen flex-col items-center justify-center bg-white text-slate-800 overflow-hidden">
        <HeroSection />
        <DashboardPreviewSection />
        <ProblemSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CtaSection />
        <Footer />
      </main>
    </>
  );
}