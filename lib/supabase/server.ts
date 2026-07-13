import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { readSupabaseEnv } from "@/lib/supabase/env";

/**
 * Server-side Supabase client bound to the request cookies.
 * Use inside Server Components, Route Handlers and Server Actions.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = readSupabaseEnv();

  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // Safe to ignore when middleware refreshes sessions.
          }
        },
      },
    }
  );
}

/** Is Supabase configured via env vars? */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
