import "server-only";
import type { Category, DeliverySettings, Product } from "@/types";
import { PRODUCTS, getProductBySlug as getSeedBySlug } from "@/lib/products";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { DELIVERY_CHARGE, DELIVERY_CHARGE_OUTSIDE } from "@/lib/constants";

/** Delivery charges (admin-configurable). Falls back to constants. */
export async function getDeliverySettings(): Promise<DeliverySettings> {
  const fallback: DeliverySettings = {
    delivery_within_india: DELIVERY_CHARGE,
    delivery_outside_india: DELIVERY_CHARGE_OUTSIDE,
  };
  if (!isSupabaseConfigured()) return fallback;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("store_settings")
      .select("delivery_within_india, delivery_outside_india")
      .maybeSingle();
    if (error || !data) return fallback;
    return data as DeliverySettings;
  } catch {
    return fallback;
  }
}

/** Delivery charge for a given country. */
export function deliveryForCountry(
  settings: DeliverySettings,
  country: string
): number {
  return country.trim().toLowerCase() === "india"
    ? settings.delivery_within_india
    : settings.delivery_outside_india;
}

/**
 * Managed category list for the admin dropdown + storefront filters.
 * Falls back to the distinct categories used by the seed catalog.
 */
export async function getCategories(): Promise<Category[]> {
  const fallback = (): Category[] =>
    [...new Set(PRODUCTS.map((p) => p.category))]
      .filter(Boolean)
      .sort()
      .map((name, i) => ({ id: `seed-cat-${i}`, name }));

  if (!isSupabaseConfigured()) return fallback();

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });
    if (error || !data) return fallback();
    return data as Category[];
  } catch {
    return fallback();
  }
}

/**
 * Fetch all products. Falls back to the static seed catalog when Supabase
 * is not configured or unreachable — so the storefront always renders.
 */
export async function getProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return PRODUCTS;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("is_bestseller", { ascending: false })
      .order("name", { ascending: true });

    if (error || !data || data.length === 0) return PRODUCTS;
    return data as Product[];
  } catch {
    return PRODUCTS;
  }
}

export async function getBestsellers(): Promise<Product[]> {
  const all = await getProducts();
  const best = all.filter((p) => p.is_bestseller);
  return (best.length ? best : all).slice(0, 4);
}

export async function getProductBySlug(
  slug: string
): Promise<Product | undefined> {
  if (!isSupabaseConfigured()) return getSeedBySlug(slug);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) return getSeedBySlug(slug);
    return data as Product;
  } catch {
    return getSeedBySlug(slug);
  }
}
