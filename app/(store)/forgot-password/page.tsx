"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Loader2, MailCheck, KeyRound } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/app/actions/customer-auth";

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState<
    { error?: string; sent?: boolean },
    FormData
  >(requestPasswordReset, {});

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm rounded-3xl border border-cream-300 bg-white p-8 shadow-xl">
        {state?.sent ? (
          <div className="text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50">
              <MailCheck className="h-8 w-8 text-emerald-500" />
            </div>
            <h1 className="mt-6 heading-serif text-2xl font-bold">
              Check your email
            </h1>
            <p className="mt-3 text-maroon-600">
              If an account exists for that address, we&apos;ve sent a link to
              reset your password. Open it on this device to continue.
            </p>
            <Button asChild variant="outline" className="mt-8 w-full">
              <Link href="/login">Back to Login</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center text-center">
              <Logo />
              <div className="mt-6 grid h-12 w-12 place-items-center rounded-full bg-saffron-50">
                <KeyRound className="h-6 w-6 text-saffron-600" />
              </div>
              <h1 className="mt-4 heading-serif text-2xl font-bold">
                Forgot password?
              </h1>
              <p className="mt-1 text-sm text-maroon-500">
                Enter your email and we&apos;ll send a reset link.
              </p>
            </div>

            <form action={formAction} className="mt-8 space-y-4">
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

              {state?.error && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {state.error}
                </p>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={pending}>
                {pending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Send reset link"
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-maroon-500">
              Remembered it?{" "}
              <Link href="/login" className="font-semibold text-saffron-600 hover:underline">
                Log in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
