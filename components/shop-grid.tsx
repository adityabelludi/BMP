"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Product, SpiceLevel } from "@/types";
import { ProductCard } from "@/components/product-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SPICE_LEVELS } from "@/lib/constants";

type SortKey = "name-asc" | "name-desc" | "price-asc" | "price-desc";

export function ShopGrid({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [spice, setSpice] = useState<SpiceLevel | "all">("all");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("name-asc");

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort(),
    [products]
  );

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const matchesQuery =
        !query ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.short_description.toLowerCase().includes(query.toLowerCase());
      const matchesSpice = spice === "all" || p.spice_default === spice;
      const matchesCategory = category === "all" || p.category === category;
      return matchesQuery && matchesSpice && matchesCategory;
    });

    const minPrice = (p: Product) => Math.min(...p.variants.map((v) => v.price));

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return minPrice(a) - minPrice(b);
        case "price-desc":
          return minPrice(b) - minPrice(a);
        default:
          return a.name.localeCompare(b.name);
      }
    });
    return list;
  }, [products, query, spice, category, sort]);

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-8 rounded-2xl border border-cream-300 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-maroon-400" />
            <Input
              placeholder="Search masalas by name…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              aria-label="Search products"
            />
          </div>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger aria-label="Filter by category">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={spice}
            onValueChange={(v) => setSpice(v as SpiceLevel | "all")}
          >
            <SelectTrigger aria-label="Filter by spice level">
              <SelectValue placeholder="Spice level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Spice Levels</SelectItem>
              {SPICE_LEVELS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger aria-label="Sort products">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-maroon-400" />
                <SelectValue placeholder="Sort" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name (A–Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z–A)</SelectItem>
              <SelectItem value="price-asc">Price (Low–High)</SelectItem>
              <SelectItem value="price-desc">Price (High–Low)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="mb-5 text-sm text-maroon-500">
        Showing <span className="font-semibold text-maroon-800">{filtered.length}</span>{" "}
        of {products.length} products
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-cream-300 bg-cream-100 py-20 text-center text-maroon-500">
          No masalas match your filters. Try clearing the search.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
