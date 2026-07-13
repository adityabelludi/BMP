"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, LogIn, UserPlus, MailCheck } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { customerSignIn, customerSignUp } from "@/app/actions/customer-auth";

function Inner({ mode }: { mode: "login" | "signup" }) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/account";

  const urlError = searchParams.get("error");

  const action = mode === "login" ? customerSignIn : customerSignUp;
  const [state, formAction, pending] = useActionState<
    { error?: string; confirmEmail?: string },
    FormData
  >(action, {});

  const isLogin = mode === "login";
  const errorText = state?.error ?? (isLogin ? urlError : null);

  // After signup with email confirmation on: show a "check your inbox" screen.
  if (state?.confirmEmail) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-3xl border border-cream-300 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50">
            <MailCheck className="h-8 w-8 text-emerald-500" />
          </div>
          <h1 className="mt-6 heading-serif text-2xl font-bold">
            Confirm your email
          </h1>
          <p className="mt-3 text-maroon-600">
            We&apos;ve sent a confirmation link to{" "}
            <span className="font-semibold text-maroon-800">
              {state.confirmEmail}
            </span>
            . Please open it and click the link to activate your account, then
            log in.
          </p>
          <p className="mt-2 text-sm text-maroon-400">
            Can&apos;t find it? Check your spam or promotions folder.
          </p>
          <Button asChild size="lg" className="mt-8 w-full">
            <Link href={`/login?redirect=${redirect}`}>
              <LogIn className="h-5 w-5" /> Go to Login
            </Link>
          </Button>
        </div>
      </div>
    );
  }

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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              {isLogin && (
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-saffron-600 hover:underline"
                >
                  Forgot password?
                </Link>
              )}
            </div>
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

          {errorText && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {errorText}
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
