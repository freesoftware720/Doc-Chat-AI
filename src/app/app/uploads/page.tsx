
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
    const isStudent = profile?.subscription_plan === 'Student';
    const uploadLimitMb = isPro || isStudent ? settings.upload_limit_mb_pro : settings.upload_limit_mb_free;
    const multiDocEnabled = settings.feature_multi_pdf_enabled;

    return <UploadsClientPage documents={documents} uploadLimitMb={uploadLimitMb} isPro={isPro} isStudent={isStudent} multiDocEnabled={multiDocEnabled} />;
  }
