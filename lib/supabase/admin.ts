import { createClient as createSbClient } from "@supabase/supabase-js";

/**
 * Privileged service-role client. SERVER ONLY.
 * Bypasses RLS — never import this into a Client Component.
 * Used by the seed script and trusted server actions (e.g. inserting orders).
 */
export function createAdminClient() {
  return createSbClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );
}
