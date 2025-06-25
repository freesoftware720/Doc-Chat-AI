
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
    ] = await Promise.all([
        serviceSupabase.from('profiles').select('*', { count: 'exact', head: true }),
        serviceSupabase.from('documents').select('*', { count: 'exact', head: true }),
        serviceSupabase.from('messages').select('*', { count: 'exact', head: true }),
        serviceSupabase.from('workspaces').select('*', { count: 'exact', head: true }),
    ]);

    if (userError || docError || msgError || wsError) {
        console.error({ userError, docError, msgError, wsError });
        throw new Error("Failed to fetch super admin dashboard stats.");
    }
    
    return {
        users: userCount ?? 0,
        documents: docCount ?? 0,
        messages: msgCount ?? 0,
        workspaces: wsCount ?? 0,
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

