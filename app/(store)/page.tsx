import Link from "next/link";
import {
  ArrowRight,
  Leaf,
  Flame,
  ShieldCheck,
  Truck,
  Sparkles,
  ChefHat,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product-card";
import { SmartImage } from "@/components/smart-image";
import { Testimonials } from "@/components/home/testimonials";
import { getBestsellers } from "@/lib/data";
import { BRAND } from "@/lib/constants";

const WHY = [
  {
    icon: Leaf,
    title: "100% Pure & Natural",
    text: "No preservatives, no colours, no fillers. Just sun-dried spices and traditional grinding.",
  },
  {
    icon: Flame,
    title: "Stone-Ground, Small Batch",
    text: "Cold stone-ground to lock in aroma and oils — the way Karnataka kitchens have done for generations.",
  },
  {
    icon: ShieldCheck,
    title: "Authentic Recipes",
    text: "Time-honoured family recipes from across Karnataka — from temple pulihora to North-Karnataka podis.",
  },
  {
    icon: Truck,
    title: "Fresh, Delivered Fast",
    text: "Ground to order and shipped across India so it reaches you at peak freshness.",
  },
];

export default async function HomePage() {
  const bestsellers = await getBestsellers();

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden bg-hero-warm">
        <div className="absolute inset-0 rangoli-bg opacity-70" aria-hidden />
        <div className="container relative grid grid-cols-1 gap-12 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div className="animate-fade-up">
            <div className="mb-5 flex flex-wrap gap-2">
              <Badge variant="gold">
                <Sparkles className="mr-1 h-3.5 w-3.5" /> Karnataka's Finest
              </Badge>
              <Badge variant="maroon">
                <ChefHat className="mr-1 h-3.5 w-3.5" /> Chef's Choice
              </Badge>
              <Badge variant="default">
                <Home className="mr-1 h-3.5 w-3.5" /> Home-made
              </Badge>
            </div>
            <h1 className="heading-serif text-4xl font-bold leading-[1.1] sm:text-5xl lg:text-6xl">
              Pure. Traditional.
              <br />
              <span className="text-saffron-600">Karnataka Masalas.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-maroon-600">
              {BRAND.fullName} brings stone-ground, small-batch spice blends
              made from authentic family recipes — straight to your kitchen.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/shop">
                  Shop Masalas <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#story">Our Story</Link>
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-maroon-600">
              <span className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-earth-500" /> No Preservatives
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-earth-500" /> 100% Authentic
              </span>
              <span className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-saffron-500" /> Stone-Ground
              </span>
            </div>
          </div>

          <div className="relative animate-fade-in">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] border-4 border-white shadow-2xl">
              <SmartImage
                src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=900&q=80"
                alt="Assortment of vibrant Indian spices"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-5 -left-5 hidden rounded-2xl bg-white p-4 shadow-xl sm:block">
              <p className="font-heading text-2xl font-bold text-saffron-600">8+</p>
              <p className="text-xs text-maroon-600">Signature Blends</p>
            </div>
            <div className="absolute -right-4 top-8 hidden rounded-2xl bg-maroon-500 p-4 text-white shadow-xl sm:block">
              <p className="font-heading text-2xl font-bold">100%</p>
              <p className="text-xs opacity-90">Natural</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- BRAND STORY ---------------- */}
      <section id="story" className="section">
        <div className="container grid grid-cols-1 gap-12 md:grid-cols-2 md:items-center">
          <div className="relative order-2 aspect-square overflow-hidden rounded-3xl md:order-1">
            <SmartImage
              src="https://images.unsplash.com/photo-1648977519538-3c2107a57bed?auto=format&fit=crop&w=900&q=80"
              alt="Cooking at the stove by the window, steam rising — a home kitchen at dawn"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
          <div className="order-1 md:order-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-saffron-600">
              Our Story
            </p>
            <h2 className="mt-3 heading-serif text-3xl font-bold md:text-4xl">
              Rooted in Karnataka's kitchens
            </h2>
            <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-maroon-600">
              <p>
                BMP — Belludi Masala Products — began with a simple belief: that
                the masalas of our grandmothers deserved to be preserved,
                exactly as they were. Every blend we make follows a recipe
                handed down through generations of Karnataka households.
              </p>
              <p>
                We source whole spices at their peak, sun-dry and slow stone-grind
                them in small batches. No shortcuts, no additives — just the
                honest, layered flavour that turns everyday meals into memories.
              </p>
            </div>
            <blockquote className="mt-6 border-l-4 border-saffron-400 bg-cream-100 py-3 pl-5 pr-4 font-heading text-lg italic text-maroon-700">
              &ldquo;One bite brings back memories of mom&rsquo;s cooking.&rdquo;
            </blockquote>
            <Button asChild className="mt-7" variant="maroon">
              <Link href="/shop">
                Explore the Range <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ---------------- BESTSELLERS ---------------- */}
      <section className="section bg-cream-100 rangoli-bg">
        <div className="container">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-saffron-600">
                Loved by many
              </p>
              <h2 className="mt-3 heading-serif text-3xl font-bold md:text-4xl">
                Our Bestsellers
              </h2>
            </div>
            <Button asChild variant="outline">
              <Link href="/shop">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            {bestsellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- WHY CHOOSE US ---------------- */}
      <section id="why" className="section">
        <div className="container">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-saffron-600">
              Why Choose BMP
            </p>
            <h2 className="mt-3 heading-serif text-3xl font-bold md:text-4xl">
              Crafted with care, made to last
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map((w) => (
              <div
                key={w.title}
                className="rounded-2xl border border-cream-300 bg-white p-7 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-saffron-50 text-saffron-600">
                  <w.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-5 font-heading text-lg font-semibold text-maroon-800">
                  {w.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-maroon-500">
                  {w.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- TESTIMONIALS ---------------- */}
      <Testimonials />

      {/* ---------------- CTA ---------------- */}
      <section className="section">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl bg-maroon-500 px-8 py-14 text-center text-white shadow-xl md:py-20">
            <div className="absolute inset-0 rangoli-bg opacity-20" aria-hidden />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="heading-serif text-3xl font-bold text-white md:text-4xl">
                Bring home the taste of Karnataka
              </h2>
              <p className="mt-4 text-lg text-cream-200">
                Freshly ground masalas, delivered to your door. Flat ₹200
                delivery anywhere in India.
              </p>
              <Button asChild size="lg" className="mt-8 bg-white text-maroon-700 hover:bg-cream-100">
                <Link href="/shop">
                  Start Shopping <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
