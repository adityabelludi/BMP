import "server-only";
import type { Product } from "@/types";
import { PRODUCTS, getProductBySlug as getSeedBySlug } from "@/lib/products";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

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
