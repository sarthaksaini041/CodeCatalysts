create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  department text not null,
  short_bio text not null,
  image_url text,
  image_path text,
  email text,
  github_url text,
  linkedin_url text,
  instagram_url text,
  twitter_url text,
  skills jsonb not null default '[]'::jsonb,
  display_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_description text not null,
  full_description text,
  image_url text,
  image_path text,
  tech_stack jsonb not null default '[]'::jsonb,
  github_url text,
  live_url text,
  category text,
  status text,
  featured boolean not null default false,
  display_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.journey_entries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date_label text not null,
  description text not null,
  icon_name text,
  display_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  hero_title text not null default 'Code Catalysts',
  hero_subtitle text not null default 'Not experts yet - just people who love learning and creating.',
  contact_email text,
  github_url text,
  linkedin_url text,
  instagram_url text,
  footer_text text not null default 'Copyright {year} Code Catalysts. Built by the team.',
  updated_at timestamptz not null default timezone('utc', now())
);

insert into public.site_settings (
  id,
  hero_title,
  hero_subtitle,
  contact_email,
  linkedin_url,
  instagram_url,
  footer_text
)
values (
  1,
  'Code Catalysts',
  'Not experts yet - just people who love learning and creating.',
  'team@codecatalysts.dev',
  'https://www.linkedin.com/company/code-catalysts000/',
  'https://www.instagram.com/codecatalysts',
  'Copyright {year} Code Catalysts. Built by the team.'
)
on conflict (id) do nothing;

drop trigger if exists members_set_updated_at on public.members;
create trigger members_set_updated_at
before update on public.members
for each row
execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

drop trigger if exists journey_entries_set_updated_at on public.journey_entries;
create trigger journey_entries_set_updated_at
before update on public.journey_entries
for each row
execute function public.set_updated_at();

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
before update on public.site_settings
for each row
execute function public.set_updated_at();

create index if not exists members_display_order_idx on public.members (display_order, created_at);
create index if not exists projects_display_order_idx on public.projects (display_order, created_at);
create index if not exists journey_entries_display_order_idx on public.journey_entries (display_order, created_at);

alter table public.admin_users enable row level security;
alter table public.members enable row level security;
alter table public.projects enable row level security;
alter table public.journey_entries enable row level security;
alter table public.site_settings enable row level security;

alter table public.admin_users force row level security;
alter table public.members force row level security;
alter table public.projects force row level security;
alter table public.journey_entries force row level security;
alter table public.site_settings force row level security;

drop policy if exists "Admin users can read their own membership" on public.admin_users;
create policy "Admin users can read their own membership"
on public.admin_users
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Public can read visible members" on public.members;
create policy "Public can read visible members"
on public.members
for select
to anon, authenticated
using (is_visible = true or public.is_admin());

drop policy if exists "Admins can manage members" on public.members;
create policy "Admins can manage members"
on public.members
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read visible projects" on public.projects;
create policy "Public can read visible projects"
on public.projects
for select
to anon, authenticated
using (is_visible = true or public.is_admin());

drop policy if exists "Admins can manage projects" on public.projects;
create policy "Admins can manage projects"
on public.projects
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read visible journey entries" on public.journey_entries;
create policy "Public can read visible journey entries"
on public.journey_entries
for select
to anon, authenticated
using (is_visible = true or public.is_admin());

drop policy if exists "Admins can manage journey entries" on public.journey_entries;
create policy "Admins can manage journey entries"
on public.journey_entries
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
on public.site_settings
for select
to anon, authenticated
using (true);

drop policy if exists "Admins can manage site settings" on public.site_settings;
create policy "Admins can manage site settings"
on public.site_settings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into storage.buckets (id, name, public)
values ('content-media', 'content-media', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Public can read content media" on storage.objects;
create policy "Public can read content media"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'content-media');

drop policy if exists "Admins can manage content media" on storage.objects;
create policy "Admins can manage content media"
on storage.objects
for all
to authenticated
using (bucket_id = 'content-media' and public.is_admin())
with check (bucket_id = 'content-media' and public.is_admin());
