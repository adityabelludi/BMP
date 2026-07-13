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
