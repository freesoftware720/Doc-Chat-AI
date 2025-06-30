-- This script is designed to be idempotent, meaning it can be run multiple times without causing errors.

-- Create custom types if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'workspace_role') THEN
        CREATE TYPE public.workspace_role AS ENUM (
            'admin',
            'member'
        );
    END IF;
END$$;


-- Create workspaces table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.workspaces (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    owner_id uuid NOT NULL,
    name text NOT NULL,
    logo_url text,
    brand_color text,
    max_documents integer DEFAULT 3 NOT NULL,
    allowed_file_types text[] DEFAULT '{application/pdf}'::text[]
);

-- Add foreign key constraint to workspaces table
-- Using a helper function to avoid errors if the constraint already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'workspaces_owner_id_fkey' AND conrelid = 'public.workspaces'::regclass
    ) THEN
        ALTER TABLE public.workspaces
        ADD CONSTRAINT workspaces_owner_id_fkey
        FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END$$;

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid NOT NULL PRIMARY KEY,
    full_name text,
    avatar_url text,
    subscription_plan text,
    status text DEFAULT 'active'::text,
    ban_reason text,
    banned_at timestamp with time zone,
    referral_code text UNIQUE,
    referred_by uuid,
    pro_credits integer,
    active_workspace_id uuid,
    chat_credits_used integer DEFAULT 0 NOT NULL,
    chat_credits_last_reset timestamp with time zone
);

-- Add foreign key constraints to profiles table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_id_fkey' AND conrelid = 'public.profiles'::regclass) THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_referred_by_fkey' AND conrelid = 'public.profiles'::regclass) THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_referred_by_fkey FOREIGN KEY (referred_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_active_workspace_id_fkey' AND conrelid = 'public.profiles'::regclass) THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_active_workspace_id_fkey FOREIGN KEY (active_workspace_id) REFERENCES public.workspaces(id) ON DELETE SET NULL;
    END IF;
END$$;

-- Add chat credit columns to profiles table if they don't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS chat_credits_used INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS chat_credits_last_reset TIMESTAMPTZ;


-- Create documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name text NOT NULL,
    content text,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    storage_path text NOT NULL,
    file_size integer
);

-- Add foreign key constraint to documents table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'documents_user_id_fkey' AND conrelid = 'public.documents'::regclass) THEN
        ALTER TABLE public.documents ADD CONSTRAINT documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END$$;

-- Create messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    document_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Add foreign key constraints to messages table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'messages_document_id_fkey' AND conrelid = 'public.messages'::regclass) THEN
        ALTER TABLE public.messages ADD CONSTRAINT messages_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'messages_user_id_fkey' AND conrelid = 'public.messages'::regclass) THEN
        ALTER TABLE public.messages ADD CONSTRAINT messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END$$;

-- Create workspace_members table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.workspace_members (
    workspace_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role public.workspace_role DEFAULT 'member'::public.workspace_role,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (workspace_id, user_id)
);

-- Add foreign key constraints to workspace_members table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'workspace_members_workspace_id_fkey' AND conrelid = 'public.workspace_members'::regclass) THEN
        ALTER TABLE public.workspace_members ADD CONSTRAINT workspace_members_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'workspace_members_user_id_fkey' AND conrelid = 'public.workspace_members'::regclass) THEN
        ALTER TABLE public.workspace_members ADD CONSTRAINT workspace_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END$$;


-- Create referrals table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.referrals (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    referrer_id uuid NOT NULL,
    referred_id uuid NOT NULL
);
-- Add foreign key constraints to referrals table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'referrals_referrer_id_fkey' AND conrelid = 'public.referrals'::regclass) THEN
        ALTER TABLE public.referrals ADD CONSTRAINT referrals_referrer_id_fkey FOREIGN KEY (referrer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'referrals_referred_id_fkey' AND conrelid = 'public.referrals'::regclass) THEN
        ALTER TABLE public.referrals ADD CONSTRAINT referrals_referred_id_fkey FOREIGN KEY (referred_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END$$;

-- Create audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL PRIMARY KEY,
    workspace_id uuid NOT NULL,
    user_id uuid,
    user_email text,
    action text NOT NULL,
    details jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
-- Add foreign key constraints to audit_logs table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'audit_logs_workspace_id_fkey' AND conrelid = 'public.audit_logs'::regclass) THEN
        ALTER TABLE public.audit_logs ADD CONSTRAINT audit_logs_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'audit_logs_user_id_fkey' AND conrelid = 'public.audit_logs'::regclass) THEN
        ALTER TABLE public.audit_logs ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END$$;

