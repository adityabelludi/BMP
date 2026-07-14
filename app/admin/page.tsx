import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { getProducts, getCategories, getDeliverySettings } from "@/lib/data";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import type { Order } from "@/types";

export default async function AdminPage() {
  // If Supabase isn't configured, show a friendly setup notice.
  if (!isSupabaseConfigured()) {
    return (
      <div className="container py-24 text-center">
        <h1 className="heading-serif text-2xl font-bold">
          Admin needs Supabase configured
        </h1>
        <p className="mx-auto mt-3 max-w-md text-maroon-600">
          Set <code className="rounded bg-cream-200 px-1">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
          and the keys in <code className="rounded bg-cream-200 px-1">.env.local</code>,
          run the migration and seed, then reload.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  // Enforce admin membership — a logged-in customer must not reach /admin.
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/");

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  const orders = (error ? [] : (data as Order[])) ?? [];
  const [products, categories, settings] = await Promise.all([
    getProducts(),
    getCategories(),
    getDeliverySettings(),
  ]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-cream-300 bg-white/90 backdrop-blur">
        <div className="container flex h-24 items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo compact />
            <span className="hidden rounded-full bg-maroon-50 px-3 py-1 text-xs font-semibold text-maroon-700 sm:inline">
              Admin Dashboard
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-maroon-500 sm:inline">
              {user.email}
            </span>
            <form action={signOut}>
              <Button variant="outline" size="sm" type="submit">
                <LogOut className="h-4 w-4" /> Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <AdminTabs
          orders={orders}
          products={products}
          categories={categories}
          settings={settings}
        />
      </main>
    </div>
  );
}
