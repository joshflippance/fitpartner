"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset, type AuthState } from "../actions";
import { Button, Field, Input } from "@/components/ui";

export default function ResetPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(requestPasswordReset, {});
  return (
    <main className="flex flex-1 flex-col justify-center px-6 pb-16">
      <h1 className="text-2xl font-semibold">Reset password</h1>
      <p className="mb-8 mt-1 text-muted">We&apos;ll email you a link to set a new one.</p>
      <form action={formAction} className="space-y-4">
        <Field label="Email">
          <Input name="email" type="email" autoComplete="email" inputMode="email" required />
        </Field>
        {state.error && <p className="text-sm text-danger">{state.error}</p>}
        {state.message && <p className="text-sm text-you">{state.message}</p>}
        <Button type="submit" disabled={pending} className="w-full">{pending ? "Sending…" : "Send reset link"}</Button>
      </form>
      <Link href="/login" className="mt-6 text-sm text-muted underline-offset-4 hover:underline">Back to sign in</Link>
    </main>
  );
}
