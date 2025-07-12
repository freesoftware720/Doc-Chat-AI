
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Tables } from '@/lib/supabase/database.types';

export type ProfileWithEmail = Tables<'profiles'> & { email?: string };

export async function getProfile(): Promise<ProfileWithEmail | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }

    return {
        ...profile,
        email: user.email,
    };
}

export async function getDashboardStats() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { documents: 0, chats: 0, plan: 'Basic' };
    }

    // Run all data fetches in parallel for performance
    const profilePromise = supabase
        .from('profiles')
        .select('subscription_plan, pro_credits')
        .eq('id', user.id)
        .single();

    const docsCountPromise = supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

    // This correctly gets the number of distinct chat sessions.
    const chatsPromise = supabase.rpc('get_user_chat_history');

    const [
        { data: profile, error: profileError },
        { count: documentsCount, error: docsError },
        { data: chatHistory, error: chatsError },
    ] = await Promise.all([profilePromise, docsCountPromise, chatsPromise]);


    if (profileError || docsError || chatsError) {
        console.error({ profileError, docsError, chatsError });
    }

    const currentPlan = (profile?.pro_credits ?? 0) > 0 ? 'Pro (Credit)' : (profile?.subscription_plan ?? 'Basic');

    return {
        documents: documentsCount ?? 0,
        chats: chatHistory?.length ?? 0,
        plan: currentPlan
    };
}


export async function updateProfile(prevState: any, formData: FormData) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in to update your profile.' };
    }
    
    const fullName = formData.get('fullName') as string;

    const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);

    if (error) {
        return { error: 'Could not update profile. Please try again.' };
    }

    revalidatePath('/app/settings');
    return { success: 'Profile updated successfully.' };
  } catch (e: any) {
    console.error('Update profile action failed:', e);
    return { error: `An unexpected error occurred: ${e.message}` };
  }
}

export async function updatePassword(prevState: any, formData: FormData) {
    try {
        const supabase = createClient();
        const password = formData.get('password') as string;

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            return { error: `Could not update password: ${error.message}` };
        }

        revalidatePath('/app/settings');
        return { success: 'Password updated successfully.' };
    } catch (e: any) {
        console.error('Update password action failed:', e);
        return { error: `An unexpected error occurred: ${e.message}` };
    }
}

export async function updateAvatarUrl(prevState: any, formData: FormData) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { error: 'You must be logged in.' };
        }

        const avatarUrl = formData.get('avatarUrl') as string;
        
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ avatar_url: avatarUrl })
            .eq('id', user.id);

        if (profileError) {
            return { error: 'Could not update avatar. Please try again.' };
        }

        revalidatePath('/app', 'layout'); // Revalidate layout to update avatar in sidebar
        return { success: 'Avatar updated successfully.' };
    } catch (e: any) {
        console.error('Update avatar URL action failed:', e);
        return { error: `An unexpected error occurred: ${e.message}` };
    }
}
