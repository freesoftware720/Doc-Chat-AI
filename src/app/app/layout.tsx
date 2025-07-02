
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { BannedUserPage } from "@/components/banned-user-page";
import { getAppSettings } from "../actions/settings";
import { AdProviderWrapper } from "@/components/ad-provider-wrapper";
import { AdRenderer } from "@/components/ad-renderer";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('status, ban_reason, subscription_plan, chat_credits_used, chat_credits_last_reset')
    .eq('id', user.id)
    .single();

  // If user is banned, show the banned page and stop rendering the app
  if (profile?.status === 'banned') {
    return (
      <BannedUserPage 
        reason={profile.ban_reason || "No reason was provided."} 
      />
    );
  }
  
  const appSettings = await getAppSettings();
  const creditLimit = appSettings.chat_limit_free_user;
  
  let creditsUsed = 0;
  const plan = profile?.subscription_plan ?? 'Free';

  if (plan === 'Free') {
    const lastReset = profile?.chat_credits_last_reset ? new Date(profile.chat_credits_last_reset) : new Date(0);
    const now = new Date();
    const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

    if (hoursSinceReset < 24) {
        creditsUsed = profile?.chat_credits_used || 0;
    }
    // If it's been more than 24 hours, creditsUsed remains 0, effectively resetting it for display.
  }

  const isFreeUser = !profile?.subscription_plan || profile.subscription_plan === 'Free';
  const adSettings = {
    videoAdCode: appSettings.video_ad_code,
    videoAdSkipTimer: appSettings.video_ad_skip_timer,
    adsEnabled: appSettings.feature_video_ads_enabled,
  };
  const showBannerAd = isFreeUser && appSettings.feature_banner_ads_enabled && appSettings.banner_ad_code;
  
  return (
    <AdProviderWrapper settings={adSettings} isFreeUser={isFreeUser}>
      <SidebarProvider>
        <AppSidebar 
          user={user} 
          plan={plan}
          creditsUsed={creditsUsed}
          creditLimit={creditLimit}
        />
        <SidebarInset className="flex flex-col h-screen overflow-hidden">
          <div className="absolute inset-0 -z-10 h-full w-full bg-background">
            <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-0 dark:opacity-20"></div>
            <div className="absolute inset-0 -z-20 overflow-hidden">
              <div className="absolute -left-40 -top-40 h-[40rem] w-[40rem] animate-gradient-move-1 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute -bottom-40 -right-40 h-[40rem] w-[40rem] animate-gradient-move-2 rounded-full bg-accent/10 blur-3xl" />
            </div>
          </div>
          <AppHeader />
          <div className="relative flex-1 overflow-y-auto pb-20 md:pb-0">
             {showBannerAd && (
              <div className="p-2 md:p-4 lg:p-6">
                  <div className="bg-card/60 backdrop-blur-md border border-white/10 rounded-lg p-2 flex justify-center">
                    <AdRenderer adCode={appSettings.banner_ad_code} />
                  </div>
              </div>
            )}
            {children}
          </div>
          <Toaster />
          <BottomNav />
        </SidebarInset>
      </SidebarProvider>
    </AdProviderWrapper>
  );
}
