
import { redirect } from 'next/navigation';
import { DashboardStats } from "@/components/dashboard-stats";
import { getDocuments } from '@/app/actions/documents';
import { RecentUploads } from '@/components/recent-uploads';
import { createClient } from '@/lib/supabase/server';
import { getAppSettings } from '../actions/settings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdRenderer } from '@/components/ad-renderer';

export default async function AppPage() {
  const recentDocuments = await getDocuments();
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('subscription_plan, pro_credits, full_name').eq('id', user!.id).single();
  const settings = await getAppSettings();

  const isPro = profile?.subscription_plan === 'Pro' || (profile?.pro_credits ?? 0) > 0;
  const uploadLimitMb = isPro ? settings.upload_limit_mb_pro : settings.upload_limit_mb_free;
  
  const showMultiplexAd = !isPro && settings.feature_multiplex_ads_enabled && !!settings.multiplex_ad_code;

  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';


  const handleGetStarted = async () => {
    'use server';
    // Find the first document to start a chat with
    const documents = await getDocuments();
    if (documents.length > 0) {
      redirect(`/app/chat/${documents[0].id}`);
    } else {
      // If no documents, stay on the page (the UI will prompt to upload)
      // This could also redirect to /app/uploads
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 h-full flex flex-col">
      <h1 className="text-2xl md:text-3xl font-bold font-headline">
        Welcome <span className="text-primary">{firstName}</span> to Doc-Chat AI
      </h1>
      <DashboardStats />
       {showMultiplexAd && (
        <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
            <CardHeader>
                <CardTitle className="text-base font-semibold">Sponsored</CardTitle>
            </CardHeader>
            <CardContent>
                <AdRenderer adCode={settings.multiplex_ad_code} />
            </CardContent>
        </Card>
      )}
      <RecentUploads 
        documents={recentDocuments} 
        getStartedAction={handleGetStarted}
        uploadLimitMb={uploadLimitMb}
      />
    </div>
  );
}
