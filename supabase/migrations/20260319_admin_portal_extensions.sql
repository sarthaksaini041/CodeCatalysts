create extension if not exists pgcrypto;

alter table public.site_settings
  add column if not exists twitter_url text,
  add column if not exists cta_button_text text not null default 'Join the Build Squad',
  add column if not exists brand_primary_label text,
  add column if not exists brand_primary_url text,
  add column if not exists brand_secondary_label text,
  add column if not exists brand_secondary_url text;

update public.site_settings
set cta_button_text = coalesce(nullif(cta_button_text, ''), 'Join the Build Squad')
where id = 1;

create table if not exists public."Applications" (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  year text,
  college text,
  branch text,
  github text,
  linkedin text,
  portfolio text,
  domain text not null,
  tech_stack text not null,
  why_join text,
  project text,
  is_read boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public."Applications"
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists portfolio text,
  add column if not exists is_read boolean not null default false,
  add column if not exists created_at timestamptz not null default timezone('utc', now()),
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

update public."Applications"
set id = coalesce(id, gen_random_uuid())
where id is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public."Applications"'::regclass
      and contype = 'p'
  ) then
    alter table public."Applications" add primary key (id);
  end if;
end $$;

alter table public."Applications" alter column id set default gen_random_uuid();

drop trigger if exists applications_set_updated_at on public."Applications";
create trigger applications_set_updated_at
before update on public."Applications"
for each row
execute function public.set_updated_at();

create index if not exists applications_created_at_idx
on public."Applications" (created_at desc);

alter table public."Applications" enable row level security;
alter table public."Applications" force row level security;

drop policy if exists "Admins can manage applications" on public."Applications";
create policy "Admins can manage applications"
on public."Applications"
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
