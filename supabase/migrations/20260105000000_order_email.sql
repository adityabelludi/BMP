-- ============================================================
-- BMP :: Store customer email on orders (for status emails)
-- ============================================================
alter table public.orders
  add column if not exists email text;
