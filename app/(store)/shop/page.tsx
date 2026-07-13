import type { Metadata } from "next";
import { ShopGrid } from "@/components/shop-grid";
import { getProducts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Shop All Masalas",
  description:
    "Browse BMP's full range of stone-ground Karnataka masalas and chutney powders. Filter by name, category and spice level.",
};

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <div className="bg-cream rangoli-bg">
      <section className="border-b border-cream-300 bg-hero-warm">
        <div className="container py-14 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-saffron-600">
            The Full Range
          </p>
          <h1 className="mt-3 heading-serif text-4xl font-bold md:text-5xl">
            Shop Our Masalas
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-maroon-600">
            Every blend is stone-ground in small batches. Choose your size and
            spice level at checkout.
          </p>
        </div>
      </section>

      <div className="container py-12">
        <ShopGrid products={products} />
      </div>
    </div>
  );
}
