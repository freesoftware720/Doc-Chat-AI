
'use server';

import { revalidatePath } from 'next/cache';
import { serviceSupabase } from '@/lib/supabase/service';
import { isSuperAdmin } from './super-admin';
import { createClient } from '@/lib/supabase/server';
import type { Tables, TablesUpdate } from '@/lib/supabase/database.types';

export type AppSettings = Tables<'app_settings'>;

export async function getAppSettings(): Promise<AppSettings> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('id', 1)
        .single();
    
    if (error || !data) {
        console.error('Error fetching app settings, returning defaults:', error);
        // Return default settings on error or if row doesn't exist
        return {
            id: 1,
            chat_limit_free_user: 50,
            feature_chat_templates_enabled: true,
            feature_multi_pdf_enabled: false,
            homepage_announcement_message: null,
            logo_url: null,
            updated_at: new Date().toISOString(),
        };
    }
    return data;
}

export async function updateAppSettings(prevState: any, formData: FormData) {
    if (!serviceSupabase) {
        return { error: "Service client not initialized." };
    }
    if (!(await isSuperAdmin())) {
        return { error: "Permission denied. You must be a Super Admin." };
    }

    try {
        const dataToUpdate: TablesUpdate<'app_settings'> = {
            chat_limit_free_user: parseInt(formData.get('chat_limit_free_user') as string, 10),
            feature_chat_templates_enabled: formData.get('feature_chat_templates_enabled') === 'on',
            feature_multi_pdf_enabled: formData.get('feature_multi_pdf_enabled') === 'on',
            homepage_announcement_message: (formData.get('homepage_announcement_message') as string) || null,
            logo_url: (formData.get('logo_url') as string) || null,
            updated_at: new Date().toISOString(),
        };

        const { error } = await serviceSupabase
            .from('app_settings')
            .update(dataToUpdate)
            .eq('id', 1);
        
        if (error) {
            throw new Error(error.message);
        }

        revalidatePath('/app/super-admin/settings');
        revalidatePath('/'); // For announcement and logo changes to reflect
        return { success: 'Application settings updated successfully.' };

    } catch (e: any) {
        console.error("Failed to update app settings:", e);
        return { error: `Failed to update settings: ${e.message}` };
    }
}

    