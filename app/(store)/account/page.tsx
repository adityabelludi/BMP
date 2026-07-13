import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, ShoppingBag, LogOut, MapPin } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { customerSignOut } from "@/app/actions/customer-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STATUS_STYLES } from "@/lib/constants";
import { cn, formatINR, formatDate, shortId } from "@/lib/utils";
import type { Order } from "@/types";

export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  if (!isSupabaseConfigured()) redirect("/");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/account");

  const { data } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  const orders = (data as Order[]) ?? [];
  const name =
    (user.user_metadata?.full_name as string | undefined) ?? user.email;

  return (
    <div className="container py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-maroon-500">Signed in as {user.email}</p>
          <h1 className="heading-serif text-3xl font-bold md:text-4xl">
            Hello, {name?.split(" ")[0]}
          </h1>
        </div>
        <form action={customerSignOut}>
          <Button variant="outline" type="submit">
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </form>
      </div>

      <h2 className="mb-4 flex items-center gap-2 font-heading text-xl font-semibold text-maroon-800">
        <Package className="h-5 w-5 text-saffron-500" /> Your Orders
      </h2>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-cream-300 bg-cream-100 py-16 text-center">
          <ShoppingBag className="h-10 w-10 text-saffron-400" />
          <p className="text-maroon-600">You haven't placed any orders yet.</p>
          <Button asChild>
            <Link href="/shop">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o.id}
              className="rounded-2xl border border-cream-300 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs font-semibold text-maroon-500">
                    #{shortId(o.id)}
                  </p>
                  <p className="mt-0.5 text-sm text-maroon-500">
                    {formatDate(o.created_at)}
                  </p>
                </div>
                <Badge
                  className={cn("border text-sm", STATUS_STYLES[o.status])}
                >
                  {o.status}
                </Badge>
              </div>

              <div className="mt-4 space-y-1.5 border-t border-cream-200 pt-4">
                {o.items.map((i, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-maroon-700">
                      {i.name}{" "}
                      <span className="text-maroon-400">
                        · {i.size} · {i.spice_level} × {i.quantity}
                      </span>
                    </span>
                    <span className="font-medium text-maroon-800">
                      {formatINR(i.line_total)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-cream-200 pt-4">
                <p className="flex items-center gap-1.5 text-xs text-maroon-500">
                  <MapPin className="h-3.5 w-3.5" /> {o.city}, {o.state} —{" "}
                  {o.pincode}
                </p>
                <p className="font-heading text-lg font-bold text-maroon-900">
                  {formatINR(o.total_amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
