-- This script is idempotent and can be run multiple times safely.
-- It creates tables, policies, functions, and triggers for DocuChat AI.

-- 1. PROFILES TABLE
-- Stores public user data.
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  subscription_plan text DEFAULT 'Free'::text,
  PRIMARY KEY (id)
);

-- Enable RLS and define policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
CREATE POLICY "Users can view their own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. NEW USER TRIGGER
-- Automatically creates a profile for new users from auth.users.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists, then create it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. DOCUMENTS TABLE
-- Stores metadata and extracted content for uploaded documents.
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  storage_path text NOT NULL,
  content text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (id)
);

-- Enable RLS and define policies for documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own documents." ON public.documents;
CREATE POLICY "Users can manage their own documents." ON public.documents FOR ALL USING (auth.uid() = user_id);

-- 4. MESSAGES TABLE
-- Stores chat history for each document.
CREATE TABLE IF NOT EXISTS public.messages (
  id bigserial PRIMARY KEY,
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL check (role in ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS and define policies for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage messages on their own documents." ON public.messages;
CREATE POLICY "Users can manage messages on their own documents." ON public.messages FOR ALL USING (auth.uid() = user_id);


-- 5. STORAGE BUCKET & POLICIES
-- Create a private bucket for documents.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('documents', 'documents', FALSE, 33554432, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING; -- Do nothing if bucket already exists

-- Define storage policies
DROP POLICY IF EXISTS "Users can manage their own documents in storage" ON storage.objects;
CREATE POLICY "Users can manage their own documents in storage"
  ON storage.objects FOR ALL
  USING (bucket_id = 'documents' AND auth.uid() = owner)
  WITH CHECK (bucket_id = 'documents' AND auth.uid() = owner);
