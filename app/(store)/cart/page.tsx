"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuantityStepper } from "@/components/quantity-stepper";
import { SmartImage } from "@/components/smart-image";
import { useCart } from "@/store/cart";
import { formatINR } from "@/lib/utils";
import { SPICE_LEVELS } from "@/lib/constants";
import type { SpiceLevel } from "@/types";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const items = useCart((s) => s.items);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const updateSpice = useCart((s) => s.updateSpice);
  const removeItem = useCart((s) => s.removeItem);
  const clear = useCart((s) => s.clear);

  useEffect(() => setMounted(true), []);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  if (!mounted) {
    return <div className="container py-24" aria-hidden />;
  }

  if (items.length === 0) {
    return (
      <div className="container flex flex-col items-center justify-center gap-5 py-28 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-cream-200">
          <ShoppingBag className="h-9 w-9 text-saffron-500" />
        </div>
        <h1 className="heading-serif text-3xl font-bold">Your cart is empty</h1>
        <p className="max-w-sm text-maroon-600">
          Looks like you haven't added any masalas yet. Let's fix that.
        </p>
        <Button asChild size="lg">
          <Link href="/shop">
            Browse Masalas <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mb-8 flex items-end justify-between">
        <h1 className="heading-serif text-3xl font-bold md:text-4xl">
          Your Cart
        </h1>
        <button
          onClick={clear}
          className="text-sm text-maroon-500 underline-offset-4 hover:text-rose-600 hover:underline"
        >
          Clear cart
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.7fr_1fr]">
        {/* Items */}
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.key}
              className="flex flex-col gap-4 rounded-2xl border border-cream-300 bg-white p-4 shadow-sm sm:flex-row"
            >
              <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl bg-cream-200 sm:h-28 sm:w-28">
                <SmartImage
                  src={item.image_url}
                  alt={item.name}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/product/${item.slug}`}
                      className="font-heading text-lg font-semibold text-maroon-800 hover:text-saffron-600"
                    >
                      {item.name}
                    </Link>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{item.size}</Badge>
                      <Select
                        value={item.spice_level}
                        onValueChange={(v) =>
                          updateSpice(item.key, v as SpiceLevel)
                        }
                      >
                        <SelectTrigger className="h-8 w-[110px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SPICE_LEVELS.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.key)}
                    aria-label={`Remove ${item.name}`}
                    className="text-maroon-400 transition-colors hover:text-rose-600"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-auto flex items-center justify-between pt-4">
                  <QuantityStepper
                    value={item.quantity}
                    onChange={(v) => updateQuantity(item.key, v)}
                  />
                  <div className="text-right">
                    <p className="text-xs text-maroon-500">
                      {formatINR(item.price)} each
                    </p>
                    <p className="font-heading text-lg font-bold text-maroon-900">
                      {formatINR(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-2xl border border-cream-300 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <h2 className="font-heading text-xl font-semibold text-maroon-800">
            Order Summary
          </h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between border-b border-cream-200 pb-3 text-lg font-bold text-maroon-900">
              <span>Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            <p className="text-xs text-maroon-400">
              Delivery is calculated at checkout based on your delivery country.
            </p>
          </div>

          <Button asChild size="lg" className="mt-6 w-full">
            <Link href="/checkout">
              Proceed to Checkout <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="ghost" className="mt-2 w-full">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
