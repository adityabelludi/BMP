"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ShoppingBag, Check } from "lucide-react";
import type { Product, SizeCode, SpiceLevel } from "@/types";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/quantity-stepper";
import { useCart } from "@/store/cart";
import { SPICE_LEVELS } from "@/lib/constants";
import { cn, formatINR } from "@/lib/utils";

export function AddToCart({ product }: { product: Product }) {
  const addItem = useCart((s) => s.addItem);

  const [size, setSize] = useState<SizeCode>(product.variants[0]?.size ?? "");
  const [spice, setSpice] = useState<SpiceLevel>(product.spice_default);
  const [qty, setQty] = useState(1);

  const price = useMemo(() => {
    const v = product.variants.find((x) => x.size === size);
    return v?.price ?? 0;
  }, [product.variants, size]);

  const availableSizes = product.variants.map((v) => v.size);

  function handleAdd() {
    addItem(product, size, price, spice, qty);
    toast.success(`Added to cart`, {
      description: `${product.name} · ${size} · ${spice} × ${qty}`,
      icon: <Check className="h-4 w-4" />,
    });
  }

  return (
    <div className="space-y-6">
      {/* Size */}
      <div>
        <p className="mb-2 text-sm font-semibold text-maroon-800">Size</p>
        <div className="flex flex-wrap gap-2.5">
          {availableSizes.map((s) => {
            const v = product.variants.find((x) => x.size === s)!;
            const active = s === size;
            return (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={cn(
                  "flex min-w-[92px] flex-col items-center rounded-xl border px-4 py-2.5 transition-all",
                  active
                    ? "border-saffron-500 bg-saffron-50 ring-1 ring-saffron-300"
                    : "border-cream-300 bg-white hover:border-saffron-300"
                )}
              >
                <span className="text-sm font-semibold text-maroon-800">
                  {s}
                </span>
                <span className="text-xs text-saffron-600">
                  {formatINR(v.price)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Spice level */}
      <div>
        <p className="mb-2 text-sm font-semibold text-maroon-800">
          Spice Level
        </p>
        <div className="flex flex-wrap gap-2.5">
          {SPICE_LEVELS.map((s) => {
            const active = s === spice;
            return (
              <button
                key={s}
                onClick={() => setSpice(s)}
                className={cn(
                  "rounded-full border px-5 py-2 text-sm font-medium transition-all",
                  active
                    ? "border-maroon-500 bg-maroon-500 text-white"
                    : "border-cream-300 bg-white text-maroon-700 hover:border-maroon-300"
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity + Add */}
      {product.in_stock ? (
        <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center">
          <QuantityStepper value={qty} onChange={setQty} />
          <Button size="lg" className="flex-1" onClick={handleAdd}>
            <ShoppingBag className="h-5 w-5" />
            Add to Cart · {formatINR(price * qty)}
          </Button>
        </div>
      ) : (
        <div className="pt-2">
          <Button size="lg" className="w-full" variant="secondary" disabled>
            Sold out
          </Button>
          <p className="mt-2 text-center text-sm text-maroon-500">
            This masala is currently out of stock. Please check back soon.
          </p>
        </div>
      )}
    </div>
  );
}
