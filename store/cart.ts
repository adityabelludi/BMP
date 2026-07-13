"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product, SizeCode, SpiceLevel } from "@/types";
import { cartKey } from "@/lib/utils";
import { DELIVERY_CHARGE } from "@/lib/constants";

interface CartState {
  items: CartItem[];
  addItem: (
    product: Product,
    size: SizeCode,
    price: number,
    spice: SpiceLevel,
    quantity?: number
  ) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  updateSpice: (key: string, spice: SpiceLevel) => void;
  clear: () => void;
  // selectors
  count: () => number;
  subtotal: () => number;
  deliveryCharge: () => number;
  total: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, size, price, spice, quantity = 1) => {
        const key = cartKey(product.slug, size, spice);
        set((state) => {
          const existing = state.items.find((i) => i.key === key);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.key === key
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          const item: CartItem = {
            key,
            product_id: product.id,
            slug: product.slug,
            name: product.name,
            image_url: product.image_url,
            size,
            price,
            spice_level: spice,
            quantity,
          };
          return { items: [...state.items, item] };
        });
      },

      removeItem: (key) =>
        set((state) => ({ items: state.items.filter((i) => i.key !== key) })),

      updateQuantity: (key, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.key !== key)
              : state.items.map((i) =>
                  i.key === key ? { ...i, quantity } : i
                ),
        })),

      updateSpice: (key, spice) =>
        set((state) => {
          const target = state.items.find((i) => i.key === key);
          if (!target) return state;
          const newKey = cartKey(target.slug, target.size, spice);
          // Merge if an identical line already exists
          const merged = state.items.find(
            (i) => i.key === newKey && i.key !== key
          );
          if (merged) {
            return {
              items: state.items
                .filter((i) => i.key !== key)
                .map((i) =>
                  i.key === newKey
                    ? { ...i, quantity: i.quantity + target.quantity }
                    : i
                ),
            };
          }
          return {
            items: state.items.map((i) =>
              i.key === key ? { ...i, spice_level: spice, key: newKey } : i
            ),
          };
        }),

      clear: () => set({ items: [] }),

      count: () => get().items.reduce((n, i) => n + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      deliveryCharge: () => (get().items.length > 0 ? DELIVERY_CHARGE : 0),

      total: () => get().subtotal() + get().deliveryCharge(),
    }),
    {
      name: "bmp-cart",
      // Only persist the items array
      partialize: (state) => ({ items: state.items }),
    }
  )
);
