-- ============================================================
-- BMP :: Hosted setup (GENERATED — do not edit by hand)
-- Paste this whole file into the Supabase SQL Editor and press Run.
-- Safe to run more than once.
-- ============================================================


-- ===================== 20260101000000_init.sql =====================
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


-- ===================== 20260102000000_products_admin.sql =====================
-- ============================================================
-- BMP :: Product management — stock flag + image storage
-- ============================================================

-- Per-product stock flag
alter table public.products
  add column if not exists in_stock boolean not null default true;

-- ---------- Storage bucket for product images ----------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Public read of product images
drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Only authenticated (admin) users may upload / replace / remove
drop policy if exists "product_images_auth_insert" on storage.objects;
create policy "product_images_auth_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images');

drop policy if exists "product_images_auth_update" on storage.objects;
create policy "product_images_auth_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'product-images');

drop policy if exists "product_images_auth_delete" on storage.objects;
create policy "product_images_auth_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images');


-- ===================== 20260103000000_customer_accounts.sql =====================
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


-- ===================== 20260104000000_security_hardening.sql =====================
-- ============================================================
-- BMP :: Security hardening
--   * Restrict product writes to admins only (was: any authenticated)
--   * Restrict product-image uploads to admins only
-- ============================================================

-- ---------- PRODUCTS: writes admin-only ----------
drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write"
  on public.products for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- STORAGE: product images uploaded by admins only ----------
drop policy if exists "product_images_auth_insert" on storage.objects;
create policy "product_images_auth_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product_images_auth_update" on storage.objects;
create policy "product_images_auth_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product_images_auth_delete" on storage.objects;
create policy "product_images_auth_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());


-- ===================== seed: products =====================
insert into public.products (slug,name,short_description,description,image_url,category,spice_default,is_bestseller,in_stock,variants) values
('pulihora-powder','Pulihora Powder','Tangy tamarind rice mix, temple-style.','Our Pulihora (tamarind rice) powder is a fragrant blend of roasted lentils, sesame, curry leaves and tangy tamarind — the same recipe served as prasadam in Karnataka temples. Just mix with hot rice and a spoon of ghee for an instant, soul-warming meal.','/products/pulihora_powder.png','Rice Mixes','Medium',true,true,'[{"size":"100g","price":40,"weight_grams":100},{"size":"500g","price":200,"weight_grams":500},{"size":"1kg","price":400,"weight_grams":1000}]'::jsonb),
('bisi-bele-bath-powder','Bisi Bele Bath Powder','Karnataka''s iconic hot lentil-rice spice.','Bisi Bele Bath — literally ''hot lentil rice'' — is Karnataka''s most beloved comfort dish. Our stone-ground masala balances 12 spices, roasted dals and dagad phool for that unmistakable aroma. Cook with rice, toor dal and vegetables for a complete one-pot meal.','/products/bisi_bele_bath_powder.png','Rice Mixes','Medium',true,true,'[{"size":"100g","price":40,"weight_grams":100},{"size":"500g","price":200,"weight_grams":500},{"size":"1kg","price":400,"weight_grams":1000}]'::jsonb),
('sambar-powder','Sambar Powder','Everyday South Indian sambar, done right.','A perfectly balanced sambar powder made from sun-dried red chillies, coriander, roasted dals and fenugreek. Rich, aromatic and never bitter — the backbone of everyday South Indian cooking. Works beautifully for sambar, rasam and vegetable curries.','/products/sambar_powder.png','Curry Powders','Medium',true,true,'[{"size":"100g","price":40,"weight_grams":100},{"size":"500g","price":200,"weight_grams":500},{"size":"1kg","price":400,"weight_grams":1000}]'::jsonb),
('holige-sambar-powder','Holige Sambar Powder','Festive sweet-savoury holige accompaniment.','A specialty blend crafted to pair with holige (obbattu). This nuanced sambar powder brings a gentle sweetness and depth that complements festive meals. A Karnataka festival table essential.','/products/holige_sambar_powder.png','Curry Powders','Medium',false,true,'[{"size":"100g","price":40,"weight_grams":100},{"size":"500g","price":200,"weight_grams":500},{"size":"1kg","price":400,"weight_grams":1000}]'::jsonb),
('kurshani-chutney-powder','Kurshani Chutney Powder','Fiery red chilli chutney podi.','Kurshani (red chilli) chutney powder for those who love heat with flavour. Roasted chillies, garlic and tamarind pound into a bold, punchy podi. Mix with oil or ghee and pair with idli, dosa, or hot rice.','/products/kurshani_chutney_powder.png','Chutney Powders','High',false,true,'[{"size":"100g","price":40,"weight_grams":100},{"size":"500g","price":200,"weight_grams":500},{"size":"1kg","price":400,"weight_grams":1000}]'::jsonb),
('kadle-chutney-powder','Kadle Chutney Powder','Roasted gram (putani) chutney podi.','Made from roasted Bengal gram (kadle / putani), this nutty, protein-rich chutney powder is a breakfast staple. Lightly spiced and deeply satisfying with idli, dosa and akki rotti.','/products/kadle_chutney_powder.png','Chutney Powders','Medium',true,true,'[{"size":"100g","price":40,"weight_grams":100},{"size":"500g","price":200,"weight_grams":500},{"size":"1kg","price":400,"weight_grams":1000}]'::jsonb),
('shenga-chutney-powder','Shenga Chutney Powder','North-Karnataka groundnut chutney podi.','Shenga (groundnut) chutney powder is North Karnataka''s pride. Roasted peanuts, garlic and red chilli come together in a rich, earthy podi that is unbeatable with jowar rotti and a drizzle of oil.','/products/Shengha_chutney_powder.png','Chutney Powders','Medium',true,true,'[{"size":"100g","price":40,"weight_grams":100},{"size":"500g","price":200,"weight_grams":500},{"size":"1kg","price":400,"weight_grams":1000}]'::jsonb),
('vangi-bath-powder','Vangi Bath Powder','Aromatic brinjal rice masala.','Vangi Bath powder transforms brinjal and rice into a fragrant, restaurant-style delight. A signature Karnataka blend of coriander, chana dal, cinnamon and coconut for warm, layered flavour in minutes.','/products/vangi_bath.png','Rice Mixes','Medium',false,true,'[{"size":"100g","price":40,"weight_grams":100},{"size":"500g","price":200,"weight_grams":500},{"size":"1kg","price":400,"weight_grams":1000}]'::jsonb)
on conflict (slug) do update set
  name=excluded.name, short_description=excluded.short_description,
  description=excluded.description, image_url=excluded.image_url,
  category=excluded.category, spice_default=excluded.spice_default,
  is_bestseller=excluded.is_bestseller, in_stock=excluded.in_stock,
  variants=excluded.variants;
