import type { Metadata } from "next";
import Link from "next/link";
import { LogIn, UserPlus, Lock } from "lucide-react";
import { CheckoutForm } from "@/components/checkout-form";
import { Button } from "@/components/ui/button";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getDeliverySettings } from "@/lib/data";
import { DELIVERY_CHARGE, DELIVERY_CHARGE_OUTSIDE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your BMP masala order.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  // Require login before checkout (so customers can track their orders),
  // unless Supabase isn't configured (offline/demo mode).
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return (
        <div className="container flex flex-col items-center py-24 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-saffron-50">
            <Lock className="h-8 w-8 text-saffron-600" />
          </div>
          <h1 className="mt-6 heading-serif text-3xl font-bold">
            Please log in to check out
          </h1>
          <p className="mt-3 max-w-md text-maroon-600">
            Sign in or create an account so we can save your order and keep you
            posted on its status. Your cart is safe and waiting.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/login?redirect=/checkout">
                <LogIn className="h-5 w-5" /> Log In
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/signup?redirect=/checkout">
                <UserPlus className="h-5 w-5" /> Create Account
              </Link>
            </Button>
          </div>
        </div>
      );
    }
  }

  const settings = isSupabaseConfigured()
    ? await getDeliverySettings()
    : {
        delivery_within_india: DELIVERY_CHARGE,
        delivery_outside_india: DELIVERY_CHARGE_OUTSIDE,
      };

  return (
    <CheckoutForm
      deliveryWithinIndia={settings.delivery_within_india}
      deliveryOutsideIndia={settings.delivery_outside_india}
    />
  );
}
