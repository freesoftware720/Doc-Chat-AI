
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Tables, TablesInsert } from '@/lib/supabase/database.types';

export async function getActiveWorkspace() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: profile } = await supabase
        .from('profiles')
        .select('active_workspace_id')
        .eq('id', user.id)
        .single();
    
    if (!profile || !profile.active_workspace_id) {
        throw new Error('No active workspace found for user.');
    }

    const { data: workspace, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', profile.active_workspace_id)
        .single();

    if (error) {
        console.error('Error fetching active workspace:', error.message);
        throw new Error('Could not fetch active workspace.');
    }

    return workspace;
}

export async function getUserRole() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
        .from('profiles')
        .select('active_workspace_id')
        .eq('id', user.id)
        .single();

    if (!profile || !profile.active_workspace_id) return null;

    const { data: member, error } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', profile.active_workspace_id)
        .eq('user_id', user.id)
        .single();
    
    if (error) {
        console.error('Error fetching user role:', error.message);
        return null;
    }

    return member?.role || null;
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
