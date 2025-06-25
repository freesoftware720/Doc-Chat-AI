
'use server';

import { createClient } from '@/lib/supabase/server';
import { serviceSupabase } from '@/lib/supabase/service';
import { revalidatePath } from 'next/cache';

export async function isSuperAdmin() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const superAdminEmails = (process.env.SUPER_ADMIN_EMAILS || '').split(',');
    return superAdminEmails.includes(user.email || '');
}

export async function getSuperAdminDashboardStats() {
    if (!serviceSupabase) throw new Error("Service client not initialized.");
    
    const [
        { count: userCount, error: userError },
        { count: docCount, error: docError },
        { count: msgCount, error: msgError },
        { count: wsCount, error: wsError },
        { count: refCount, error: refError },
    ] = await Promise.all([
        serviceSupabase.from('profiles').select('*', { count: 'exact', head: true }),
        serviceSupabase.from('documents').select('*', { count: 'exact', head: true }),
        serviceSupabase.from('messages').select('*', { count: 'exact', head: true }),
        serviceSupabase.from('workspaces').select('*', { count: 'exact', head: true }),
        serviceSupabase.from('referrals').select('*', { count: 'exact', head: true }),
    ]);

    if (userError || docError || msgError || wsError || refError) {
        console.error({ userError, docError, msgError, wsError, refError });
        throw new Error("Failed to fetch super admin dashboard stats.");
    }
    
    return {
        users: userCount ?? 0,
        documents: docCount ?? 0,
        messages: msgCount ?? 0,
        workspaces: wsCount ?? 0,
        referrals: refCount ?? 0,
    };
}


export async function getAllUsersWithDetails() {
    if (!serviceSupabase) throw new Error("Service client not initialized.");

    const { data: users, error: usersError } = await serviceSupabase.auth.admin.listUsers();
    if (usersError) throw new Error(`Failed to fetch users: ${usersError.message}`);

    const { data: profiles, error: profilesError } = await serviceSupabase
        .from('profiles')
        .select('*');
    if (profilesError) throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
    
    const { data: messageCounts, error: messagesError } = await serviceSupabase
        .from('messages')
        .select('user_id', { count: 'exact' });
        
    // This is not efficient on large datasets, but works for this example.
    // A better approach would be a GROUP BY query in a database function.
    const messageCountMap = (messageCounts as any[]).reduce((acc, { user_id, count }) => {
        if (user_id) acc[user_id] = (acc[user_id] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);


    const profilesMap = new Map(profiles.map(p => [p.id, p]));

    return users.users.map(user => {
        const profile = profilesMap.get(user.id);
        return {
            id: user.id,
            email: user.email,
            created_at: user.created_at,
            last_sign_in_at: user.last_sign_in_at,
            full_name: profile?.full_name,
            subscription_plan: profile?.subscription_plan,
            status: profile?.status,
            message_count: messageCountMap[user.id] || 0,
        };
    });
}

export type UserWithDetails = Awaited<ReturnType<typeof getAllUsersWithDetails>>[0];


export async function updateUserPlan(prevState: any, formData: FormData) {
    if (!serviceSupabase) return { error: "Service client not initialized." };
    if (!(await isSuperAdmin())) return { error: "Permission denied." };
    
    const userId = formData.get('userId') as string;
    const plan = formData.get('plan') as string;

    const { error } = await serviceSupabase
        .from('profiles')
        .update({ subscription_plan: plan })
        .eq('id', userId);

    if (error) {
        return { error: `Failed to update plan: ${error.message}` };
    }

    revalidatePath('/super-admin/users');
    return { success: 'User plan updated successfully.' };
}

export async function updateUserStatus(prevState: any, formData: FormData) {
    if (!serviceSupabase) return { error: "Service client not initialized." };
    if (!(await isSuperAdmin())) return { error: "Permission denied." };

    const userId = formData.get('userId') as string;
    const status = formData.get('status') as string;

    const { error } = await serviceSupabase
        .from('profiles')
        .update({ status })
        .eq('id', userId);

    if (error) {
        return { error: `Failed to update status: ${error.message}` };
    }

    revalidatePath('/super-admin/users');
    return { success: `User status set to ${status}.` };
}

export async function getAllReferralDetails() {
    if (!serviceSupabase) throw new Error("Service client not initialized.");

    // Fetch referrals without ordering to make the query as simple as possible.
    const { data: referrals, error: referralsError } = await serviceSupabase
        .from('referrals')
        .select(`created_at, referrer_id, referred_id`);

    if (referralsError) {
        console.error('Error fetching referrals:', referralsError);
        throw new Error('Failed to fetch referrals.');
    }
    if (!referrals || referrals.length === 0) {
        return [];
    }

    const userIds = new Set(referrals.map(r => r.referrer_id).concat(referrals.map(r => r.referred_id)));
    if (userIds.size === 0) return [];
    
    const { data: profiles, error: profilesError } = await serviceSupabase
        .from('profiles')
        .select('id, full_name')
        .in('id', Array.from(userIds));

    if (profilesError) {
        console.error('Error fetching profiles for referrals:', profilesError);
        throw new Error('Failed to fetch profiles for referrals.');
    }
    const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

    const { data: { users }, error: usersError } = await serviceSupabase.auth.admin.listUsers();
    if (usersError) throw new Error('Failed to fetch user emails for referrals');
    const emailMap = new Map(users.map(u => [u.id, u.email]));
    
    // Perform sorting in the application code instead of the database.
    const sortedReferrals = referrals.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return sortedReferrals.map(r => {
        const referrerProfile = profilesMap.get(r.referrer_id);
        const referredProfile = profilesMap.get(r.referred_id);
        
        return {
            created_at: r.created_at,
            referrer_name: referrerProfile?.full_name || 'N/A',
            referrer_email: emailMap.get(r.referrer_id) || 'N/A',
            referred_name: referredProfile?.full_name || 'N/A',
            referred_email: emailMap.get(r.referred_id) || 'N/A',
        }
    });
}


export type ReferralWithDetails = Awaited<ReturnType<typeof getAllReferralDetails>>[0];
