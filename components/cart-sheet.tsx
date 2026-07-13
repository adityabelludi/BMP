"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBag, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QuantityStepper } from "@/components/quantity-stepper";
import { SmartImage } from "@/components/smart-image";
import { useCart } from "@/store/cart";
import { formatINR } from "@/lib/utils";

export function CartSheet() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const items = useCart((s) => s.items);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const removeItem = useCart((s) => s.removeItem);

  useEffect(() => setMounted(true), []);

  const count = mounted ? items.reduce((n, i) => n + i.quantity, 0) : 0;
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="relative grid h-11 w-11 place-items-center rounded-full text-maroon-700 transition-colors hover:bg-saffron-50"
          aria-label={`Open cart, ${count} items`}
        >
          <ShoppingBag className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-saffron-500 px-1 text-[11px] font-bold text-white">
              {count}
            </span>
          )}
        </button>
      </SheetTrigger>

      <SheetContent className="p-0">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-saffron-500" />
            Your Cart {count > 0 && <span className="text-saffron-600">({count})</span>}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-cream-200">
              <ShoppingBag className="h-7 w-7 text-saffron-500" />
            </div>
            <p className="text-maroon-700">Your cart is empty.</p>
            <SheetClose asChild>
              <Button asChild variant="outline">
                <Link href="/shop">Browse Masalas</Link>
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              {items.map((item) => (
                <div key={item.key} className="flex gap-3">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-cream-200">
                    <SmartImage
                      src={item.image_url}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-maroon-800">
                          {item.name}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          <Badge variant="outline">{item.size}</Badge>
                          <Badge variant="gold">{item.spice_level}</Badge>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.key)}
                        aria-label={`Remove ${item.name}`}
                        className="text-maroon-400 transition-colors hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <QuantityStepper
                        value={item.quantity}
                        onChange={(v) => updateQuantity(item.key, v)}
                      />
                      <span className="text-sm font-semibold text-maroon-800">
                        {formatINR(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 border-t border-cream-300 bg-white px-6 py-5">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-base font-bold text-maroon-900">
                  <span>Subtotal</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                <p className="text-xs text-maroon-400">
                  Delivery calculated at checkout.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <SheetClose asChild>
                  <Button asChild variant="outline">
                    <Link href="/cart">View Cart</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild>
                    <Link href="/checkout">Checkout</Link>
                  </Button>
                </SheetClose>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
