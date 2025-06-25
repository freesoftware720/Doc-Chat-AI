
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Tables, TablesInsert } from '@/lib/supabase/database.types';

async function createAndSetActiveWorkspace(userId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not found during workspace creation');

    const { data: newWorkspace, error: createError } = await supabase
        .from('workspaces')
        .insert({
            owner_id: userId,
            name: `${user.user_metadata?.full_name || user.email}'s Workspace`,
        })
        .select()
        .single();
    
    if (createError) {
        console.error('Error creating workspace:', createError.message);
        throw new Error('Could not create a personal workspace for user.');
    }

    await supabase.from('workspace_members').insert({
        workspace_id: newWorkspace.id,
        user_id: userId,
        role: 'admin',
    });

    await supabase.from('profiles').update({ active_workspace_id: newWorkspace.id }).eq('id', userId);

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
        const { data: workspace, error } = await supabase
            .from('workspaces')
            .select('*')
            .eq('id', profile.active_workspace_id)
            .single();

        if (error) {
            console.error('Error fetching active workspace:', error.message);
            throw new Error('Could not fetch active workspace.');
        }

        if (workspace) {
            return workspace;
        }
    }

    return createAndSetActiveWorkspace(user.id);
}


export async function getUserRole() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const workspace = await getActiveWorkspace();
    if (!workspace) return null;

    const { data: member, error } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspace.id)
        .eq('user_id', user.id)
        .single();
    
    if (error) {
        console.error('Error fetching user role:', error.message);
        return null;
    }

    if (member?.role) {
      return member.role;
    }
    
    if (workspace.owner_id === user.id) {
      await supabase.from('workspace_members').upsert({
        workspace_id: workspace.id,
        user_id: user.id,
        role: 'admin',
      });
      return 'admin';
    }

    return null;
}

export async function logAuditEvent(action: string, details?: object) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        console.warn('Attempted to log audit event without an authenticated user.');
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

        const { error } = await supabase.from('audit_logs').insert(logEntry);

        if (error) {
            console.error('Failed to log audit event:', error.message);
        }

    } catch (error: any) {
        console.error('Error in logAuditEvent:', error.message);
    }
}

export async function getAuditLogs() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    try {
        const workspace = await getActiveWorkspace();
        if (!workspace) return [];

        // Check if the user is an admin of this workspace
        const role = await getUserRole();
        if (role !== 'admin') {
            return []; // Only admins can view audit logs
        }
        
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .eq('workspace_id', workspace.id)
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) {
            console.error('Error fetching audit logs:', error.message);
            throw error;
        }

        return data;

    } catch (error: any) {
        return [];
    }
}


export async function updateWorkspaceSettings(prevState: any, formData: FormData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const workspace = await getActiveWorkspace();
    if (!workspace) return { error: 'No active workspace found' };

    const role = await getUserRole();
    if (role !== 'admin') return { error: 'You do not have permission to update settings.' };

    const newName = formData.get('name') as string;

    if (!newName || newName.length < 3) {
        return { error: 'Workspace name must be at least 3 characters.' };
    }
    
    const { error } = await supabase
        .from('workspaces')
        .update({ name: newName })
        .eq('id', workspace.id);
    
    if (error) {
        await logAuditEvent('workspace.settings.update.failed', { error: error.message });
        return { error: 'Failed to update workspace settings.' };
    }

    await logAuditEvent('workspace.settings.update.success', { newName });
    revalidatePath('/app/admin/settings');
    return { success: 'Workspace settings updated successfully.' };
}
