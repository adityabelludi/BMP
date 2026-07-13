"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ORDER_STATUSES } from "@/lib/constants";
import type { OrderStatus } from "@/types";

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<{ ok: boolean; error?: string }> {
  if (!ORDER_STATUSES.includes(status)) {
    return { ok: false, error: "Invalid status" };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) return { ok: false, error: "Not authorized" };

  const { data: updated, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select("id");

  if (error) return { ok: false, error: error.message };
  if (!updated || updated.length === 0) {
    return { ok: false, error: "Order not found or not permitted" };
  }

  revalidatePath("/admin");
  return { ok: true };
}
