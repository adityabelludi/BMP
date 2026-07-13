/**
 * Reads and validates the public Supabase env vars.
 *
 * Catches the most common misconfigurations (missing value, or a key that was
 * pasted with whitespace / duplicated across lines) and fails with a clear
 * message instead of the browser's cryptic "invalid header value" error.
 */
export function readSupabaseEnv() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  // A valid key/URL never contains whitespace. If it does, the env var was
  // pasted incorrectly (e.g. duplicated or wrapped across lines).
  if (/\s/.test(anonKey)) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY contains whitespace — it was likely pasted twice or across multiple lines. Set it to a single clean value."
    );
  }
  if (/\s/.test(url)) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL contains whitespace — set it to a single clean value."
    );
  }

  return { url, anonKey };
}
