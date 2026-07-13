/**
 * Seed the Supabase `products` table with the BMP catalog.
 *
 * Usage:
 *   1. Ensure .env.local has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 *   2. npm run seed
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { PRODUCTS } from "../lib/products";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log(`🌱 Seeding ${PRODUCTS.length} products...`);

  const rows = PRODUCTS.map((p) => ({
    slug: p.slug,
    name: p.name,
    short_description: p.short_description,
    description: p.description,
    image_url: p.image_url,
    category: p.category,
    spice_default: p.spice_default,
    is_bestseller: p.is_bestseller,
    in_stock: p.in_stock,
    variants: p.variants,
  }));

  const { data, error } = await supabase
    .from("products")
    .upsert(rows, { onConflict: "slug" })
    .select("slug");

  if (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }

  console.log(`✅ Seeded ${data?.length ?? 0} products successfully.`);
  process.exit(0);
}

main();
