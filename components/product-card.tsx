import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/types";
import { SmartImage } from "@/components/smart-image";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const cheapest = product.variants.reduce(
    (a, b) => (b.price < a.price ? b : a),
    product.variants[0]
  );

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-cream-300 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-cream-200">
        <SmartImage
          src={product.image_url}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.is_bestseller && product.in_stock && (
          <Badge variant="gold" className="absolute left-3 top-3 shadow-sm">
            ★ Bestseller
          </Badge>
        )}
        {!product.in_stock && (
          <>
            <div className="absolute inset-0 bg-white/50" />
            <span className="absolute left-3 top-3 rounded-full bg-maroon-700 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm">
              Sold out
            </span>
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-saffron-600">
          {product.category}
        </p>
        <h3 className="mt-1 font-heading text-lg font-semibold text-maroon-800">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-maroon-500">
          {product.short_description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-maroon-500">{cheapest?.size}</span>
            <p className="font-heading text-lg font-bold text-maroon-900">
              {formatINR(cheapest?.price ?? 0)}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-saffron-50 px-3 py-1.5 text-sm font-medium text-saffron-700 transition-colors group-hover:bg-saffron-500 group-hover:text-white">
            View
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