-- Create app_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.app_settings (
    id integer NOT NULL PRIMARY KEY,
    updated_at timestamp with time zone,
    logo_url text,
    homepage_announcement_message text,
    chat_limit_free_user integer DEFAULT 50 NOT NULL,
    feature_chat_templates_enabled boolean DEFAULT true NOT NULL,
    feature_multi_pdf_enabled boolean DEFAULT false NOT NULL,
    landing_page_content jsonb
);

-- Define a function to generate a short, unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    new_code text;
    is_unique boolean := false;
BEGIN
    WHILE NOT is_unique LOOP
        new_code := (
            SELECT string_agg(
                (
                    SELECT substr('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', floor(random() * 36)::integer + 1, 1)
                ), ''
            )
            FROM generate_series(1, 8)
        );
        is_unique := NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = new_code);
    END LOOP;
    RETURN new_code;
END;
$$;


-- Define a function to handle new user setup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, referral_code)
    VALUES (
        new.id,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url',
        public.generate_referral_code()
    );
    RETURN new;
END;
$$;

-- Create a trigger to call handle_new_user on new user creation if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END$$;


-- RLS Policies
-- Enable RLS for all tables
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before creating new ones to ensure idempotency
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public can view any profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view workspaces they are a member of" ON public.workspaces;
DROP POLICY IF EXISTS "Workspace owners can update their workspace" ON public.workspaces;
DROP POLICY IF EXISTS "Workspace owners can delete their workspace" ON public.workspaces;

DROP POLICY IF EXISTS "Users can view their own members" ON public.workspace_members;
DROP POLICY IF EXISTS "Admins can manage members" ON public.workspace_members;

DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;

DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.messages;

DROP POLICY IF EXISTS "Admins can view audit logs for their workspace" ON public.audit_logs;

DROP POLICY IF EXISTS "Users can view their own referrals" ON public.referrals;
DROP POLICY IF EXISTS "All users can read app settings" ON public.app_settings;


-- Profiles RLS
CREATE POLICY "Public can view any profile" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));

-- Workspaces RLS
CREATE POLICY "Users can view workspaces they are a member of" ON public.workspaces
FOR SELECT USING (
    id IN (
        SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
);
CREATE POLICY "Workspace owners can update their workspace" ON public.workspaces
FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Workspace owners can delete their workspace" ON public.workspaces
FOR DELETE USING (auth.uid() = owner_id);

-- Workspace Members RLS
CREATE POLICY "Users can view their own members" ON public.workspace_members
FOR SELECT USING (
    workspace_id IN (
        SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
);
CREATE POLICY "Admins can manage members" ON public.workspace_members
FOR ALL USING (
    (
        SELECT role FROM public.workspace_members
        WHERE user_id = auth.uid() AND workspace_id = public.workspace_members.workspace_id
    ) = 'admin'::public.workspace_role
);

-- Documents RLS
CREATE POLICY "Users can view their own documents" ON public.documents
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents" ON public.documents
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" ON public.documents
FOR DELETE USING (auth.uid() = user_id);

-- Messages RLS
CREATE POLICY "Users can view their own messages" ON public.messages
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages" ON public.messages
FOR INSERT WITH CHECK (auth.uid() = user_id);


-- Audit Logs RLS (Only admins of a workspace can see its logs)
CREATE POLICY "Admins can view audit logs for their workspace" ON public.audit_logs
FOR SELECT USING (
    (
        SELECT role FROM public.workspace_members
        WHERE user_id = auth.uid() AND workspace_id = public.audit_logs.workspace_id
    ) = 'admin'::public.workspace_role
);

-- Referrals RLS
CREATE POLICY "Users can view their own referrals" ON public.referrals
FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- App Settings RLS
CREATE POLICY "All users can read app settings" ON public.app_settings FOR SELECT USING (true);


-- RPC function to get user's chat history
CREATE OR REPLACE FUNCTION public.get_user_chat_history()
RETURNS TABLE(document_id uuid, document_name text, last_message_at timestamptz)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT
        d.id as document_id,
        d.name as document_name,
        MAX(m.created_at) as last_message_at
    FROM
        public.documents d
    JOIN
        public.messages m ON d.id = m.document_id
    WHERE
        d.user_id = auth.uid() AND m.user_id = auth.uid()
    GROUP BY
        d.id, d.name
    ORDER BY
        last_message_at DESC;
$$;
