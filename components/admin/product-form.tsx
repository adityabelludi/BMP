"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Upload,
  ImageIcon,
  Sparkles,
  PackageCheck,
  Plus,
  X,
} from "lucide-react";
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
import { SPICE_LEVELS } from "@/lib/constants";
import { formatINR } from "@/lib/utils";
import type { Category, Product, SpiceLevel } from "@/types";

const ADD_NEW = "__add_new__";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

interface VariantRow {
  id: string;
  size: string;
  price: string;
}

function initialVariants(product?: Product): VariantRow[] {
  if (product && product.variants.length) {
    return product.variants.map((v) => ({
      id: crypto.randomUUID(),
      size: v.size,
      price: String(v.price),
    }));
  }
  return [
    { id: crypto.randomUUID(), size: "100g", price: "40" },
    { id: crypto.randomUUID(), size: "500g", price: "200" },
    { id: crypto.randomUUID(), size: "1kg", price: "400" },
  ];
}

export function ProductForm({
  product,
  categories,
  trigger,
}: {
  product?: Product;
  categories: Category[];
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const catOptions = Array.from(
    new Set([
      ...categories.map((c) => c.name),
      ...(product?.category ? [product.category] : []),
    ])
  );

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [category, setCategory] = useState(
    product?.category ?? catOptions[0] ?? ""
  );
  const [addingNewCategory, setAddingNewCategory] = useState(
    catOptions.length === 0
  );
  const [shortDesc, setShortDesc] = useState(product?.short_description ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [spice, setSpice] = useState<SpiceLevel>(
    product?.spice_default ?? "Medium"
  );
  const [bestseller, setBestseller] = useState(product?.is_bestseller ?? false);
  const [inStock, setInStock] = useState(product?.in_stock ?? true);
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? "");
  const [variants, setVariants] = useState<VariantRow[]>(
    initialVariants(product)
  );

  function onNameChange(v: string) {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  function updateVariant(id: string, patch: Partial<VariantRow>) {
    setVariants((rows) =>
      rows.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );
  }
  function addVariant() {
    setVariants((rows) => [
      ...rows,
      { id: crypto.randomUUID(), size: "", price: "" },
    ]);
  }
  function removeVariant(id: string) {
    setVariants((rows) => (rows.length <= 1 ? rows : rows.filter((r) => r.id !== id)));
  }

  const minPrice = Math.min(
    ...variants.map((v) => Number(v.price) || Infinity),
    Infinity
  );

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
      toast.error(e instanceof Error ? e.message : "Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    const cleanVariants = variants
      .filter((v) => v.size.trim() && Number(v.price) > 0)
      .map((v) => ({
        size: v.size.trim(),
        price: Number(v.price),
        weight_grams: 0,
      }));

    if (cleanVariants.length === 0) {
      toast.error("Add at least one size with a price");
      return;
    }

    const payload = {
      name,
      slug,
      category: category.trim(),
      short_description: shortDesc,
      description,
      spice_default: spice,
      is_bestseller: bestseller,
      in_stock: inStock,
      image_url: imageUrl,
      variants: cleanVariants,
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
          <SheetTitle>{isEdit ? "Edit Product" : "Add New Product"}</SheetTitle>
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
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

            {/* Category */}
            <div>
              <Label>Category *</Label>
              {addingNewCategory ? (
                <div className="mt-1.5 flex gap-2">
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="New category"
                    autoFocus
                  />
                  {catOptions.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setAddingNewCategory(false);
                        setCategory(catOptions[0]);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ) : (
                <Select
                  value={category}
                  onValueChange={(val) => {
                    if (val === ADD_NEW) {
                      setAddingNewCategory(true);
                      setCategory("");
                    } else {
                      setCategory(val);
                    }
                  }}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {catOptions.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                    <SelectItem value={ADD_NEW}>➕ Add new category…</SelectItem>
                  </SelectContent>
                </Select>
              )}
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
            <Select value={spice} onValueChange={(v) => setSpice(v as SpiceLevel)}>
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

          {/* Custom sizes & prices */}
          <div>
            <Label>Sizes &amp; Prices *</Label>
            <p className="mb-2 mt-0.5 text-xs text-maroon-400">
              Add any sizes you sell — custom labels are fine.
            </p>
            <div className="space-y-2">
              {variants.map((v) => (
                <div key={v.id} className="flex items-center gap-2">
                  <Input
                    value={v.size}
                    onChange={(e) => updateVariant(v.id, { size: e.target.value })}
                    placeholder="Size (e.g. 250g)"
                    className="flex-1"
                  />
                  <div className="flex items-center gap-1 rounded-xl border border-cream-300 bg-white px-3">
                    <span className="text-sm text-maroon-500">₹</span>
                    <input
                      inputMode="numeric"
                      value={v.price}
                      onChange={(e) =>
                        updateVariant(v.id, {
                          price: e.target.value.replace(/[^0-9]/g, ""),
                        })
                      }
                      placeholder="0"
                      className="h-11 w-20 bg-transparent text-sm text-maroon-900 outline-none"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-rose-600 hover:bg-rose-50"
                    onClick={() => removeVariant(v.id)}
                    disabled={variants.length <= 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={addVariant}
            >
              <Plus className="h-4 w-4" /> Add size
            </Button>
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
              Number.isFinite(minPrice)
                ? `Save Changes · from ${formatINR(minPrice)}`
                : "Save Changes"
            ) : (
              "Add Product"
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
