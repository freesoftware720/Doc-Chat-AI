
-- Create the custom enum type for workspace roles if it doesn't exist.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'workspace_role') THEN
        CREATE TYPE "public"."workspace_role" AS ENUM ('admin', 'member');
    END IF;
END$$;


-- Create workspaces table
CREATE TABLE IF NOT EXISTS "public"."workspaces" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "owner_id" uuid NOT NULL,
    "name" text NOT NULL,
    "logo_url" text,
    "brand_color" text,
    "max_documents" integer DEFAULT 10 NOT NULL,
    "allowed_file_types" text[] DEFAULT ARRAY['application/pdf']
);
ALTER TABLE "public"."workspaces" OWNER TO "postgres";
ALTER TABLE ONLY "public"."workspaces" ADD CONSTRAINT "workspaces_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY "public"."workspaces" ADD CONSTRAINT "workspaces_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;


-- Create profiles table
CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" uuid NOT NULL,
    "full_name" text,
    "avatar_url" text,
    "active_workspace_id" uuid,
    "subscription_plan" text DEFAULT 'Free'::text,
    "referral_code" text,
    "referred_by" uuid,
    "pro_credits" integer DEFAULT 0,
    "status" text DEFAULT 'active'::text,
    "ban_reason" text,
    "banned_at" timestamp with time zone,
    "chat_credits_used" integer DEFAULT 0 NOT NULL,
    "chat_credits_last_reset" timestamp with time zone DEFAULT now()
);
ALTER TABLE "public"."profiles" OWNER TO "postgres";
ALTER TABLE ONLY "public"."profiles" ADD CONSTRAINT "profiles_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY "public"."profiles" ADD CONSTRAINT "profiles_referral_code_key" UNIQUE (referral_code);
ALTER TABLE ONLY "public"."profiles" ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY "public"."profiles" ADD CONSTRAINT "profiles_active_workspace_id_fkey" FOREIGN KEY (active_workspace_id) REFERENCES public.workspaces(id) ON DELETE SET NULL;
ALTER TABLE ONLY "public"."profiles" ADD CONSTRAINT "profiles_referred_by_fkey" FOREIGN KEY (referred_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


-- Create workspace_members table
CREATE TABLE IF NOT EXISTS "public"."workspace_members" (
    "workspace_id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "role" public.workspace_role DEFAULT 'member'::public.workspace_role,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE "public"."workspace_members" OWNER TO "postgres";
ALTER TABLE ONLY "public"."workspace_members" ADD CONSTRAINT "workspace_members_pkey" PRIMARY KEY (workspace_id, user_id);
ALTER TABLE ONLY "public"."workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE ONLY "public"."workspace_members" ADD CONSTRAINT "workspace_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


-- Create documents table
CREATE TABLE IF NOT EXISTS "public"."documents" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "name" text NOT NULL,
    "content" text,
    "storage_path" text NOT NULL,
    "user_id" uuid NOT NULL,
    "file_size" integer
);
ALTER TABLE "public"."documents" OWNER TO "postgres";
ALTER TABLE ONLY "public"."documents" ADD CONSTRAINT "documents_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY "public"."documents" ADD CONSTRAINT "documents_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


-- Create messages table
CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "document_id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "role" text NOT NULL,
    "content" text NOT NULL
);
ALTER TABLE "public"."messages" OWNER TO "postgres";
ALTER TABLE ONLY "public"."messages" ADD CONSTRAINT "messages_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY "public"."messages" ADD CONSTRAINT "messages_document_id_fkey" FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE;
ALTER TABLE ONLY "public"."messages" ADD CONSTRAINT "messages_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


-- Create referrals table
CREATE TABLE IF NOT EXISTS "public"."referrals" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "referrer_id" uuid NOT NULL,
    "referred_id" uuid NOT NULL
);
ALTER TABLE "public"."referrals" OWNER TO "postgres";
CREATE SEQUENCE IF NOT EXISTS "public"."referrals_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE "public"."referrals_id_seq" OWNER TO "postgres";
ALTER SEQUENCE "public"."referrals_id_seq" OWNED BY "public"."referrals"."id";
ALTER TABLE ONLY "public"."referrals" ALTER COLUMN "id" SET DEFAULT nextval('public.referrals_id_seq'::regclass);
ALTER TABLE ONLY "public"."referrals" ADD CONSTRAINT "referrals_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY "public"."referrals" ADD CONSTRAINT "referrals_referred_id_fkey" FOREIGN KEY (referred_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE ONLY "public"."referrals" ADD CONSTRAINT "referrals_referrer_id_fkey" FOREIGN KEY (referrer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


-- Create audit_logs table
CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "workspace_id" uuid NOT NULL,
    "user_id" uuid,
    "user_email" text,
    "action" text NOT NULL,
    "details" jsonb
);
ALTER TABLE "public"."audit_logs" OWNER TO "postgres";
CREATE SEQUENCE IF NOT EXISTS "public"."audit_logs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE "public"."audit_logs_id_seq" OWNER TO "postgres";
ALTER SEQUENCE "public"."audit_logs_id_seq" OWNED BY "public"."audit_logs"."id";
ALTER TABLE ONLY "public"."audit_logs" ALTER COLUMN "id" SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);
ALTER TABLE ONLY "public"."audit_logs" ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY "public"."audit_logs" ADD CONSTRAINT "audit_logs_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE ONLY "public"."audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


