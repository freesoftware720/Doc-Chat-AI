
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function claimDailyReward() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in to claim a reward.' };
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('last_daily_reward_claimed_at, subscription_plan')
        .eq('id', user.id)
        .single();
    
    if (!profile) {
        return { error: 'Profile not found.' };
    }

    if (profile.subscription_plan !== 'Basic') {
        return { error: 'This reward is only available to users on the Basic plan.' };
    }

    const lastClaimed = profile.last_daily_reward_claimed_at ? new Date(profile.last_daily_reward_claimed_at) : null;
    if (lastClaimed) {
        const now = new Date();
        const hoursSinceLastClaim = (now.getTime() - lastClaimed.getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastClaim < 24) {
            return { error: 'You have already claimed your daily reward. Please try again tomorrow.' };
        }
    }
    
    // Reset their chat credits for the day
    const { error: updateError } = await supabase
        .from('profiles')
        .update({
            chat_credits_used: 0,
            chat_credits_last_reset: new Date().toISOString(), // also reset the 24h timer for normal usage
            last_daily_reward_claimed_at: new Date().toISOString(),
        })
        .eq('id', user.id);

    if (updateError) {
        console.error("Error claiming daily reward:", updateError);
        return { error: 'Could not claim your reward. Please try again.' };
    }
    
    revalidatePath('/app/settings');
    revalidatePath('/app'); // For sidebar credits display
    
    return { success: 'Reward claimed! Your daily message limit has been reset.' };
  } catch (e: any) {
    console.error('Claim daily reward action failed:', e);
    return { error: `An unexpected error occurred: ${e.message}` };
  }
}
