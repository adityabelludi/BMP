"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CategoryResult =
  | { ok: true }
  | { ok: false; error: string };

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
}

export async function createCategory(name: string): Promise<CategoryResult> {
  const clean = name.trim();
  if (clean.length < 2) return { ok: false, error: "Category name is too short" };

  const supabase = await getAdminClient();
  if (!supabase) return { ok: false, error: "Not authorized" };

  const { error } = await supabase.from("categories").insert({ name: clean });
  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "That category already exists" };
    }
    return { ok: false, error: error.message };
  }
  revalidateStore();
  return { ok: true };
}

export async function renameCategory(
  id: string,
  name: string,
  previousName: string
): Promise<CategoryResult> {
  const clean = name.trim();
  if (clean.length < 2) return { ok: false, error: "Category name is too short" };

  const supabase = await getAdminClient();
  if (!supabase) return { ok: false, error: "Not authorized" };

  const { error } = await supabase
    .from("categories")
    .update({ name: clean })
    .eq("id", id);
  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "That category already exists" };
    }
    return { ok: false, error: error.message };
  }

  // Keep products in sync with the renamed category.
  if (previousName && previousName !== clean) {
    await supabase
      .from("products")
      .update({ category: clean })
      .eq("category", previousName);
  }

  revalidateStore();
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<CategoryResult> {
  const supabase = await getAdminClient();
  if (!supabase) return { ok: false, error: "Not authorized" };

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidateStore();
  return { ok: true };
}