-- Create app_settings table (singleton)
CREATE TABLE IF NOT EXISTS "public"."app_settings" (
    "id" integer PRIMARY KEY,
    "updated_at" timestamp with time zone DEFAULT now(),
    "logo_url" text,
    "homepage_announcement_message" text,
    "feature_multi_pdf_enabled" boolean DEFAULT false NOT NULL,
    "feature_chat_templates_enabled" boolean DEFAULT true NOT NULL,
    "chat_limit_free_user" integer DEFAULT 50 NOT NULL,
    "landing_page_content" jsonb,
    CONSTRAINT "app_settings_id_check" CHECK (id = 1)
);
ALTER TABLE "public"."app_settings" OWNER TO "postgres";


--- FUNCTIONS AND TRIGGERS ---

-- Function to generate a unique referral code
CREATE OR REPLACE FUNCTION "public"."generate_referral_code"()
RETURNS text
LANGUAGE "plpgsql"
AS $$
DECLARE
  new_code text;
  is_unique boolean := false;
BEGIN
  WHILE NOT is_unique LOOP
    new_code := upper(substring(md5(random()::text) for 8));
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = new_code) THEN
      is_unique := true;
    END IF;
  END LOOP;
  RETURN new_code;
END;
$$;
ALTER FUNCTION "public"."generate_referral_code"() OWNER TO "postgres";


-- Function to handle new user setup
CREATE OR REPLACE FUNCTION "public"."handle_new_user"()
RETURNS trigger
LANGUAGE "plpgsql"
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
ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

-- Trigger to call handle_new_user on new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- Function to get user chat history
CREATE OR REPLACE FUNCTION public.get_user_chat_history()
RETURNS TABLE(document_id uuid, document_name text, last_message_at timestamp with time zone)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    d.id as document_id,
    d.name as document_name,
    max(m.created_at) as last_message_at
  FROM
    documents d
  JOIN
    messages m ON d.id = m.document_id
  WHERE
    d.user_id = auth.uid()
  GROUP BY
    d.id, d.name
  ORDER BY
    last_message_at DESC;
$$;
ALTER FUNCTION "public"."get_user_chat_history"() OWNER TO "postgres";


--- ROW LEVEL SECURITY (RLS) POLICIES ---

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
CREATE POLICY "Users can view their own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);


-- Workspaces
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view workspaces they are a member of." ON public.workspaces;
CREATE POLICY "Users can view workspaces they are a member of." ON public.workspaces FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_members.workspace_id = workspaces.id
    AND workspace_members.user_id = auth.uid()
  )
);
DROP POLICY IF EXISTS "Workspace owners can update their workspace." ON public.workspaces;
CREATE POLICY "Workspace owners can update their workspace." ON public.workspaces FOR UPDATE USING (
  owner_id = auth.uid()
) WITH CHECK (
  owner_id = auth.uid()
);


-- Workspace Members
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own workspace membership." ON public.workspace_members;
CREATE POLICY "Users can view their own workspace membership." ON public.workspace_members FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can manage workspace members." ON public.workspace_members;
CREATE POLICY "Admins can manage workspace members." ON public.workspace_members FOR ALL USING (
  (
    SELECT role FROM public.workspace_members
    WHERE user_id = auth.uid()
    AND workspace_id = workspace_members.workspace_id
  ) = 'admin'::public.workspace_role
);


-- Documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own documents." ON public.documents;
CREATE POLICY "Users can view their own documents." ON public.documents FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own documents." ON public.documents;
CREATE POLICY "Users can insert their own documents." ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own documents." ON public.documents;
CREATE POLICY "Users can delete their own documents." ON public.documents FOR DELETE USING (auth.uid() = user_id);


-- Messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own messages." ON public.messages;
CREATE POLICY "Users can view their own messages." ON public.messages FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own messages." ON public.messages;
CREATE POLICY "Users can insert their own messages." ON public.messages FOR INSERT WITH CHECK (auth.uid() = user_id);


-- Audit Logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Workspace admins can view their workspace audit logs." ON public.audit_logs;
CREATE POLICY "Workspace admins can view their workspace audit logs." ON public.audit_logs FOR SELECT USING (
  (
    SELECT role FROM public.workspace_members
    WHERE user_id = auth.uid()
    AND workspace_id = audit_logs.workspace_id
  ) = 'admin'::public.workspace_role
);
-- NOTE: Inserts to audit_logs should ONLY be done with the service_role key to bypass RLS.


-- App Settings (publicly readable)
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-only access to app settings" ON public.app_settings;
CREATE POLICY "Allow public read-only access to app settings" ON public.app_settings FOR SELECT USING (true);


-- Referrals (no direct user access, handled by service role)
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;


-- STORAGE POLICIES --
-- Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for documents bucket
DROP POLICY IF EXISTS "Allow authenticated users to upload documents" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents');

DROP POLICY IF EXISTS "Allow users to view their own documents" ON storage.objects;
CREATE POLICY "Allow users to view their own documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'documents' AND owner = auth.uid());

DROP POLICY IF EXISTS "Allow users to delete their own documents" ON storage.objects;
CREATE POLICY "Allow users to delete their own documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'documents' AND owner = auth.uid());
