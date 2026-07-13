"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SettingsResult = { ok: true } | { ok: false; error: string };

export async function updateDeliverySettings(
  withinIndia: number,
  outsideIndia: number
): Promise<SettingsResult> {
  if (
    !Number.isFinite(withinIndia) ||
    !Number.isFinite(outsideIndia) ||
    withinIndia < 0 ||
    outsideIndia < 0
  ) {
    return { ok: false, error: "Charges must be zero or a positive number" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) return { ok: false, error: "Not authorized" };

  const { data: updated, error } = await supabase
    .from("store_settings")
    .update({
      delivery_within_india: Math.round(withinIndia),
      delivery_outside_india: Math.round(outsideIndia),
      updated_at: new Date().toISOString(),
    })
    .eq("id", true)
    .select("id");

  if (error) return { ok: false, error: error.message };
  if (!updated || updated.length === 0) {
    return { ok: false, error: "Could not update settings" };
  }

  revalidatePath("/admin");
  revalidatePath("/checkout");
  return { ok: true };
}
