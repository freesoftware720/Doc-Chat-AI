
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { createClient } from '@/lib/supabase/server';
import { HeroSection } from '@/components/landing/hero-section';
import { InteractiveDemoSection } from '@/components/landing/interactive-demo-section';
import { PricingSection } from '@/components/landing/pricing-section';
import { FaqSection } from '@/components/landing/faq-section';
import { getAppSettings } from './actions/settings';
import { getActivePlans } from './actions/billing';
import { LandingAnimations } from '@/components/landing/landing-animations';
import { ReviewsSection } from '@/components/landing/reviews-section';
import { getTopReviews } from './actions/reviews';
import { AnnouncementBanner } from '@/components/announcement-banner';

export default async function LandingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const settings = await getAppSettings();
  const plans = await getActivePlans();
  const reviews = await getTopReviews();
  const content = settings.landing_page_content as any;


  return (
    <>
      <AnnouncementBanner message={settings.homepage_announcement_message} />
      <LandingAnimations />
      <Header user={user} />
      <div className="flex-1 relative">
        <div className="absolute inset-0 -z-10 h-full w-full bg-background">
          <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-0 dark:opacity-20"></div>
          <div className="absolute inset-0 -z-20 overflow-hidden">
            <div className="absolute -left-40 -top-40 h-[40rem] w-[40rem] animate-gradient-move-1 animate-color-change-1 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -right-40 h-[40rem] w-[40rem] animate-gradient-move-2 animate-color-change-2 rounded-full blur-3xl" />
          </div>
        </div>
        <main>
          <HeroSection content={content?.hero} />
          <InteractiveDemoSection />
          <PricingSection plans={plans} />
          <ReviewsSection reviews={reviews} />
          <FaqSection content={content?.faq} />
        </main>
      </div>
      <Footer />
    </>
  );
}
