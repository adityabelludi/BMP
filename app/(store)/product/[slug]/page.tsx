import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Leaf,
  Flame,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { AddToCart } from "@/components/add-to-cart";
import { ProductCard } from "@/components/product-card";
import { SmartImage } from "@/components/smart-image";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getProductBySlug, getProducts } from "@/lib/data";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.short_description,
    openGraph: {
      title: product.name,
      description: product.short_description,
      images: [product.image_url],
    },
  };
}

const TRUST = [
  { icon: Leaf, label: "No preservatives" },
  { icon: Flame, label: "Stone-ground" },
  { icon: ShieldCheck, label: "Authentic recipe" },
  { icon: Truck, label: "Fast delivery" },
];

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const all = await getProducts();
  const related = all
    .filter((p) => p.slug !== product.slug && p.category === product.category)
    .slice(0, 4);
  const fallbackRelated = all.filter((p) => p.slug !== product.slug).slice(0, 4);
  const suggestions = related.length ? related : fallbackRelated;

  return (
    <div className="bg-cream">
      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-maroon-500">
          <Link href="/" className="hover:text-saffron-600">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/shop" className="hover:text-saffron-600">
            Shop
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-maroon-800">{product.name}</span>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-cream-300 bg-cream-200 shadow-sm">
            <SmartImage
              src={product.image_url}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
            {product.is_bestseller && (
              <Badge variant="gold" className="absolute left-4 top-4 shadow">
                ★ Bestseller
              </Badge>
            )}
          </div>

          {/* Details */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-saffron-600">
              {product.category}
            </p>
            <h1 className="mt-2 heading-serif text-3xl font-bold md:text-4xl">
              {product.name}
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-maroon-600">
              {product.description}
            </p>

            <Separator className="my-7" />

            <AddToCart product={product} />

            <Separator className="my-7" />

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {TRUST.map((t) => (
                <div
                  key={t.label}
                  className="flex flex-col items-center gap-2 rounded-xl bg-white p-3 text-center shadow-sm"
                >
                  <t.icon className="h-5 w-5 text-saffron-500" />
                  <span className="text-xs font-medium text-maroon-700">
                    {t.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related */}
        {suggestions.length > 0 && (
          <section className="mt-20">
            <h2 className="mb-8 heading-serif text-2xl font-bold">
              You may also like
            </h2>
            <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
              {suggestions.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
