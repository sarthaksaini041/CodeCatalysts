alter table public.admin_users enable row level security;
alter table public.admin_users force row level security;

drop policy if exists "Admins can add admin users" on public.admin_users;
create policy "Admins can add admin users"
on public.admin_users
for insert
to authenticated
with check (public.is_admin());