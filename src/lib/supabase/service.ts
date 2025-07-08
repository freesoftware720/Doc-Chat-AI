
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// This client is used for admin actions that require bypassing RLS.
// It should only be used in secure, server-side environments.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL' || !serviceRoleKey || serviceRoleKey === 'YOUR_SUPABASE_SERVICE_ROLE_KEY') {
    const warningMessage = "Supabase service client not initialized due to missing or placeholder credentials. Super admin features that require database modification will not work. Please check your .env.local file.";
    // Don't throw an error in production, as it can crash the app if env vars are not set.
    // Instead, log a warning and allow the app to continue running without admin features.
    console.warn(warningMessage);
}

// Initialize a separate client that can be used for service-level operations
export const serviceSupabase = (supabaseUrl && serviceRoleKey && supabaseUrl !== 'YOUR_SUPABASE_URL' && serviceRoleKey !== 'YOUR_SUPABASE_SERVICE_ROLE_KEY') 
    ? createClient<Database>(supabaseUrl, serviceRoleKey) 
    : null;
