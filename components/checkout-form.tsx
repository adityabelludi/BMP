"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/store/cart";
import { checkoutSchema, type CheckoutInput } from "@/lib/validators";
import { createOrder } from "@/app/actions/orders";
import { formatINR } from "@/lib/utils";
import type { OrderItem } from "@/types";

export function CheckoutForm({
  deliveryWithinIndia,
  deliveryOutsideIndia,
}: {
  deliveryWithinIndia: number;
  deliveryOutsideIndia: number;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);

  useEffect(() => setMounted(true), []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { notes: "", country: "India" },
  });

  const country = watch("country") ?? "India";
  const deliveryCharge =
    country.toLowerCase() === "india"
      ? deliveryWithinIndia
      : deliveryOutsideIndia;

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = subtotal + (items.length ? deliveryCharge : 0);

  async function onSubmit(values: CheckoutInput) {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    setSubmitting(true);

    const orderItems: OrderItem[] = items.map((i) => ({
      product_id: i.product_id,
      name: i.name,
      size: i.size,
      spice_level: i.spice_level,
      price: i.price,
      quantity: i.quantity,
      line_total: i.price * i.quantity,
    }));

    const res = await createOrder({ ...values, items: orderItems });
    setSubmitting(false);

    if (!res.ok) {
      toast.error(res.error || "Could not place your order");
      return;
    }

    clear();
    toast.success("Order placed successfully!");
    router.push(`/order-success/${res.orderId}`);
  }

  if (!mounted) return <div className="container py-24" aria-hidden />;

  if (items.length === 0) {
    return (
      <div className="container flex flex-col items-center gap-5 py-28 text-center">
        <h1 className="heading-serif text-3xl font-bold">Nothing to check out</h1>
        <p className="text-maroon-600">Your cart is empty.</p>
        <Button asChild size="lg">
          <Link href="/shop">Browse Masalas</Link>
        </Button>
      </div>
    );
  }

  const fieldError = (name: keyof CheckoutInput) =>
    errors[name] ? (
      <p className="mt-1 text-xs text-rose-600">{errors[name]?.message}</p>
    ) : null;

  return (
    <div className="container py-12">
      <h1 className="mb-8 heading-serif text-3xl font-bold md:text-4xl">
        Checkout
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-8 lg:grid-cols-[1.6fr_1fr]"
      >
        {/* Delivery details */}
        <div className="space-y-6 rounded-2xl border border-cream-300 bg-white p-6 shadow-sm md:p-8">
          <h2 className="font-heading text-xl font-semibold text-maroon-800">
            Delivery Details
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="customer_name">Full Name *</Label>
              <Input
                id="customer_name"
                placeholder="e.g. Sharada Belludi"
                className="mt-1.5"
                {...register("customer_name")}
              />
              {fieldError("customer_name")}
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="country">Country / Region *</Label>
              <select
                id="country"
                className="mt-1.5 flex h-11 w-full rounded-xl border border-cream-300 bg-white px-4 text-sm text-maroon-900 shadow-sm focus-visible:border-saffron-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-200"
                {...register("country")}
              >
                <option value="India">India</option>
                <option value="Outside India">Outside India</option>
              </select>
              {fieldError("country")}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                inputMode="numeric"
                placeholder="10-digit mobile"
                className="mt-1.5"
                {...register("phone")}
              />
              {fieldError("phone")}
            </div>

            <div>
              <Label htmlFor="pincode">Pincode *</Label>
              <Input
                id="pincode"
                inputMode="numeric"
                placeholder="6-digit pincode"
                className="mt-1.5"
                {...register("pincode")}
              />
              {fieldError("pincode")}
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="address_line">Full Address *</Label>
              <Textarea
                id="address_line"
                placeholder="House / flat no., street, area, landmark"
                className="mt-1.5"
                {...register("address_line")}
              />
              {fieldError("address_line")}
            </div>

            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                placeholder="e.g. Bengaluru"
                className="mt-1.5"
                {...register("city")}
              />
              {fieldError("city")}
            </div>

            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                placeholder="e.g. Karnataka"
                className="mt-1.5"
                {...register("state")}
              />
              {fieldError("state")}
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="notes">Order Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any delivery instructions or preferences…"
                className="mt-1.5"
                {...register("notes")}
              />
              {fieldError("notes")}
            </div>
          </div>
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-2xl border border-cream-300 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <h2 className="font-heading text-xl font-semibold text-maroon-800">
            Your Order
          </h2>

          <div className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
            {items.map((i) => (
              <div key={i.key} className="flex justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium text-maroon-800">{i.name}</p>
                  <div className="mt-0.5 flex flex-wrap gap-1.5">
                    <Badge variant="outline">{i.size}</Badge>
                    <Badge variant="gold">{i.spice_level}</Badge>
                    <span className="text-xs text-maroon-500">× {i.quantity}</span>
                  </div>
                </div>
                <span className="whitespace-nowrap font-medium text-maroon-800">
                  {formatINR(i.price * i.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-2.5 border-t border-cream-200 pt-4 text-sm">
            <div className="flex justify-between text-maroon-600">
              <span>Subtotal</span>
              <span className="font-medium text-maroon-800">
                {formatINR(subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-maroon-600">
              <span>
                Delivery{" "}
                <span className="text-xs text-maroon-400">
                  ({country.toLowerCase() === "india" ? "within India" : "international"})
                </span>
              </span>
              <span className="font-medium text-maroon-800">
                {formatINR(deliveryCharge)}
              </span>
            </div>
            <div className="flex justify-between border-t border-cream-200 pt-3 text-lg font-bold text-maroon-900">
              <span>Total</span>
              <span>{formatINR(total)}</span>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="mt-6 w-full"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Placing order…
              </>
            ) : (
              <>
                Place Order <ArrowRight className="h-5 w-5" />
              </>
            )}
          </Button>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-maroon-500">
            <Lock className="h-3.5 w-3.5" /> Cash on Delivery · Pay when it arrives
          </p>
        </aside>
      </form>
    </div>
  );
}
