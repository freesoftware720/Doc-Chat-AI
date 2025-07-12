
import { redirect } from 'next/navigation';
import { DashboardStats } from "@/components/dashboard-stats";
import { getDocuments } from '@/app/actions/documents';
import { RecentUploads } from '@/components/recent-uploads';
import { createClient } from '@/lib/supabase/server';
import { getAppSettings } from '../actions/settings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdRenderer } from '@/components/ad-renderer';

export default async function AppPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const [recentDocuments, profileResult, settings] = await Promise.all([
    getDocuments(),
    supabase.from('profiles').select('subscription_plan, pro_credits, full_name').eq('id', user.id).single(),
    getAppSettings()
  ]);

  const profile = profileResult.data;
  
  const isPro = profile?.subscription_plan === 'Pro' || (profile?.pro_credits ?? 0) > 0;
  const isStudent = profile?.subscription_plan === 'Student';
  const isBasicUser = profile?.subscription_plan === 'Basic' || !profile?.subscription_plan; // Default to basic if no plan
  
  const uploadLimitMb = isPro || isStudent ? settings.upload_limit_mb_pro : settings.upload_limit_mb_free;
  
  const showBannerAd = isBasicUser && settings.feature_banner_ads_enabled && !!settings.banner_ad_code;
  const showMultiplexAd = isBasicUser && settings.feature_multiplex_ads_enabled && !!settings.multiplex_ad_code;
  const shouldShowAds = showBannerAd || showMultiplexAd;

  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';

  const handleGetStarted = async () => {
    'use server';
    const documents = await getDocuments();
    if (documents.length > 0) {
      redirect(`/app/chat/${documents[0].id}`);
    } else {
      // Stay on page
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold font-headline">
        Welcome <span className="text-primary">{firstName}</span> to Doc-Chat AI
      </h1>
      
      <DashboardStats />
      
      {shouldShowAds && (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-muted-foreground ml-1">Sponsored Content</h2>
          {showBannerAd && (
            <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
                <CardContent className="p-2">
                    <AdRenderer adCode={settings.banner_ad_code} />
                </CardContent>
            </Card>
          )}
          {showMultiplexAd && (
            <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
                <CardContent className="p-4">
                    <AdRenderer adCode={settings.multiplex_ad_code} />
                </CardContent>
            </Card>
          )}
        </div>
      )}

      <RecentUploads 
        documents={recentDocuments} 
        getStartedAction={handleGetStarted}
        uploadLimitMb={uploadLimitMb}
      />
    </div>
  );
}
