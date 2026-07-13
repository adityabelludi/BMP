/**
 * Uploads the original product PNGs from /public/products into the
 * Supabase `product-images` storage bucket, then points each product's
 * image_url at the new public Storage URL.
 *
 * Usage:  npm run migrate:images
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { join } from "node:path";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("❌ Missing Supabase env vars in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const BUCKET = "product-images";

// slug -> source filename in public/products
const MAP: Record<string, string> = {
  "pulihora-powder": "pulihora_powder.png",
  "bisi-bele-bath-powder": "bisi_bele_bath_powder.png",
  "sambar-powder": "sambar_powder.png",
  "holige-sambar-powder": "holige_sambar_powder.png",
  "kurshani-chutney-powder": "kurshani_chutney_powder.png",
  "kadle-chutney-powder": "kadle_chutney_powder.png",
  "shenga-chutney-powder": "Shengha_chutney_powder.png",
  "vangi-bath-powder": "vangi_bath.png",
};

async function main() {
  console.log(`🖼️  Migrating ${Object.keys(MAP).length} images to Storage…`);

  for (const [slug, filename] of Object.entries(MAP)) {
    const filePath = join(process.cwd(), "public", "products", filename);
    let file: Buffer;
    try {
      file = readFileSync(filePath);
    } catch {
      console.warn(`  ⚠️  ${filename} not found in public/products — skipping`);
      continue;
    }

    const storagePath = `seed/${filename}`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, {
        upsert: true,
        contentType: "image/png",
      });
    if (upErr) {
      console.error(`  ❌ upload ${filename}: ${upErr.message}`);
      continue;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

    const { error: updErr } = await supabase
      .from("products")
      .update({ image_url: publicUrl })
      .eq("slug", slug);

    if (updErr) {
      console.error(`  ❌ db update ${slug}: ${updErr.message}`);
      continue;
    }

    console.log(`  ✅ ${slug} → ${publicUrl}`);
  }

  console.log("✨ Image migration complete.");
  process.exit(0);
}

main();
