alter table public.admin_users force row level security;
alter table public.members force row level security;
alter table public.projects force row level security;
alter table public.journey_entries force row level security;
alter table public.site_settings force row level security;

drop policy if exists "Admins can manage admin users" on public.admin_users;
