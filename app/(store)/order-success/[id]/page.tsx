import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Package, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { shortId } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Order Confirmed",
  robots: { index: false, follow: false },
};

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="container flex flex-col items-center py-20 text-center">
      <div className="grid h-24 w-24 place-items-center rounded-full bg-emerald-50">
        <CheckCircle2 className="h-14 w-14 text-emerald-500" />
      </div>

      <h1 className="mt-8 heading-serif text-3xl font-bold md:text-4xl">
        Thank you for your order!
      </h1>
      <p className="mt-4 max-w-md text-maroon-600">
        Your masalas are being freshly packed. We'll reach out on your phone to
        confirm delivery details.
      </p>

      <div className="mt-8 rounded-2xl border border-cream-300 bg-white px-8 py-6 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-maroon-500">
          Order Reference
        </p>
        <p className="mt-1 flex items-center gap-2 font-heading text-2xl font-bold text-maroon-800">
          <Package className="h-6 w-6 text-saffron-500" />
          #{shortId(id)}
        </p>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/shop">
            Continue Shopping <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/">
            <Home className="h-5 w-5" /> Back Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
