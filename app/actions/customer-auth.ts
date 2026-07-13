"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function safeRedirect(target: string | null | undefined): string {
  // Only allow internal paths.
  if (target && target.startsWith("/") && !target.startsWith("//")) {
    return target;
  }
  return "/account";
}

export async function customerSignIn(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string }> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = safeRedirect(String(formData.get("redirect") ?? ""));

  if (!email || !password) return { error: "Email and password are required" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  redirect(redirectTo);
}

export async function customerSignUp(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string; confirmEmail?: string }> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = safeRedirect(String(formData.get("redirect") ?? ""));

  if (!name) return { error: "Please enter your name" };
  if (!email || !password) return { error: "Email and password are required" };
  if (password.length < 6)
    return { error: "Password must be at least 6 characters" };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });
  if (error) return { error: error.message };

  // If email confirmation is required, there is no session yet.
  if (!data.session) {
    return { confirmEmail: email };
  }

  redirect(redirectTo);
}

export async function customerSignOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
