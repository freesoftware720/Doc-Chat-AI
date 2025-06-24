import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { PricingSection } from '@/components/landing/pricing-section';
import { FaqSection } from '@/components/landing/faq-section';

export default function LandingPage() {
  return (
    <>
      <div className="absolute inset-0 -z-10 h-full w-full bg-background">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] dark:opacity-20"></div>
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_50%,hsl(var(--primary)/0.1),transparent_30%),radial-gradient(circle_at_85%_30%,hsl(var(--accent)/0.1),transparent_30%)]"></div>
      </div>
      <main className="container px-4 md:px-6">
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <FaqSection />
      </main>
    </>
  );
}
