"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { productSchema, type ProductInput } from "@/lib/validators";

export type ProductActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };

/** Returns an authenticated client only if the caller is a verified admin. */
async function getAdminClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) return null;
  return supabase;
}

function revalidateStore() {
  revalidatePath("/admin");
  revalidatePath("/shop");
  revalidatePath("/");
}

/** Ensure a category typed on the product form exists in the managed list. */
async function ensureCategory(
  supabase: Awaited<ReturnType<typeof createClient>>,
  name: string
) {
  const clean = name.trim();
  if (!clean) return;
  await supabase
    .from("categories")
    .upsert({ name: clean }, { onConflict: "name", ignoreDuplicates: true });
}

export async function createProduct(
  input: ProductInput
): Promise<ProductActionResult> {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid product" };
  }

  const supabase = await getAdminClient();
  if (!supabase) return { ok: false, error: "Not authorized" };

  const { data, error } = await supabase
    .from("products")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "A product with this slug already exists" };
    }
    return { ok: false, error: error.message };
  }

  await ensureCategory(supabase, parsed.data.category);
  revalidateStore();
  return { ok: true, id: data.id };
}

export async function updateProduct(
  id: string,
  input: ProductInput
): Promise<ProductActionResult> {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid product" };
  }

  const supabase = await getAdminClient();
  if (!supabase) return { ok: false, error: "Not authorized" };

  const { error } = await supabase
    .from("products")
    .update(parsed.data)
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "A product with this slug already exists" };
    }
    return { ok: false, error: error.message };
  }

  await ensureCategory(supabase, parsed.data.category);
  revalidateStore();
  return { ok: true, id };
}

export async function deleteProduct(
  id: string
): Promise<ProductActionResult> {
  const supabase = await getAdminClient();
  if (!supabase) return { ok: false, error: "Not authorized" };

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidateStore();
  return { ok: true };
}

export async function toggleStock(
  id: string,
  in_stock: boolean
): Promise<ProductActionResult> {
  const supabase = await getAdminClient();
  if (!supabase) return { ok: false, error: "Not authorized" };

  const { error } = await supabase
    .from("products")
    .update({ in_stock })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidateStore();
  return { ok: true };
}
