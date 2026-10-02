"use client";

import { useActionState } from "react";
import { updatePassword, type AuthState } from "@/app/login/actions";
import { Button, Field, Input } from "@/components/ui";

export default function NewPasswordPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(updatePassword, {});
  return (
    <main className="flex flex-1 flex-col justify-center px-6 pb-16">
      <h1 className="mb-8 text-2xl font-semibold">Set a new password</h1>
      <form action={formAction} className="space-y-4">
        <Field label="New password">
          <Input name="password" type="password" autoComplete="new-password" minLength={8} required />
        </Field>
        <Field label="Confirm password">
          <Input name="confirm" type="password" autoComplete="new-password" minLength={8} required />
        </Field>
        {state.error && <p className="text-sm text-danger">{state.error}</p>}
        <Button type="submit" disabled={pending} className="w-full">{pending ? "Saving…" : "Save password"}</Button>
      </form>
    </main>
  );
}
