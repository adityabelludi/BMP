"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Upload, ImageIcon, Sparkles, PackageCheck } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { SmartImage } from "@/components/smart-image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { createProduct, updateProduct } from "@/app/actions/products";
import { productSchema } from "@/lib/validators";
import { SIZES, SIZE_WEIGHTS, SPICE_LEVELS } from "@/lib/constants";
import { formatINR } from "@/lib/utils";
import type { Product, SizeCode, SpiceLevel } from "@/types";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function emptyPrices(product?: Product): Record<SizeCode, string> {
  const map: Record<SizeCode, string> = { "100g": "", "500g": "", "1kg": "" };
  if (product) {
    for (const v of product.variants) {
      map[v.size] = String(v.price);
    }
  } else {
    map["100g"] = "40";
    map["500g"] = "200";
    map["1kg"] = "400";
  }
  return map;
}

export function ProductForm({
  product,
  trigger,
}: {
  product?: Product;
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [category, setCategory] = useState(product?.category ?? "");
  const [shortDesc, setShortDesc] = useState(product?.short_description ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [spice, setSpice] = useState<SpiceLevel>(
    product?.spice_default ?? "Medium"
  );
  const [bestseller, setBestseller] = useState(product?.is_bestseller ?? false);
  const [inStock, setInStock] = useState(product?.in_stock ?? true);
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? "");
  const [prices, setPrices] = useState<Record<SizeCode, string>>(
    emptyPrices(product)
  );

  function onNameChange(v: string) {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "png";
      const base = slug || slugify(name) || "product";
      const path = `${base}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(path);
      setImageUrl(data.publicUrl);
      toast.success("Image uploaded");
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Image upload failed"
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    const variants = SIZES.map((size) => ({
      size,
      price: Number(prices[size] || 0),
      weight_grams: SIZE_WEIGHTS[size],
    }));

    const payload = {
      name,
      slug,
      category,
      short_description: shortDesc,
      description,
      spice_default: spice,
      is_bestseller: bestseller,
      in_stock: inStock,
      image_url: imageUrl,
      variants,
    };

    const parsed = productSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? "Please check the form");
      return;
    }

    setSaving(true);
    const res = isEdit
      ? await updateProduct(product!.id, parsed.data)
      : await createProduct(parsed.data);
    setSaving(false);

    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(isEdit ? "Product updated" : "Product added");
    setOpen(false);
    router.refresh();
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full p-0 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            {isEdit ? "Edit Product" : "Add New Product"}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {/* Image */}
          <div>
            <Label>Product Image</Label>
            <div className="mt-1.5 flex items-center gap-4">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-cream-300 bg-cream-200">
                {imageUrl ? (
                  <SmartImage
                    src={imageUrl}
                    alt="Preview"
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-maroon-300">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-saffron-200 px-4 py-2 text-sm font-medium text-maroon-700 transition-colors hover:bg-saffron-50">
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploading ? "Uploading…" : "Upload image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUpload(f);
                    }}
                  />
                </label>
                <p className="text-xs text-maroon-400">PNG/JPG, square works best.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="p-name">Name *</Label>
              <Input
                id="p-name"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="e.g. Rasam Powder"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="p-slug">Slug (URL) *</Label>
              <Input
                id="p-slug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                placeholder="rasam-powder"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="p-cat">Category *</Label>
              <Input
                id="p-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Curry Powders"
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="p-short">Short Description *</Label>
            <Input
              id="p-short"
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              placeholder="One-line summary shown on cards"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="p-desc">Full Description (bio) *</Label>
            <Textarea
              id="p-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="The story, ingredients and serving ideas…"
              className="mt-1.5 min-h-[120px]"
            />
          </div>

          <div>
            <Label>Spice Level</Label>
            <Select
              value={spice}
              onValueChange={(v) => setSpice(v as SpiceLevel)}
            >
              <SelectTrigger className="mt-1.5">
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

          {/* Prices */}
          <div>
            <Label>Pricing (₹) *</Label>
            <div className="mt-1.5 grid grid-cols-3 gap-3">
              {SIZES.map((size) => (
                <div key={size}>
                  <span className="text-xs font-medium text-maroon-500">
                    {size}
                  </span>
                  <Input
                    inputMode="numeric"
                    value={prices[size]}
                    onChange={(e) =>
                      setPrices((p) => ({ ...p, [size]: e.target.value }))
                    }
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3 rounded-xl border border-cream-300 bg-cream-100 p-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium text-maroon-700">
                <PackageCheck className="h-4 w-4 text-saffron-500" /> In stock
              </span>
              <Switch checked={inStock} onCheckedChange={setInStock} />
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium text-maroon-700">
                <Sparkles className="h-4 w-4 text-turmeric-600" /> Bestseller
              </span>
              <Switch checked={bestseller} onCheckedChange={setBestseller} />
            </div>
          </div>
        </div>

        <div className="border-t border-cream-300 bg-white p-4">
          <Button
            onClick={handleSave}
            disabled={saving || uploading}
            size="lg"
            className="w-full"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Saving…
              </>
            ) : isEdit ? (
              `Save Changes · from ${formatINR(Number(prices["100g"] || 0))}`
            ) : (
              "Add Product"
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
