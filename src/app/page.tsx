import HeaderLandingPage from "~/components/layout/header-landing";
import Footer from "~/components/layout/footer";
import HeroSection from "~/components/landing/hero-section";
import ProblemSection from "~/components/landing/problem-section";
import FeaturesSection from "~/components/landing/features-section";
import HowItWorksSection from "~/components/landing/how-it-works-section";
import CtaSection from "~/components/landing/cta-section";
import { FadeIn } from "~/components/ui/fade-in";

export default function FormateLanding() {
  return (
    <>
      <HeaderLandingPage buttonText="Login" buttonHref="/sign-in" />

      <main id="about" className="flex min-h-screen flex-col items-center justify-center bg-white text-slate-800 overflow-hidden">
        <FadeIn className="w-full relative z-50">
          <HeroSection />
        </FadeIn>
        
        <FadeIn className="w-full relative z-40">
          <ProblemSection />
        </FadeIn>
        
        <FadeIn className="w-full relative z-30">
          <FeaturesSection />
        </FadeIn>
        
        <FadeIn className="w-full">
          <HowItWorksSection />
        </FadeIn>
        
        <FadeIn className="w-full">
          <CtaSection />
        </FadeIn>
        
        <FadeIn className="w-full" direction="none">
          <Footer />
        </FadeIn>
      </main>
    </>
  );
}
