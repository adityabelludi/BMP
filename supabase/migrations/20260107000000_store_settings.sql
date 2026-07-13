-- ============================================================
-- BMP :: Store settings (customizable delivery charges) + order country
-- ============================================================

-- Singleton settings row (id is always true)
create table if not exists public.store_settings (
  id                     boolean primary key default true,
  delivery_within_india  integer not null default 200,
  delivery_outside_india integer not null default 1500,
  updated_at             timestamptz not null default now(),
  constraint store_settings_singleton check (id = true)
);

insert into public.store_settings (id) values (true)
on conflict (id) do nothing;

alter table public.store_settings enable row level security;

grant select on public.store_settings to anon, authenticated;
grant update on public.store_settings to authenticated;
grant all on public.store_settings to service_role;

drop policy if exists "store_settings_public_read" on public.store_settings;
create policy "store_settings_public_read"
  on public.store_settings for select
  using (true);

drop policy if exists "store_settings_admin_update" on public.store_settings;
create policy "store_settings_admin_update"
  on public.store_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Which country an order ships to (drives the delivery charge)
alter table public.orders
  add column if not exists country text not null default 'India';
