"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { customerSignIn, customerSignUp } from "@/app/actions/customer-auth";

function Inner({ mode }: { mode: "login" | "signup" }) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/account";

  const action = mode === "login" ? customerSignIn : customerSignUp;
  const [state, formAction, pending] = useActionState<
    { error?: string; message?: string },
    FormData
  >(action, {});

  const isLogin = mode === "login";

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm rounded-3xl border border-cream-300 bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <Logo />
          <h1 className="mt-6 heading-serif text-2xl font-bold">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1 text-sm text-maroon-500">
            {isLogin
              ? "Log in to track your orders"
              : "Sign up to order and follow your deliveries"}
          </p>
        </div>

        <form action={formAction} className="mt-8 space-y-4">
          <input type="hidden" name="redirect" value={redirect} />

          {!isLogin && (
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                required
                autoComplete="name"
                placeholder="Your name"
                className="mt-1.5"
              />
            </div>
          )}

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
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
              autoComplete={isLogin ? "current-password" : "new-password"}
              placeholder="••••••••"
              className="mt-1.5"
            />
          </div>

          {state?.error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {state.error}
            </p>
          )}
          {state?.message && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {state.message}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isLogin ? (
              <>
                <LogIn className="h-5 w-5" /> Log In
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5" /> Create Account
              </>
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-maroon-500">
          {isLogin ? "New to BMP? " : "Already have an account? "}
          <Link
            href={
              isLogin
                ? `/signup?redirect=${redirect}`
                : `/login?redirect=${redirect}`
            }
            className="font-semibold text-saffron-600 hover:underline"
          >
            {isLogin ? "Create an account" : "Log in"}
          </Link>
        </p>
      </div>
    </div>
  );
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  return (
    <Suspense>
      <Inner mode={mode} />
    </Suspense>
  );
}
