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
