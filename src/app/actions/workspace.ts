
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Tables, TablesInsert } from '@/lib/supabase/database.types';
import { serviceSupabase } from '@/lib/supabase/service';

async function createAndSetActiveWorkspace(userId: string) {
    // Standard client to get user metadata
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not found during workspace creation');

    // Service client is required for initial setup to bypass RLS policies
    // that might cause recursion before the user is a member of the new workspace.
    if (!serviceSupabase) {
        throw new Error('Service client not initialized. Cannot create a workspace.');
    }

    let newWorkspace: Tables<'workspaces'>;
    try {
        const { data, error } = await serviceSupabase
            .from('workspaces')
            .insert({
                owner_id: userId,
                name: `${user.user_metadata?.full_name || user.email}'s Workspace`,
            })
            .select()
            .single();
        if (error) throw new Error(`Workspace creation failed: ${error.message}`);
        newWorkspace = data;
    } catch (createError: any) {
        console.error('Error creating workspace in DB:', createError.message);
        throw new Error(`Could not create a personal workspace for user. DB Error: ${createError.message}`);
    }

    try {
        const { error: memberError } = await serviceSupabase.from('workspace_members').insert({
            workspace_id: newWorkspace.id,
            user_id: userId,
            role: 'admin',
        });
        if (memberError) throw new Error(`Adding user to members failed: ${memberError.message}`);
    } catch (memberError: any) {
        console.error('Error adding user to workspace members:', memberError.message);
        await serviceSupabase.from('workspaces').delete().eq('id', newWorkspace.id);
        throw new Error(`Could not add user to workspace members. Original error: ${memberError.message}`);
    }

    try {
        const { error: profileError } = await serviceSupabase.from('profiles').update({ active_workspace_id: newWorkspace.id }).eq('id', userId);
        if (profileError) throw new Error(`Updating profile failed: ${profileError.message}`);
    } catch (profileError: any) {
        console.error('Error updating profile with active workspace:', profileError.message);
        throw new Error(`Could not update profile with active workspace. Original error: ${profileError.message}`);
    }


    return newWorkspace;
}

export async function getActiveWorkspace() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: profile } = await supabase
        .from('profiles')
        .select('active_workspace_id')
        .eq('id', user.id)
        .single();

    if (!profile) {
        console.error('Profile not found for user. Creating a new workspace.');
        return createAndSetActiveWorkspace(user.id);
    }
    
    if (profile.active_workspace_id) {
        // Use service client to fetch the workspace to bypass potentially recursive RLS on SELECT.
        // This is safe because the workspace ID comes from the user's own profile, which is RLS protected.
        if (!serviceSupabase) {
            throw new Error("Service client not available, cannot fetch active workspace.");
        }
        const { data: workspace, error } = await serviceSupabase
            .from('workspaces')
            .select('*')
            .eq('id', profile.active_workspace_id)
            .single();

        if (error) {
            // This could happen if the workspace was deleted but the profile wasn't updated.
            // This is a critical state to recover from. Create a new workspace.
            console.error('Error fetching active workspace with service client. It might be deleted. Creating a new one. Error:', error.message);
            return createAndSetActiveWorkspace(user.id);
        }

        if (workspace) {
            return workspace;
        }
    }

    // If profile exists but has no active workspace, create one.
    return createAndSetActiveWorkspace(user.id);
}

export async function logAuditEvent(action: string, details?: object) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        console.warn('Attempted to log audit event without an authenticated user.');
        return;
    }

    if (!serviceSupabase) {
        console.warn('Service client is not available. Skipping audit log for action:', action);
        return;
    }

    try {
        const workspace = await getActiveWorkspace();
        if (!workspace) {
            console.warn('Attempted to log audit event without an active workspace.');
            return;
        }

        const logEntry: TablesInsert<'audit_logs'> = {
            workspace_id: workspace.id,
            user_id: user.id,
            user_email: user.email,
            action,
            details: details ? { ...details } : undefined,
        };

        const { error } = await serviceSupabase.from('audit_logs').insert(logEntry);

        if (error) {
            console.error('Failed to log audit event:', error.message);
        }

    } catch (error: any) {
        console.error('Error in logAuditEvent:', error.message);
    }
}
