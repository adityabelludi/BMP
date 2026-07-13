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

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin");
  return { ok: true };
}
