
import Link from 'next/link';
import { getProfile } from '@/app/actions/profile';
import { getAppSettings } from '@/app/actions/settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SettingsForm } from './settings-form';
import { ReferralCard } from './referral-card';
import { Button } from '@/components/ui/button';
import { DailyRewardCard } from './daily-reward-card';
import { ThemeSwitcher } from './theme-switcher';
import { AvatarUploader } from './avatar-uploader';
import { ChangePasswordForm } from './change-password-form';
import { createClient } from '@/lib/supabase/server';

export default async function SettingsPage() {
    const supabase = createClient();
    const profile = await getProfile();
    const settings = await getAppSettings();

    const isBasicUser = profile?.subscription_plan === 'Basic';
    const rewardEnabled = settings.feature_daily_reward_enabled;
    
    const { data: { publicUrl: avatarPublicUrl } } = supabase.storage.from('avatars').getPublicUrl(profile?.avatar_url || '');

    return (
      <div className="p-4 md:p-6 space-y-6">
        <header>
            <h1 className="text-2xl md:text-3xl font-bold font-headline">Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your account and preferences here.</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
                <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>Update your personal information.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <AvatarUploader profile={profile} publicUrl={avatarPublicUrl} />
                        </div>
                        <div className="md:col-span-2">
                           <SettingsForm profile={profile} />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>Update your account password.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChangePasswordForm />
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-1 space-y-6">
                <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
                    <CardHeader>
                        <CardTitle>Theme</CardTitle>
                        <CardDescription>Customize the look and feel of the application.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <ThemeSwitcher />
                    </CardContent>
                </Card>

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
                                    {(profile?.pro_credits ?? 0) > 0 ? `Pro (Credit)` : (profile?.subscription_plan ?? 'Basic')}
                                </p>
                            </div>
                            {profile?.subscription_plan !== 'Pro' ? (
                                <Button asChild>
                                    <Link href="/app/billing">Upgrade to Pro</Link>
                                </Button>
                            ) : (
                                 <Button asChild>
                                    <Link href="/app/billing">Manage Billing</Link>
                                </Button>
                            )}
                        </div>
                         {(profile?.pro_credits ?? 0) > 0 && (
                            <p className="text-xs text-muted-foreground mt-2">You have {profile.pro_credits} month(s) of Pro credits remaining.</p>
                        )}
                    </CardContent>
                </Card>
                
                {isBasicUser && rewardEnabled && (
                    <DailyRewardCard settings={settings} profile={profile} />
                )}

                <ReferralCard profile={profile} />
            </div>
        </div>
      </div>
    );
}
