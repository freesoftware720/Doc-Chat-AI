

'use server';

import { createClient } from '@/lib/supabase/server';
import { serviceSupabase } from '@/lib/supabase/service';
import { revalidatePath } from 'next/cache';
import type { TablesUpdate, TablesInsert } from '@/lib/supabase/database.types';

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
        { count: refCount, error: refError },
    ] = await Promise.all([
        serviceSupabase.from('profiles').select('*', { count: 'exact', head: true }),
        serviceSupabase.from('documents').select('*', { count: 'exact', head: true }),
        serviceSupabase.from('messages').select('*', { count: 'exact', head: true }),
        serviceSupabase.from('referrals').select('*', { count: 'exact', head: true }),
    ]);

    if (userError || docError || msgError || refError) {
        console.error({ userError, docError, msgError, refError });
        throw new Error("Failed to fetch super admin dashboard stats.");
    }
    
    return {
        users: userCount ?? 0,
        documents: docCount ?? 0,
        messages: msgCount ?? 0,
        referrals: refCount ?? 0,
    };
}

export async function getAnalyticsData() {
    if (!serviceSupabase) throw new Error("Service client not initialized.");

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
        { data: planData, error: planError },
        { data: messagesData, error: messagesError }
    ] = await Promise.all([
        serviceSupabase.from('profiles').select('subscription_plan'),
        serviceSupabase.from('messages').select('created_at').gte('created_at', thirtyDaysAgo.toISOString())
    ]);
    
    if (planError || messagesError) {
        console.error({ planError, messagesError });
        throw new Error("Failed to fetch analytics data.");
    }

    // Process plan distribution
    const planDistribution = (planData || []).reduce((acc, { subscription_plan }) => {
        const plan = subscription_plan || 'Free';
        acc[plan] = (acc[plan] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    
    const planChartData = Object.entries(planDistribution).map(([name, value]) => ({ name, value, fill: `var(--color-${name.toLowerCase()})` }));

    // Process daily messages
    const dailyMessagesMap = (messagesData || []).reduce((acc, { created_at }) => {
        const date = new Date(created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Ensure we have entries for all days in the last 30 days for a complete graph
    const messageChartData = [];
    for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        messageChartData.push({
            date: dateString,
            "Messages": dailyMessagesMap[dateString] || 0,
        });
    }

    return { 
        planChartData, 
        messageChartData: messageChartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    };
}


export async function getAllUsersWithDetails() {
    if (!serviceSupabase) throw new Error("Service client not initialized.");

    const { data: { users }, error: usersError } = await serviceSupabase.auth.admin.listUsers({ perPage: 1000 });
    if (usersError) throw new Error(`Failed to fetch users: ${usersError.message}`);

    const { data: profiles, error: profilesError } = await serviceSupabase
        .from('profiles')
        .select('*');
    if (profilesError) throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
    
    // Note: This is not efficient for large numbers of messages.
    // A better approach is a database function (RPC) to perform the aggregation.
    const { data: allMessages, error: messagesError } = await serviceSupabase
        .from('messages')
        .select('user_id');

    if (messagesError) throw new Error(`Failed to fetch messages for count: ${messagesError.message}`);
    
    const messageCountMap = (allMessages || []).reduce((acc, { user_id }) => {
        if (user_id) {
            acc[user_id] = (acc[user_id] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);


    const profilesMap = new Map(profiles.map(p => [p.id, p]));

    return users.map(user => {
        const profile = profilesMap.get(user.id);
        return {
            id: user.id,
            email: user.email,
            created_at: user.created_at,
            last_sign_in_at: user.last_sign_in_at,
            full_name: profile?.full_name,
            subscription_plan: profile?.subscription_plan,
            status: profile?.status,
            ban_reason: profile?.ban_reason,
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

    revalidatePath('/app/super-admin/users');
    return { success: 'User plan updated successfully.' };
}

export async function updateUserStatus(prevState: any, formData: FormData) {
    if (!serviceSupabase) return { error: "Service client not initialized." };
    if (!(await isSuperAdmin())) return { error: "Permission denied." };

    const userId = formData.get('userId') as string;
    const status = formData.get('status') as string;
    const banReason = formData.get('banReason') as string | null;

    const dataToUpdate: TablesUpdate<'profiles'> = {
      status: status,
    };

    if (status === 'banned') {
      dataToUpdate.ban_reason = banReason;
      dataToUpdate.banned_at = new Date().toISOString();
    } else {
      dataToUpdate.ban_reason = null;
      dataToUpdate.banned_at = null;
    }

    const { error } = await serviceSupabase
      .from('profiles')
      .update(dataToUpdate)
      .eq('id', userId);

    if (error) {
        return { error: `Failed to update status: ${error.message}` };
    }

    revalidatePath('/app/super-admin/users');
    return { success: `User status set to ${status}.` };
}

export async function getAllReferralDetails() {
    if (!serviceSupabase) throw new Error("Service client not initialized.");

    // 1. Fetch all referrals.
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

    // 2. Collect all unique user IDs from the referrals.
    const userIds = new Set<string>();
    referrals.forEach(r => {
        userIds.add(r.referrer_id);
        userIds.add(r.referred_id);
    });

    if (userIds.size === 0) {
        return [];
    }
    const uniqueUserIds = Array.from(userIds);

    // 3. Fetch all relevant profiles in one go.
    const { data: profiles, error: profilesError } = await serviceSupabase
        .from('profiles')
        .select('id, full_name')
        .in('id', uniqueUserIds);

    if (profilesError) {
        console.error('Error fetching profiles for referrals:', profilesError);
        throw new Error('Failed to fetch profiles for referrals.');
    }
    const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);
    
    // 4. Fetch all user emails in one go.
    const { data: { users }, error: usersError } = await serviceSupabase.auth.admin.listUsers({ perPage: 1000 });
    if (usersError) {
        throw new Error('Failed to fetch user emails for referrals');
    }
    const emailMap = new Map(users.map(u => [u.id, u.email]));
    
    // 5. Combine the data.
    const combinedDetails = referrals.map(r => {
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

    // 6. Sort in the application code.
    return combinedDetails.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export type ReferralWithDetails = Awaited<ReturnType<typeof getAllReferralDetails>>[0];

export async function getConversionFunnelData() {
    if (!serviceSupabase) throw new Error("Service client not initialized.");

    const [
        { count: signedUpCount, error: usersError },
        { data: docUsers, error: docUsersError },
        { data: msgUsers, error: msgUsersError },
        { count: proCount, error: proError },
    ] = await Promise.all([
        serviceSupabase.from('profiles').select('*', { count: 'exact', head: true }),
        serviceSupabase.from('documents').select('user_id'),
        serviceSupabase.from('messages').select('user_id'),
        serviceSupabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_plan', 'Pro'),
    ]);

    if (usersError || docUsersError || msgUsersError || proError) {
        console.error({ usersError, docUsersError, msgUsersError, proError });
        throw new Error("Failed to fetch conversion funnel data.");
    }
    
    const uploadedFirstDocCount = new Set((docUsers || []).map(u => u.user_id)).size;
    const startedFirstChatCount = new Set((msgUsers || []).map(u => u.user_id)).size;

    return {
        signedUp: signedUpCount ?? 0,
        uploadedFirstDoc: uploadedFirstDocCount,
        startedFirstChat: startedFirstChatCount,
        subscribedToPro: proCount ?? 0,
    };
}

export type ConversionFunnelData = Awaited<ReturnType<typeof getConversionFunnelData>>;


// --- Document Management Actions ---

export async function getAllDocumentsWithDetails() {
    if (!serviceSupabase) throw new Error("Service client not initialized.");

    const { data: documents, error: docsError } = await serviceSupabase
        .from('documents')
        .select('*');
    if (docsError) throw new Error(`Failed to fetch documents: ${docsError.message}`);

    const userIds = [...new Set(documents.map(d => d.user_id))];
    if (userIds.length === 0) return [];

    const { data: { users }, error: usersError } = await serviceSupabase.auth.admin.listUsers({ perPage: 1000 });
    if (usersError) throw new Error(`Failed to fetch users: ${usersError.message}`);

    const userMap = new Map(users.map(u => [u.id, { email: u.email, fullName: u.user_metadata.full_name }]));

    return documents.map(doc => ({
        ...doc,
        user_email: userMap.get(doc.user_id)?.email || 'Unknown User',
        user_full_name: userMap.get(doc.user_id)?.fullName || 'N/A',
    })).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export type DocumentWithUserDetails = Awaited<ReturnType<typeof getAllDocumentsWithDetails>>[0];

export async function deleteDocumentAsAdmin(prevState: any, formData: FormData) {
    if (!serviceSupabase) return { error: "Service client not initialized." };
    if (!(await isSuperAdmin())) return { error: "Permission denied." };
    
    const documentId = formData.get('documentId') as string;
    
    const { data: doc, error: fetchError } = await serviceSupabase
        .from('documents')
        .select('storage_path, name')
        .eq('id', documentId)
        .single();

    if (fetchError || !doc) {
        return { error: 'Document not found.' };
    }
    
    // Delete from storage
    const { error: storageError } = await serviceSupabase.storage
        .from('documents')
        .remove([doc.storage_path]);

    if (storageError) {
        console.error("Admin delete: Storage deletion failed", storageError);
    }

    // Delete from database
    const { error: dbError } = await serviceSupabase
        .from('documents')
        .delete()
        .eq('id', documentId);
    
    if (dbError) {
        return { error: 'Failed to delete document from database.' };
    }

    revalidatePath('/app/super-admin/documents');
    return { success: `Document "${doc.name}" deleted successfully.` };
}

export async function transferDocumentOwnership(prevState: any, formData: FormData) {
    if (!serviceSupabase) return { error: "Service client not initialized." };
    if (!(await isSuperAdmin())) return { error: "Permission denied." };
    
    const documentId = formData.get('documentId') as string;
    const newOwnerEmail = formData.get('newOwnerEmail') as string;

    // Find the new owner
    const { data: { users }, error: userError } = await serviceSupabase.auth.admin.listUsers({ perPage: 1000 });
    if (userError) return { error: "Could not fetch user list." };
    
    const newOwner = users.find(u => u.email === newOwnerEmail);
    if (!newOwner) {
        return { error: `User with email "${newOwnerEmail}" not found.` };
    }

    // Update document owner
    const { error: updateError } = await serviceSupabase
        .from('documents')
        .update({ user_id: newOwner.id })
        .eq('id', documentId);
    
    if (updateError) {
        return { error: `Failed to transfer document: ${updateError.message}` };
    }

    revalidatePath('/app/super-admin/documents');
    return { success: `Document successfully transferred to ${newOwnerEmail}.` };
}

// --- Payment Gateway Management Actions ---

export async function getPaymentGateways() {
    if (!serviceSupabase) throw new Error("Service client not initialized.");
    const { data, error } = await serviceSupabase
        .from('payment_gateways')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching payment gateways:', error);
        throw new Error('Failed to fetch payment gateways.');
    }
    return data || [];
}

export type PaymentGateway = Awaited<ReturnType<typeof getPaymentGateways>>[0];

export async function createPaymentGateway(prevState: any, formData: FormData) {
    if (!serviceSupabase) return { error: "Service client not initialized." };
    if (!(await isSuperAdmin())) return { error: "Permission denied." };

    const rawData = {
        name: formData.get('name') as string,
        instructions: formData.get('instructions') as string,
        icon_url: formData.get('icon_url') as string || null,
        is_active: formData.get('is_active') === 'on',
    };
    
    if (!rawData.name || !rawData.instructions) {
        return { error: 'Name and Instructions are required.' };
    }

    const { error } = await serviceSupabase.from('payment_gateways').insert(rawData);

    if (error) {
        return { error: `Failed to create payment gateway: ${error.message}` };
    }

    revalidatePath('/app/super-admin/payments');
    return { success: 'Payment gateway created successfully.' };
}

export async function updatePaymentGateway(prevState: any, formData: FormData) {
    if (!serviceSupabase) return { error: "Service client not initialized." };
    if (!(await isSuperAdmin())) return { error: "Permission denied." };
    
    const id = formData.get('id') as string;
    const rawData = {
        name: formData.get('name') as string,
        instructions: formData.get('instructions') as string,
        icon_url: formData.get('icon_url') as string || null,
        is_active: formData.get('is_active') === 'on',
    };

    if (!id) return { error: 'Missing gateway ID.' };

    const { error } = await serviceSupabase
        .from('payment_gateways')
        .update(rawData)
        .eq('id', id);

    if (error) {
        return { error: `Failed to update payment gateway: ${error.message}` };
    }

    revalidatePath('/app/super-admin/payments');
    return { success: 'Payment gateway updated successfully.' };
}

export async function deletePaymentGateway(prevState: any, formData: FormData) {
    if (!serviceSupabase) return { error: "Service client not initialized." };
    if (!(await isSuperAdmin())) return { error: "Permission denied." };

    const id = formData.get('id') as string;
    if (!id) return { error: 'Missing gateway ID.' };

    const { error } = await serviceSupabase
        .from('payment_gateways')
        .delete()
        .eq('id', id);

    if (error) {
        return { error: `Failed to delete payment gateway: ${error.message}` };
    }

    revalidatePath('/app/super-admin/payments');
    return { success: 'Payment gateway deleted successfully.' };
}

// --- Plan Management Actions ---

export async function getAllPlans() {
    if (!serviceSupabase) throw new Error("Service client not initialized.");
    const { data, error } = await serviceSupabase
        .from('plans')
        .select('*')
        .order('price');

    if (error) {
        console.error('Error fetching plans:', error);
        throw new Error('Failed to fetch plans.');
    }
    return data || [];
}

export type Plan = Awaited<ReturnType<typeof getAllPlans>>[0];

export async function createPlan(prevState: any, formData: FormData) {
    if (!serviceSupabase) return { error: "Service client not initialized." };
    if (!(await isSuperAdmin())) return { error: "Permission denied." };

    const rawData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        price: parseFloat(formData.get('price') as string),
        currency: formData.get('currency') as string,
        currency_symbol: formData.get('currency_symbol') as string,
        period: formData.get('period') as string,
        features: (formData.get('features') as string).split('\n').filter(f => f.trim() !== ''),
        is_active: formData.get('is_active') === 'on',
        is_popular: formData.get('is_popular') === 'on',
    };

    const { error } = await serviceSupabase.from('plans').insert(rawData as TablesInsert<'plans'>);

    if (error) {
        return { error: `Failed to create plan: ${error.message}` };
    }

    revalidatePath('/app/super-admin/plans');
    revalidatePath('/'); // Revalidate landing page
    revalidatePath('/app/billing'); // Revalidate billing page
    return { success: 'Plan created successfully.' };
}

export async function updatePlan(prevState: any, formData: FormData) {
    if (!serviceSupabase) return { error: "Service client not initialized." };
    if (!(await isSuperAdmin())) return { error: "Permission denied." };

    const id = formData.get('id') as string;
    const rawData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        price: parseFloat(formData.get('price') as string),
        currency: formData.get('currency') as string,
        currency_symbol: formData.get('currency_symbol') as string,
        period: formData.get('period') as string,
        features: (formData.get('features') as string).split('\n').filter(f => f.trim() !== ''),
        is_active: formData.get('is_active') === 'on',
        is_popular: formData.get('is_popular') === 'on',
    };

    const { error } = await serviceSupabase.from('plans').update(rawData as TablesUpdate<'plans'>).eq('id', id);

    if (error) {
        return { error: `Failed to update plan: ${error.message}` };
    }

    revalidatePath('/app/super-admin/plans');
    revalidatePath('/');
    revalidatePath('/app/billing');
    return { success: 'Plan updated successfully.' };
}

export async function deletePlan(prevState: any, formData: FormData) {
    if (!serviceSupabase) return { error: "Service client not initialized." };
    if (!(await isSuperAdmin())) return { error: "Permission denied." };

    const id = formData.get('id') as string;

    const { error } = await serviceSupabase.from('plans').delete().eq('id', id);

    if (error) {
        return { error: `Failed to delete plan: ${error.message}` };
    }

    revalidatePath('/app/super-admin/plans');
    revalidatePath('/');
    revalidatePath('/app/billing');
    return { success: 'Plan deleted successfully.' };
}

// --- Subscription Request Management Actions ---

export async function getSubscriptionRequests() {
    if (!serviceSupabase) throw new Error("Service client not initialized.");

    // 1. Fetch all requests with simple joins
    const { data: requests, error: requestsError } = await serviceSupabase
        .from('subscription_requests')
        .select(`
            *,
            plans (name),
            payment_gateways (name)
        `)
        .order('created_at', { ascending: false });

    if (requestsError) {
        console.error("Error fetching subscription requests:", requestsError.message);
        throw new Error(`Failed to fetch subscription requests: ${requestsError.message}`);
    }
    if (!requests || requests.length === 0) {
        return [];
    }

    // 2. Collect unique user IDs
    const userIds = [...new Set(requests.map(r => r.user_id))];
    if (userIds.length === 0) {
        return [];
    }

    // 3. Fetch profiles and user data in parallel
    const [
        { data: profiles, error: profilesError },
        { data: { users }, error: usersError }
    ] = await Promise.all([
        serviceSupabase.from('profiles').select('id, full_name').in('id', userIds),
        serviceSupabase.auth.admin.listUsers({ perPage: 1000 })
    ]);

    if (profilesError) {
        console.error("Error fetching profiles for requests:", profilesError.message);
        throw new Error(`Failed to fetch user profiles for subscription requests: ${profilesError.message}`);
    }
    if (usersError) {
        console.error("Error fetching users for requests:", usersError.message);
        throw new Error(`Failed to fetch user data for subscription requests: ${usersError.message}`);
    }

    // 4. Create maps for efficient lookup
    const profilesMap = new Map(profiles?.map(p => [p.id, p]));
    const usersMap = new Map(users.map(u => [u.id, u]));

    // 5. Combine data
    const result = requests.map(req => {
        const profile = profilesMap.get(req.user_id);
        const user = usersMap.get(req.user_id);

        return {
            ...req,
            user_name: profile?.full_name || 'N/A',
            user_email: user?.email || 'N/A',
            plan_name: (req.plans as { name: string })?.name || 'N/A',
            gateway_name: (req.payment_gateways as { name: string })?.name || 'N/A',
        };
    });

    return result;
}

export type SubscriptionRequestWithDetails = Awaited<ReturnType<typeof getSubscriptionRequests>>[0];

export async function approveSubscriptionRequest(prevState: any, formData: FormData) {
    if (!serviceSupabase) return { error: "Service client not initialized." };
    if (!(await isSuperAdmin())) return { error: "Permission denied." };

    const requestId = parseInt(formData.get('requestId') as string, 10);
    const userId = formData.get('userId') as string;
    const planName = formData.get('planName') as string;
    
    const { data: adminUser } = await createClient().auth.getUser();

    // 1. Update user's profile to the new plan
    const { error: profileError } = await serviceSupabase
        .from('profiles')
        .update({ subscription_plan: planName })
        .eq('id', userId);

    if (profileError) {
        return { error: `Failed to update user profile: ${profileError.message}` };
    }
    
    // 2. Update the request status to 'approved'
    const { error: requestError } = await serviceSupabase
        .from('subscription_requests')
        .update({
            status: 'approved',
            reviewed_at: new Date().toISOString(),
            reviewed_by: adminUser.user?.id,
        })
        .eq('id', requestId);

    if (requestError) {
        // Attempt to revert profile change if this fails
        // This is a simple rollback, a real-world app might use a transaction
        await serviceSupabase.from('profiles').update({ subscription_plan: 'Free' }).eq('id', userId);
        return { error: `Failed to update request status: ${requestError.message}` };
    }

    revalidatePath('/app/super-admin/subscriptions');
    revalidatePath('/app/billing');
    return { success: "Subscription approved successfully." };
}

export async function rejectSubscriptionRequest(prevState: any, formData: FormData) {
    if (!serviceSupabase) return { error: "Service client not initialized." };
    if (!(await isSuperAdmin())) return { error: "Permission denied." };
    
    const requestId = parseInt(formData.get('requestId') as string, 10);
    const reason = formData.get('reason') as string;
    const { data: adminUser } = await createClient().auth.getUser();
    
    const { error } = await serviceSupabase
        .from('subscription_requests')
        .update({
            status: 'rejected',
            rejection_reason: reason,
            reviewed_at: new Date().toISOString(),
            reviewed_by: adminUser.user?.id,
        })
        .eq('id', requestId);
        
    if (error) {
        return { error: `Failed to reject request: ${error.message}` };
    }
    
    revalidatePath('/app/super-admin/subscriptions');
    revalidatePath('/app/billing');
    return { success: "Subscription rejected." };
}
