
import { getDocuments } from '@/app/actions/documents';
import { UploadsClientPage } from './uploads-client-page';
import { createClient } from '@/lib/supabase/server';
import { getAppSettings } from '@/app/actions/settings';


export default async function UploadsPage() {
    const documents = await getDocuments();
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from('profiles').select('subscription_plan, pro_credits').eq('id', user!.id).single();
    const settings = await getAppSettings();

    const isPro = profile?.subscription_plan === 'Pro' || (profile?.pro_credits ?? 0) > 0;
    const uploadLimitMb = isPro ? settings.upload_limit_mb_pro : settings.upload_limit_mb_free;
    const isFreeUser = !isPro;
    const multiDocEnabled = settings.feature_multi_pdf_enabled;

    const adProps = {
        showInFeedAd: isFreeUser && settings.feature_in_feed_ads_enabled && !!settings.in_feed_ad_code,
        inFeedAdCode: settings.in_feed_ad_code,
    };

    return <UploadsClientPage documents={documents} uploadLimitMb={uploadLimitMb} adProps={adProps} isPro={isPro} multiDocEnabled={multiDocEnabled} />;
  }
