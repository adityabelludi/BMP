"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Loader2, Lock } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/app/actions/auth";

function LoginInner() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/admin";
  const [state, formAction, pending] = useActionState(signIn, {});

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-warm px-6">
      <div className="w-full max-w-sm rounded-3xl border border-cream-300 bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <Logo />
          <div className="mt-6 grid h-12 w-12 place-items-center rounded-full bg-saffron-50">
            <Lock className="h-6 w-6 text-saffron-600" />
          </div>
          <h1 className="mt-4 heading-serif text-2xl font-bold">Admin Login</h1>
          <p className="mt-1 text-sm text-maroon-500">
            Sign in to manage orders
          </p>
        </div>

        <form action={formAction} className="mt-8 space-y-4">
          <input type="hidden" name="redirect" value={redirect} />
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="admin@belludimasala.com"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="mt-1.5"
            />
          </div>

          {state?.error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {state.error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Signing in…
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}
