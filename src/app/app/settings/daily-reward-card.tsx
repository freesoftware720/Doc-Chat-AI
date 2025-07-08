
'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { claimDailyReward } from '@/app/actions/rewards';
import type { AppSettings } from '@/app/actions/settings';
import type { ProfileWithEmail } from '@/app/actions/profile';
import { CheckCircle, Gift, Loader2, MousePointerClick } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function getTodaysStorageKey() {
    const today = new Date().toISOString().split('T')[0];
    return `daily-reward-clicks-${today}`;
}

function ClaimButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full mt-4">
            {pending ? <Loader2 className="animate-spin" /> : "Claim Daily Reward"}
        </Button>
    )
}

export function DailyRewardCard({ settings, profile }: { settings: AppSettings, profile: ProfileWithEmail | null }) {
    const { toast } = useToast();
    const [state, formAction] = useActionState(claimDailyReward, null);
    
    const requiredClicks = settings.daily_reward_clicks_required;
    const rewardLink = settings.daily_reward_link;
    const storageKey = getTodaysStorageKey();
    
    const [clicks, setClicks] = useState(0);
    const [isClaimedToday, setIsClaimedToday] = useState(false);

    // Initialize state from local storage and profile data
    useEffect(() => {
        if (!profile) return;

        // Check if reward was already claimed from server
        const lastClaimed = profile.last_daily_reward_claimed_at ? new Date(profile.last_daily_reward_claimed_at) : null;
        if (lastClaimed) {
            const now = new Date();
            const hoursSinceLastClaim = (now.getTime() - lastClaimed.getTime()) / (1000 * 60 * 60);
            if (hoursSinceLastClaim < 24) {
                setIsClaimedToday(true);
                return;
            }
        }

        // Get clicks for today from local storage
        const savedClicks = localStorage.getItem(storageKey);
        setClicks(savedClicks ? parseInt(savedClicks, 10) : 0);

    }, [profile, storageKey]);

    useEffect(() => {
        if (state?.success) {
            toast({ title: "Success", description: state.success });
            setIsClaimedToday(true); // Mark as claimed for this session
            localStorage.removeItem(storageKey); // Clean up storage
        }
        if (state?.error) {
            toast({ variant: "destructive", title: "Error", description: state.error });
            if (state.error.includes("already claimed")) {
                setIsClaimedToday(true);
            }
        }
    }, [state, toast, storageKey]);

    const handleLinkClick = () => {
        if (!rewardLink || clicks >= requiredClicks || isClaimedToday) return;

        window.open(rewardLink, '_blank', 'noopener,noreferrer');
        const newClicks = clicks + 1;
        setClicks(newClicks);
        localStorage.setItem(storageKey, newClicks.toString());
    };
    
    if (!rewardLink) return null;

    const clicksCompleted = clicks >= requiredClicks;
    const progressPercent = Math.min((clicks / requiredClicks) * 100, 100);

    return (
        <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Gift className="h-6 w-6 text-primary" />
                    Daily Reward
                </CardTitle>
                <CardDescription>
                    Reset your daily message limit for free!
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isClaimedToday ? (
                     <div className="text-center py-4 flex flex-col items-center gap-2 text-green-500">
                        <CheckCircle className="h-12 w-12" />
                        <p className="font-semibold mt-2">Reward Claimed!</p>
                        <p className="text-sm text-muted-foreground">Come back tomorrow for another one.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Click the link <strong>{requiredClicks} times</strong> to become eligible for the reward.
                        </p>
                        
                        <div className="space-y-2">
                            <Progress value={progressPercent} />
                            <p className="text-xs text-muted-foreground text-center">Progress: {clicks} / {requiredClicks} clicks</p>
                        </div>

                        <Button onClick={handleLinkClick} disabled={clicksCompleted} className="w-full" variant="outline">
                            <MousePointerClick className="mr-2 h-4 w-4" />
                            Click the Link
                        </Button>

                        {clicksCompleted && (
                            <form action={formAction}>
                                <ClaimButton />
                            </form>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

