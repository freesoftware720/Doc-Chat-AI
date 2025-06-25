
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// This client is used for admin actions that require bypassing RLS.
// It should only be used in secure, server-side environments.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey || serviceRoleKey === 'YOUR_SUPABASE_SERVICE_ROLE_KEY') {
    if (process.env.NODE_ENV === 'production') {
        throw new Error("Supabase URL or service role key is missing or is still a placeholder. This is required for admin functionality.");
    }
    console.warn("Supabase service role client not initialized. Super admin features will not work.");
}

// Initialize a separate client that can be used for service-level operations
export const serviceSupabase = serviceRoleKey ? createClient<Database>(supabaseUrl!, serviceRoleKey) : null;
