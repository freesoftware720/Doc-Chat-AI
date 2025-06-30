-- Create app_settings table
create table if not exists public.app_settings (
  id integer not null primary key,
  logo_url text,
  homepage_announcement_message text,
  feature_chat_templates_enabled boolean not null default true,
  feature_multi_pdf_enabled boolean not null default false,
  chat_limit_free_user integer not null default 50,
  landing_page_content jsonb,
  updated_at timestamptz
);

-- Seed initial app_settings
insert into public.app_settings (id) values (1) on conflict (id) do nothing;


-- Create workspaces table
create table if not exists public.workspaces (
  id uuid not null default gen_random_uuid() primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  logo_url text,
  brand_color text,
  max_documents integer not null default 10,
  allowed_file_types text[],
  created_at timestamptz not null default now()
);

-- Create profiles table
create table if not exists public.profiles (
  id uuid not null primary key references auth.users on delete cascade,
  full_name text,
  avatar_url text,
  active_workspace_id uuid references public.workspaces(id) on delete set null,
  subscription_plan text,
  pro_credits integer,
  referral_code text unique,
  referred_by uuid references public.profiles(id),
  status text,
  ban_reason text,
  banned_at timestamptz,
  chat_credits_used integer not null default 0,
  chat_credits_last_reset timestamptz
);

-- Create workspace_members table
create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

-- Create documents table
create table if not exists public.documents (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  storage_path text not null,
  content text,
  file_size integer,
  created_at timestamptz not null default now()
);

-- Create messages table
create table if not exists public.messages (
  id uuid not null default gen_random_uuid() primary key,
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null,
  content text not null,
  created_at timestamptz not null default now()
);

-- Create referrals table
create table if not exists public.referrals (
  id serial primary key,
  referrer_id uuid not null references public.profiles(id) on delete cascade,
  referred_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Create audit_logs table
create table if not exists public.audit_logs (
    id bigserial primary key,
    workspace_id uuid not null references public.workspaces(id) on delete cascade,
    user_id uuid references auth.users(id) on delete set null,
    user_email text,
    action text not null,
    details jsonb,
    created_at timestamptz not null default now()
);

-- Function to generate a unique referral code
create or replace function public.generate_referral_code()
returns text as $$
declare
  new_code text;
  is_unique boolean := false;
begin
  while not is_unique loop
    new_code := upper(substr(md5(random()::text), 0, 9));
    is_unique := not exists (select 1 from public.profiles where referral_code = new_code);
  end loop;
  return new_code;
end;
$$ language plpgsql volatile;


-- Function to handle new user setup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, referral_code)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', public.generate_referral_code());
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call handle_new_user on new user signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- RLS: Enable RLS for all tables
alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.documents enable row level security;
alter table public.messages enable row level security;
alter table public.referrals enable row level security;
alter table public.app_settings enable row level security;
alter table public.audit_logs enable row level security;

-- RLS Policies for profiles
create or replace policy "Allow users to view their own profile" on public.profiles for select using (auth.uid() = id);
create or replace policy "Allow users to update their own profile" on public.profiles for update using (auth.uid() = id);

-- RLS Policies for workspaces
create or replace policy "Allow members to view their own workspace" on public.workspaces for select using (
  id in (
    select workspace_id from public.workspace_members where user_id = auth.uid()
  )
);
create or replace policy "Allow admins to update their workspace" on public.workspaces for update using (
  id in (
    select workspace_id from public.workspace_members where user_id = auth.uid() and role = 'admin'
  )
);

-- RLS Policies for workspace_members
create or replace policy "Allow members to view their own membership" on public.workspace_members for select using (
    user_id = auth.uid()
);
create or replace policy "Allow members to view other members of their workspace" on public.workspace_members for select using (
    workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid())
);

-- RLS Policies for documents
create or replace policy "Allow users to view their own documents" on public.documents for select using (auth.uid() = user_id);
create or replace policy "Allow users to create documents" on public.documents for insert with check (auth.uid() = user_id);
create or replace policy "Allow users to delete their own documents" on public.documents for delete using (auth.uid() = user_id);

-- RLS Policies for messages
create or replace policy "Allow users to view messages in their own documents" on public.messages for select using (
  document_id in (select id from public.documents where user_id = auth.uid())
);
create or replace policy "Allow users to create messages in their own documents" on public.messages for insert with check (
  document_id in (select id from public.documents where user_id = auth.uid())
);

-- RLS Policies for app_settings
create or replace policy "Allow all users to view app settings" on public.app_settings for select using (true);

-- RLS Policies for audit_logs
create or replace policy "Allow admins to view audit logs for their workspace" on public.audit_logs for select using (
    workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid() and role = 'admin')
);

-- Function to get chat history
create or replace function public.get_user_chat_history()
returns table (document_id uuid, document_name text, last_message_at timestamptz) as $$
begin
  return query
  with ranked_messages as (
    select
      m.document_id,
      d.name as document_name,
      m.created_at,
      row_number() over (partition by m.document_id order by m.created_at desc) as rn
    from public.messages m
    join public.documents d on m.document_id = d.id
    where m.user_id = auth.uid()
  )
  select
    rm.document_id,
    rm.document_name,
    rm.created_at as last_message_at
  from ranked_messages rm
  where rm.rn = 1
  order by rm.created_at desc;
end;
$$ language plpgsql stable;

-- Supabase Storage policies
-- Note: These must be configured in the Supabase Dashboard under Storage -> Policies

-- Policy for 'documents' bucket:
-- Allow authenticated users to upload and view their own documents in a folder named after their user ID.
-- Target roles: authenticated
-- Allowed operations: SELECT, INSERT
-- WITH CHECK expression for INSERT:
--   bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text
-- USING expression for SELECT:
--   bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text
