
import { getProfile } from '@/app/actions/profile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SettingsForm } from './settings-form';
import { ReferralCard } from './referral-card';

export default async function SettingsPage() {
    const profile = await getProfile();

    return (
      <div className="p-4 md:p-6 space-y-6">
        <header>
            <h1 className="text-2xl md:text-3xl font-bold font-headline">Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your account and preferences here.</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Update your personal information.</CardDescription>
                </CardHeader>
                <CardContent>
                    <SettingsForm profile={profile} />
                </CardContent>
            </Card>

            <div className="space-y-6">
                <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
                    <CardHeader>
                        <CardTitle>Subscription</CardTitle>
                        <CardDescription>Manage your billing and subscription plan.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold">Current Plan</p>
                                <p className="text-muted-foreground text-sm">
                                    {(profile?.pro_credits ?? 0) > 0 ? `Pro (Credit)` : (profile?.subscription_plan ?? 'Free')}
                                </p>
                            </div>
                            <p className="font-bold text-2xl text-primary">{profile?.subscription_plan === 'Pro' ? '$19/mo' : '$0/mo'}</p>
                        </div>
                         {(profile?.pro_credits ?? 0) > 0 && (
                            <p className="text-xs text-muted-foreground mt-2">You have {profile.pro_credits} month(s) of Pro credits remaining.</p>
                        )}
                    </CardContent>
                </Card>
                
                <ReferralCard profile={profile} />
            </div>
        </div>
      </div>
    );
}
