-- 1. PROFILES TABLE
-- Stores public-facing user data and subscription plan.
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  avatar_url text,
  subscription_plan text default 'Free'::text
);
alter table profiles enable row level security;
create policy "Users can view their own profile." on profiles for select using (auth.uid() = id);
create policy "Users can update their own profile." on profiles for update using (auth.uid() = id);

-- 2. NEW USER TRIGGER
-- This trigger automatically creates a profile for new users.
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. DOCUMENTS TABLE
-- Stores metadata for uploaded documents.
create table documents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  storage_path text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table documents enable row level security;
create policy "Users can manage their own documents." on documents for all using (auth.uid() = user_id);

-- 4. MESSAGES TABLE
-- Stores chat history for each document.
create table messages (
  id bigserial primary key,
  document_id uuid references documents on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table messages enable row level security;
create policy "Users can manage messages on their own documents." on messages for all using (auth.uid() = user_id);


-- 5. STORAGE BUCKET & POLICIES
-- Create a bucket for documents with restricted access.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documents', 'documents', false, 33554432, ARRAY['application/pdf']); -- 32MB limit

create policy "Users can manage their own documents in storage"
  on storage.objects for all using (
    bucket_id = 'documents' and
    auth.uid() = owner
  ) with check (
    bucket_id = 'documents' and
    auth.uid() = owner
  );
