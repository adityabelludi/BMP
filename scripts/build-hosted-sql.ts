/**
 * Generates supabase/hosted-setup.sql = all migrations + product seed,
 * ready to paste into the Supabase SQL Editor for a hosted project.
 *
 *   npm run build:sql
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PRODUCTS } from "../lib/products";

const root = process.cwd();
const migDir = join(root, "supabase", "migrations");

const files = readdirSync(migDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

const esc = (s: string) => s.replace(/'/g, "''");

let out =
  "-- ============================================================\n" +
  "-- BMP :: Hosted setup (GENERATED — do not edit by hand)\n" +
  "-- Paste this whole file into the Supabase SQL Editor and press Run.\n" +
  "-- Safe to run more than once.\n" +
  "-- ============================================================\n";

for (const f of files) {
  out += `\n\n-- ===================== ${f} =====================\n`;
  out += readFileSync(join(migDir, f), "utf8").trimEnd();
  out += "\n";
}

out += "\n\n-- ===================== seed: products =====================\n";
out +=
  "insert into public.products " +
  "(slug,name,short_description,description,image_url,category,spice_default,is_bestseller,in_stock,variants) values\n";
out += PRODUCTS.map((p) => {
  const variants = esc(JSON.stringify(p.variants));
  return (
    `('${esc(p.slug)}','${esc(p.name)}','${esc(p.short_description)}',` +
    `'${esc(p.description)}','${esc(p.image_url)}','${esc(p.category)}',` +
    `'${p.spice_default}',${p.is_bestseller},${p.in_stock},'${variants}'::jsonb)`
  );
}).join(",\n");
out +=
  "\non conflict (slug) do update set\n" +
  "  name=excluded.name, short_description=excluded.short_description,\n" +
  "  description=excluded.description, image_url=excluded.image_url,\n" +
  "  category=excluded.category, spice_default=excluded.spice_default,\n" +
  "  is_bestseller=excluded.is_bestseller, in_stock=excluded.in_stock,\n" +
  "  variants=excluded.variants;\n";

writeFileSync(join(root, "supabase", "hosted-setup.sql"), out, "utf8");
console.log(
  `✅ Wrote supabase/hosted-setup.sql (${files.length} migrations + ${PRODUCTS.length} products)`
);
