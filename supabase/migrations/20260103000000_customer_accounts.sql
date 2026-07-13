-- ============================================================
-- BMP :: Customer accounts
--   * link orders to a customer (auth.users)
--   * admins table + is_admin() as single source of truth
--   * RLS so customers see only their own orders, admins see all
-- ============================================================

-- ---------- Link orders to a customer ----------
alter table public.orders
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists orders_user_idx on public.orders (user_id);

-- ---------- Admins registry ----------
create table if not exists public.admins (
  email      text primary key,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

grant select on public.admins to authenticated;
grant all on public.admins to service_role;

-- A user may check whether their own email is an admin
drop policy if exists "admins_self_read" on public.admins;
create policy "admins_self_read"
  on public.admins for select
  to authenticated
  using (email = (auth.jwt() ->> 'email'));

-- Security-definer helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where email = (auth.jwt() ->> 'email')
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- Seed the first admin (change/add via the admins table)
insert into public.admins (email) values ('adityabelludi@gmail.com')
on conflict (email) do nothing;

-- ============================================================
-- Orders RLS — replace the old blanket-authenticated policies
-- ============================================================
drop policy if exists "orders_admin_read" on public.orders;
drop policy if exists "orders_admin_update" on public.orders;

-- Customers read their own orders; admins read all
drop policy if exists "orders_select" on public.orders;
create policy "orders_select"
  on public.orders for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- Customers create orders they own (checkout requires login)
drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own"
  on public.orders for insert
  to authenticated
  with check (user_id = auth.uid());

-- Only admins change status
drop policy if exists "orders_update" on public.orders;
create policy "orders_update"
  on public.orders for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ORDER ITEMS: admins read
drop policy if exists "order_items_admin_read" on public.order_items;
create policy "order_items_admin_read"
  on public.order_items for select
  to authenticated
  using (public.is_admin());
