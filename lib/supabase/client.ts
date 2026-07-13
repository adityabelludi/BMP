import { createBrowserClient } from "@supabase/ssr";
import { readSupabaseEnv } from "@/lib/supabase/env";

/**
 * Browser-side Supabase client (uses the public anon key).
 * Safe to import in Client Components.
 */
export function createClient() {
  const { url, anonKey } = readSupabaseEnv();
  return createBrowserClient(url, anonKey);
}
