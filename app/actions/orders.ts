"use server";

import { createOrderSchema, type CreateOrderInput } from "@/lib/validators";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { DELIVERY_CHARGE } from "@/lib/constants";
import { sendEmail } from "@/lib/email";
import { orderConfirmationEmail } from "@/lib/email-templates";
import type { Order, OrderItem } from "@/types";

const MAX_QTY_PER_LINE = 99;

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

  // Guard against absurd quantities.
  if (data.items.some((i) => i.quantity > MAX_QTY_PER_LINE)) {
    return { ok: false, error: `Quantity per item is limited to ${MAX_QTY_PER_LINE}` };
  }

  // Demo/offline fallback so the flow is testable without a DB.
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("[createOrder] Supabase not configured — returning demo id.");
    return { ok: true, orderId: "demo-0000-0000-0000-000000000000" };
  }

  // Checkout requires a logged-in customer so they can track the order.
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    return { ok: false, error: "Please log in to place your order" };
  }

  try {
    const supabase = createAdminClient();

    // ---- Authoritative pricing: never trust client prices ----
    const productIds = [...new Set(data.items.map((i) => i.product_id))];
    const { data: dbProducts, error: prodErr } = await supabase
      .from("products")
      .select("id, name, in_stock, variants")
      .in("id", productIds);

    if (prodErr) {
      return { ok: false, error: "Could not verify your cart. Please retry." };
    }

    const byId = new Map((dbProducts ?? []).map((p) => [p.id, p]));
    const items: OrderItem[] = [];

    for (const i of data.items) {
      const p = byId.get(i.product_id);
      if (!p) {
        return { ok: false, error: "A product in your cart is no longer available." };
      }
      if (!p.in_stock) {
        return { ok: false, error: `${p.name} is out of stock.` };
      }
      const variant = (p.variants as { size: string; price: number }[]).find(
        (v) => v.size === i.size
      );
      if (!variant) {
        return { ok: false, error: `Selected size is unavailable for ${p.name}.` };
      }
      const price = variant.price; // authoritative, from DB
      items.push({
        product_id: p.id,
        name: p.name, // authoritative name too
        size: i.size as OrderItem["size"],
        spice_level: i.spice_level as OrderItem["spice_level"],
        price,
        quantity: i.quantity,
        line_total: price * i.quantity,
      });
    }

    const subtotal = items.reduce((s, i) => s + i.line_total, 0);
    const delivery_charge = DELIVERY_CHARGE;
    const total_amount = subtotal + delivery_charge;

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        email: user.email ?? null,
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

    // Best-effort order confirmation email (never blocks the order).
    if (user.email) {
      const fullOrder: Order = {
        id: order.id,
        user_id: user.id,
        email: user.email,
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
        created_at: new Date().toISOString(),
      };
      const { subject, html } = orderConfirmationEmail(fullOrder);
      await sendEmail({ to: user.email, subject, html });
    }

    return { ok: true, orderId: order.id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Unexpected error placing order",
    };
  }
}
