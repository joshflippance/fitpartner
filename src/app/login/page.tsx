"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { authenticate, type AuthState } from "./actions";
import { Button, Field, Input } from "@/components/ui";

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [state, formAction, pending] = useActionState<AuthState, FormData>(authenticate, {});

  return (
    <main className="flex flex-1 flex-col justify-center px-6 pb-16">
      <div className="mb-10">
        <div className="mb-4 flex gap-1.5">
          <span className="size-3 rounded-full bg-you" />
          <span className="size-3 rounded-full bg-partner" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">FitPartner</h1>
        <p className="mt-1 text-muted">Hit your numbers. Together.</p>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="mode" value={mode} />
        {mode === "signup" && (
          <Field label="Your name">
            <Input name="display_name" autoComplete="given-name" placeholder="Josh" />
          </Field>
        )}
        <Field label="Email">
          <Input name="email" type="email" autoComplete="email" inputMode="email" required />
        </Field>
        <Field label="Password">
          <Input
            name="password"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            minLength={8}
            required
          />
        </Field>

        {mode === "signin" && (
          <Link href="/login/reset" className="block text-right text-sm text-muted underline-offset-4 hover:underline">
            Forgot password?
          </Link>
        )}
        {state.error && <p className="text-sm text-danger">{state.error}</p>}
        {state.message && <p className="text-sm text-you">{state.message}</p>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "One sec…" : mode === "signin" ? "Sign in" : "Create account"}
        </Button>
      </form>

      <button
        type="button"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="mt-6 text-sm text-muted underline-offset-4 hover:underline"
      >
        {mode === "signin" ? "New here? Create an account" : "Have an account? Sign in"}
      </button>
    </main>
  );
}
