"use client";

import { useActionState } from "react";
import { Loader2, KeyRound } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePassword } from "@/app/actions/customer-auth";

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState<
    { error?: string },
    FormData
  >(updatePassword, {});

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm rounded-3xl border border-cream-300 bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <Logo />
          <div className="mt-6 grid h-12 w-12 place-items-center rounded-full bg-saffron-50">
            <KeyRound className="h-6 w-6 text-saffron-600" />
          </div>
          <h1 className="mt-4 heading-serif text-2xl font-bold">
            Set a new password
          </h1>
          <p className="mt-1 text-sm text-maroon-500">
            Choose a new password for your account.
          </p>
        </div>

        <form action={formAction} className="mt-8 space-y-4">
          <div>
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="••••••••"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              name="confirm"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
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
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Update password"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
