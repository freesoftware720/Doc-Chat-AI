
'use server';

import { createClient } from '@/lib/supabase/server';
import type { TablesInsert } from '@/lib/supabase/database.types';
import { revalidatePath } from 'next/cache';

export async function createSubscriptionRequest(prevState: any, formData: FormData) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in to make a subscription request.' };
    }

    const rawData = {
        plan_id: parseInt(formData.get('planId') as string, 10),
        payment_gateway_id: parseInt(formData.get('gatewayId') as string, 10),
        transaction_id: formData.get('transactionId') as string,
    };
    
    if (!rawData.plan_id || !rawData.payment_gateway_id || !rawData.transaction_id) {
        return { error: 'Missing required fields for subscription request.' };
    }
    
    // Check if there is already a pending request
    const { data: existingRequest, error: existingError } = await supabase
        .from('subscription_requests')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .single();
    
    if (existingRequest) {
        return { error: 'You already have a pending subscription request. Please wait for it to be reviewed.' };
    }

    const requestToInsert: TablesInsert<'subscription_requests'> = {
        user_id: user.id,
        plan_id: rawData.plan_id,
        payment_gateway_id: rawData.payment_gateway_id,
        transaction_id: rawData.transaction_id,
    };

    const { error } = await supabase.from('subscription_requests').insert(requestToInsert);

    if (error) {
        console.error("Error creating subscription request:", error.message);
        return { error: `Failed to submit request: ${error.message}` };
    }

    revalidatePath('/app/billing');
    return { success: 'Your subscription request has been submitted for review.' };
  } catch (e: any) {
    console.error('Create subscription request action failed:', e);
    return { error: `An unexpected error occurred: ${e.message}` };
  }
}


export async function getUserSubscriptionStatus() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {
            profile: null,
            latestRequest: null,
            hasPendingRequest: false,
        };
    }
    
    const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
    const requestPromise = supabase
        .from('subscription_requests')
        .select('*, plans(*), payment_gateways(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(); // Use maybeSingle to not error if no request is found

    const [{data: profile}, {data: latestRequest}] = await Promise.all([profilePromise, requestPromise]);
    
    return {
        profile,
        latestRequest,
        hasPendingRequest: latestRequest?.status === 'pending',
    };
}

export async function cancelSubscription(prevState: any, formData: FormData) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in to cancel your subscription.' };
    }

    // Downgrade to Free plan and reset any referral credits.
    const { error } = await supabase
        .from('profiles')
        .update({ subscription_plan: 'Free', pro_credits: 0 })
        .eq('id', user.id);

    if (error) {
        console.error("Error canceling subscription:", error.message);
        return { error: 'Failed to cancel your subscription. Please contact support.' };
    }

    revalidatePath('/app/billing', 'page');
    revalidatePath('/app/settings', 'page');
    revalidatePath('/app', 'layout');
    
    return { success: 'Your subscription has been successfully canceled. You are now on the Free plan.' };

  } catch (e: any) {
    console.error('Cancel subscription action failed:', e);
    return { error: `An unexpected error occurred: ${e.message}` };
  }
}
    
