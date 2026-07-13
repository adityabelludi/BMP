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

/** Sends a password-reset link. Always reports success (no email enumeration). */
export async function requestPasswordReset(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string; sent?: boolean }> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Please enter your email" };

  const supabase = await createClient();
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${site}/auth/callback?next=/reset-password`,
  });
  if (error) console.error("[requestPasswordReset]", error.message);

  // Never reveal whether the email exists.
  return { sent: true };
}

/** Sets a new password for the user in the recovery session (from the emailed link). */
export async function updatePassword(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string }> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 6)
    return { error: "Password must be at least 6 characters" };
  if (password !== confirm) return { error: "Passwords do not match" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      error: "Your reset link has expired. Please request a new one.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  redirect("/account");
}
