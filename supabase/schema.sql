-- ===========================================================
-- LitSurvey Database Schema for Supabase
-- Run this in your Supabase SQL Editor
-- ===========================================================

-- 1. Enable pgvector extension for semantic search
create extension if not exists vector with schema extensions;

-- 2. Profiles table (auto-linked to Supabase Auth users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null default '',
  avatar_url text default '',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by authenticated users"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger: auto-create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email));
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Tags table
create table if not exists public.tags (
  id bigint generated always as identity primary key,
  name text not null unique,
  color text default '#6366f1',
  created_at timestamptz default now()
);

alter table public.tags enable row level security;

create policy "Tags are viewable by authenticated users"
  on public.tags for select using (auth.role() = 'authenticated');

create policy "Authenticated users can create tags"
  on public.tags for insert with check (auth.role() = 'authenticated');

-- Seed default tags
insert into public.tags (name, color) values
  ('VLA', '#8b5cf6'),
  ('Diffusion', '#ec4899'),
  ('Robotics', '#06b6d4'),
  ('NLP', '#f59e0b'),
  ('Computer Vision', '#10b981'),
  ('Reinforcement Learning', '#ef4444'),
  ('Transformers', '#6366f1'),
  ('Generative Models', '#14b8a6')
on conflict (name) do nothing;

-- 4. Papers table (with embedding vector column)
create table if not exists public.papers (
  id bigint generated always as identity primary key,
  title text not null,
  abstract text default '',
  authors text default '',
  url text not null,
  source text default 'manual',
  posted_by uuid references public.profiles(id) on delete set null,
  embedding extensions.vector(384),
  created_at timestamptz default now()
);

alter table public.papers enable row level security;

create policy "Papers are viewable by authenticated users"
  on public.papers for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert papers"
  on public.papers for insert with check (auth.role() = 'authenticated');

create policy "Users can delete own papers"
  on public.papers for delete using (auth.uid() = posted_by);

-- 5. Paper-Tags junction table (many-to-many)
create table if not exists public.paper_tags (
  paper_id bigint references public.papers(id) on delete cascade,
  tag_id bigint references public.tags(id) on delete cascade,
  primary key (paper_id, tag_id)
);

alter table public.paper_tags enable row level security;

create policy "Paper-tags viewable by authenticated users"
  on public.paper_tags for select using (auth.role() = 'authenticated');

create policy "Authenticated users can tag papers"
  on public.paper_tags for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can untag papers"
  on public.paper_tags for delete using (auth.role() = 'authenticated');

-- 6. Semantic search function (cosine similarity)
create or replace function match_papers(query_embedding extensions.vector(384), match_threshold float, match_count int)
returns table (
  id bigint,
  title text,
  abstract text,
  authors text,
  url text,
  source text,
  posted_by uuid,
  created_at timestamptz,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    p.id,
    p.title,
    p.abstract,
    p.authors,
    p.url,
    p.source,
    p.posted_by,
    p.created_at,
    1 - (p.embedding <=> query_embedding) as similarity
  from public.papers p
  where 1 - (p.embedding <=> query_embedding) > match_threshold
  order by p.embedding <=> query_embedding
  limit match_count;
end;
$$;
