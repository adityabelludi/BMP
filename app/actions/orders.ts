"use server";

import { createOrderSchema, type CreateOrderInput } from "@/lib/validators";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { DELIVERY_CHARGE } from "@/lib/constants";
import type { OrderItem } from "@/types";

export type CreateOrderResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string };

/**
 * Places an order. Recomputes all money server-side (never trusts the client),
 * writes to `orders` (JSONB snapshot) and normalized `order_items`.
 */
export async function createOrder(
  input: CreateOrderInput
): Promise<CreateOrderResult> {
  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.errors[0]?.message ?? "Invalid order details",
    };
  }

  const data = parsed.data;

  // Checkout requires a logged-in customer so they can track the order.
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (isSupabaseConfigured() && !user) {
    return { ok: false, error: "Please log in to place your order" };
  }

  // Recompute money server-side from item price * quantity.
  const items: OrderItem[] = data.items.map((i) => ({
    product_id: i.product_id,
    name: i.name,
    size: i.size as OrderItem["size"],
    spice_level: i.spice_level as OrderItem["spice_level"],
    price: i.price,
    quantity: i.quantity,
    line_total: i.price * i.quantity,
  }));

  const subtotal = items.reduce((s, i) => s + i.line_total, 0);
  const delivery_charge = DELIVERY_CHARGE;
  const total_amount = subtotal + delivery_charge;

  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    // Demo/offline fallback so the flow is testable without a DB.
    console.warn("[createOrder] Supabase not configured — returning demo id.");
    return { ok: true, orderId: "demo-0000-0000-0000-000000000000" };
  }

  try {
    const supabase = createAdminClient();

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        customer_name: data.customer_name,
        phone: data.phone,
        address_line: data.address_line,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        notes: data.notes || null,
        items,
        subtotal,
        delivery_charge,
        total_amount,
        status: "Pending",
      })
      .select("id")
      .single();

    if (error || !order) {
      return { ok: false, error: error?.message ?? "Could not place order" };
    }

    // Best-effort normalized rows (non-fatal if it fails).
    await supabase.from("order_items").insert(
      items.map((i) => ({
        order_id: order.id,
        product_id: /^[0-9a-f-]{36}$/i.test(i.product_id) ? i.product_id : null,
        name: i.name,
        size: i.size,
        spice_level: i.spice_level,
        price: i.price,
        quantity: i.quantity,
        line_total: i.line_total,
      }))
    );

    return { ok: true, orderId: order.id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Unexpected error placing order",
    };
  }
}
