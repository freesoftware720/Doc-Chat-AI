
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { createClient } from '@/lib/supabase/server';
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { PricingSection } from '@/components/landing/pricing-section';
import { FaqSection } from '@/components/landing/faq-section';
import { getAppSettings } from './actions/settings';

export default async function LandingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const settings = await getAppSettings();
  const content = settings.landing_page_content as any;


  return (
    <>
      <Header user={user} />
      <div className="flex-1 relative">
        <div className="absolute inset-0 -z-10 h-full w-full bg-background">
          <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-0 dark:opacity-20"></div>
          <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_50%,hsl(var(--primary)/0.1),transparent_30%),radial-gradient(circle_at_85%_30%,hsl(var(--accent)/0.1),transparent_30%)]"></div>
        </div>
        <main className="container px-4 md:px-6">
          <HeroSection content={content?.hero} />
          <FeaturesSection content={content?.features} />
          <PricingSection content={content?.pricing} />
          <FaqSection content={content?.faq} />
        </main>
      </div>
      <Footer />
    </>
  );
}
