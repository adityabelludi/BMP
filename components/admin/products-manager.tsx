"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import type { Category, Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { SmartImage } from "@/components/smart-image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductForm } from "@/components/admin/product-form";
import { deleteProduct, toggleStock } from "@/app/actions/products";
import { formatINR } from "@/lib/utils";

function StockToggle({ product }: { product: Product }) {
  const router = useRouter();
  const [inStock, setInStock] = useState(product.in_stock);
  const [pending, start] = useTransition();

  return (
    <Switch
      checked={inStock}
      disabled={pending}
      onCheckedChange={(v) => {
        setInStock(v);
        start(async () => {
          const res = await toggleStock(product.id, v);
          if (!res.ok) {
            setInStock(!v);
            toast.error(res.error);
          } else {
            toast.success(v ? "Marked in stock" : "Marked out of stock");
            router.refresh();
          }
        });
      }}
    />
  );
}

function DeleteButton({ product }: { product: Product }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1">
        <Button
          size="sm"
          variant="destructive"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const res = await deleteProduct(product.id);
              if (!res.ok) toast.error(res.error);
              else {
                toast.success("Product deleted");
                router.refresh();
              }
            })
          }
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setConfirming(false)}
          disabled={pending}
        >
          Cancel
        </Button>
      </span>
    );
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      className="text-rose-600 hover:bg-rose-50"
      onClick={() => setConfirming(true)}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}

export function ProductsManager({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
    );
  }, [products, query]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-cream-300 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-maroon-400" />
          <Input
            placeholder="Search products by name, category or slug…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <ProductForm
          categories={categories}
          trigger={
            <Button>
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          }
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-cream-300 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-cream-100 hover:bg-cream-100">
              <TableHead>Product</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead>Prices</TableHead>
              <TableHead>In stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-16 text-center text-maroon-500">
                  No products yet. Click <b>Add Product</b> to create one.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-cream-200">
                        <SmartImage
                          src={p.image_url}
                          alt={p.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-maroon-800">{p.name}</p>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <span className="text-xs text-maroon-400">/{p.slug}</span>
                          {p.is_bestseller && (
                            <Badge variant="gold">★</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-maroon-600">
                    {p.category}
                  </TableCell>
                  <TableCell className="text-sm text-maroon-700">
                    {p.variants
                      .map((v) => `${v.size} ${formatINR(v.price)}`)
                      .join(" · ")}
                  </TableCell>
                  <TableCell>
                    <StockToggle product={p} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <ProductForm
                        product={p}
                        categories={categories}
                        trigger={
                          <Button size="sm" variant="ghost">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DeleteButton product={p} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-center text-xs text-maroon-400">
        {filtered.length} of {products.length} products
      </p>
    </div>
  );
}
