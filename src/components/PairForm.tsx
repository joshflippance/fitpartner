"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Household } from "@/lib/types";
import { Button, Card, Input } from "./ui";

export function PairForm({ name }: { name: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [code, setCode] = useState("");
  const [created, setCreated] = useState<Household | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function create() {
    setBusy(true);
    setError(null);
    const { data, error } = await supabase.rpc("create_household", { household_name: `${name}'s household` });
    setBusy(false);
    if (error) return setError(error.message);
    setCreated(data as Household);
  }

  async function join(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await supabase.rpc("join_household", { code });
    setBusy(false);
    if (error) return setError(error.message);
    router.replace("/");
    router.refresh();
  }

  if (created) {
    return (
      <main className="flex flex-1 flex-col justify-center gap-6 px-6 pb-16">
        <div>
          <h1 className="text-2xl font-semibold">Share this code</h1>
          <p className="mt-1 text-muted">Your partner enters it after signing up.</p>
        </div>
        <Card className="text-center">
          <p className="font-mono text-5xl font-semibold tracking-[0.25em] text-you">{created.pair_code}</p>
        </Card>
        <Button
          variant="ghost"
          onClick={() => navigator.share?.({ text: `Join me on FitPartner. Pairing code: ${created.pair_code}` })}
        >
          Share code
        </Button>
        <Button onClick={() => { router.replace("/"); router.refresh(); }}>Go to dashboard</Button>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col justify-center gap-6 px-6 pb-16">
      <div>
        <h1 className="text-2xl font-semibold">Pair up, {name}</h1>
        <p className="mt-1 text-muted">One of you creates a household. The other joins with the code.</p>
      </div>

      <Card>
        <h2 className="font-medium">Start a household</h2>
        <p className="mb-4 mt-1 text-sm text-muted">You get a 6 character code to share.</p>
        <Button onClick={create} disabled={busy} className="w-full">Create household</Button>
      </Card>

      <Card>
        <h2 className="font-medium">Join your partner</h2>
        <form onSubmit={join} className="mt-4 flex gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            maxLength={6}
            autoCapitalize="characters"
            autoComplete="off"
            className="font-mono tracking-widest"
          />
          <Button type="submit" variant="ghost" disabled={busy || code.length !== 6}>Join</Button>
        </form>
      </Card>

      {error && <p className="text-sm text-danger">{error}</p>}
    </main>
  );
}
