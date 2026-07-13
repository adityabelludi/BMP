-- ============================================================
-- BMP - Belludi Masala Products :: Initial schema
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- PRODUCTS ----------
create table if not exists public.products (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  name            text not null,
  short_description text not null default '',
  description     text not null default '',
  image_url       text not null default '',
  category        text not null default 'General',
  spice_default   text not null default 'Medium'
                    check (spice_default in ('Mild','Medium','High')),
  is_bestseller   boolean not null default false,
  variants        jsonb not null default '[]'::jsonb, -- [{size,price,weight_grams}]
  created_at      timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_bestseller_idx on public.products (is_bestseller);

-- ---------- ORDERS ----------
create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  customer_name   text not null,
  phone           text not null,
  address_line    text not null,
  city            text not null,
  state           text not null,
  pincode         text not null,
  notes           text,
  items           jsonb not null default '[]'::jsonb, -- snapshot of OrderItem[]
  subtotal        integer not null default 0,
  delivery_charge integer not null default 200,
  total_amount    integer not null default 0,
  status          text not null default 'Pending'
                    check (status in ('Pending','Processing','Shipped','Delivered','Cancelled')),
  created_at      timestamptz not null default now()
);

create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- ---------- ORDER ITEMS (optional normalized copy) ----------
create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  product_id    uuid references public.products(id) on delete set null,
  name          text not null,
  size          text not null,
  spice_level   text not null,
  price         integer not null,
  quantity      integer not null,
  line_total    integer not null
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- PRODUCTS: readable by everyone (public storefront)
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read"
  on public.products for select
  using (true);

-- PRODUCTS: only authenticated (admin) users may write
drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write"
  on public.products for all
  to authenticated
  using (true)
  with check (true);

-- ORDERS: creation is handled server-side with the service role key,
-- which bypasses RLS. Authenticated admins may read & update.
drop policy if exists "orders_admin_read" on public.orders;
create policy "orders_admin_read"
  on public.orders for select
  to authenticated
  using (true);

drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update"
  on public.orders for update
  to authenticated
  using (true)
  with check (true);

-- ORDER ITEMS: admins may read
drop policy if exists "order_items_admin_read" on public.order_items;
create policy "order_items_admin_read"
  on public.order_items for select
  to authenticated
  using (true);

-- ============================================================
-- Table grants
-- RLS (above) does the real gating for anon/authenticated;
-- service_role bypasses RLS and needs full privileges for
-- server-side order inserts and seeding.
-- ============================================================
grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete
  on all tables in schema public
  to anon, authenticated;

grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
