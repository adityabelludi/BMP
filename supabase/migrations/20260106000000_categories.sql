-- ============================================================
-- BMP :: Managed categories
-- ============================================================
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text unique not null,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

grant select on public.categories to anon;
grant select, insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;

-- Publicly readable (storefront filters)
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read"
  on public.categories for select
  using (true);

-- Admin-only writes
drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write"
  on public.categories for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Seed from categories already used by products
insert into public.categories (name)
select distinct category
from public.products
where coalesce(category, '') <> ''
on conflict (name) do nothing;
