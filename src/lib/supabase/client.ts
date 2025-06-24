import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'YOUR_SUPABASE_URL') {
    throw new Error("Supabase URL or anonymous key is missing or is still a placeholder in client-side environment variables. Please check your .env.local file.");
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}
