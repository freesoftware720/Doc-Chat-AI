
import { getProfile } from '@/app/actions/profile';
import { ReferralCard } from '../settings/referral-card';

export default async function AffiliatePage() {
    const profile = await getProfile();

    return (
      <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto">
        <header>
            <h1 className="text-2xl md:text-3xl font-bold font-headline">Affiliate Program</h1>
            <p className="text-muted-foreground mt-1">Invite friends and earn free Pro credits for each successful sign-up.</p>
        </header>
        <ReferralCard profile={profile} />
      </div>
    );
}
