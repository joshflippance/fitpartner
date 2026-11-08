"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_PROGRAM, loadPrograms, saveProgram } from "@/lib/lift-data";
import { SESSION_MINUTES, SPLITS } from "@/lib/planner";
import type { TrainingProgram } from "@/lib/types";
import { Card } from "../ui";
import { Chip } from "./LiftHome";

type Program = Omit<TrainingProgram, "user_id" | "household_id" | "updated_at">;

export function ProgramSettings({ userId, householdId, partnerName }: { userId: string; householdId: string; partnerName: string | null }) {
  const supabase = useMemo(() => createClient(), []);
  const [program, setProgram] = useState<Program | null>(null);
  const [partnerAi, setPartnerAi] = useState(false);
  const [status, setStatus] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadPrograms(supabase, householdId).then((map) => {
      if (cancelled) return;
      const mine = map.get(userId);
      setProgram(mine ? { ...DEFAULT_PROGRAM, ...mine } : DEFAULT_PROGRAM);
      setPartnerAi([...map.values()].some((p) => p.user_id !== userId && p.ai_enabled));
    });
    return () => {
      cancelled = true;
    };
  }, [supabase, householdId, userId]);

  async function update(change: Partial<Program>) {
    if (!program) return;
    const next = { ...program, ...change };
    setProgram(next);
    try {
      await saveProgram(supabase, userId, householdId, next);
      setStatus({ kind: "ok", text: "Saved" });
    } catch (e) {
      setProgram(program);
      setStatus({ kind: "err", text: e instanceof Error ? e.message : "Couldn't save" });
    }
    setTimeout(() => setStatus(null), 1500);
  }

  if (!program) return <div className="h-64 animate-pulse rounded-3xl bg-surface" />;
  const split = SPLITS.find((s) => s.id === program.split)!;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h1 className="text-2xl font-semibold tracking-tight">Your program</h1>
        <Link href="/lift" className="text-sm text-muted">
          Done
        </Link>
      </div>
      <p className="px-1 text-sm text-muted">
        Sets what &ldquo;Next up&rdquo; suggests. You can change the type or length of any single session on the Lift tab.
        {status && <span className={`ml-2 ${status.kind === "ok" ? "text-you" : "text-danger"}`}>{status.text}</span>}
      </p>

      <Card>
        <h2 className="font-medium">Split</h2>
        <ul className="mt-2 divide-y divide-line">
          {SPLITS.map((s) => (
            <li key={s.id}>
              <button
                role="radio"
                aria-checked={program.split === s.id}
                onClick={() => void update({ split: s.id })}
                className="flex w-full items-center justify-between gap-3 py-2.5 text-left"
              >
                <span>
                  <span className="block text-sm font-medium">{s.label}</span>
                  <span className="text-xs text-muted">{s.hint}</span>
                </span>
                <span className={`size-5 shrink-0 rounded-full border-2 ${program.split === s.id ? "border-you bg-you" : "border-line"}`} />
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted">Rotation: {split.days.length > 1 ? split.days.join(", then ") : "the same session each time"}.</p>
      </Card>

      <Card className="space-y-4">
        <Row label="Days per week">
          {[2, 3, 4, 5, 6].map((d) => (
            <Chip key={d} active={program.days_per_week === d} onClick={() => void update({ days_per_week: d })}>
              {d}
            </Chip>
          ))}
        </Row>
        <Row label="Usual length">
          {SESSION_MINUTES.map((m) => (
            <Chip key={m} active={program.minutes === m} onClick={() => void update({ minutes: m })}>
              {m} min
            </Chip>
          ))}
        </Row>
      </Card>

      <Card className="space-y-4">
        <Toggle
          label="Warm-up"
          hint="A few minutes of easy cardio, then moving stretches like leg swings. Before lifting."
          on={program.warmup}
          onChange={(v) => void update({ warmup: v })}
        />
        <Toggle
          label="Stretch at the end"
          hint="Held stretches for the muscles you worked. After lifting, not before: holding stretches first can sap a little strength."
          on={program.stretch}
          onChange={(v) => void update({ stretch: v })}
        />
        <Row label="Cardio finisher" hint="Steady cardio after lifting. Skipped automatically when a short session needs the time. For hard intervals or longer cardio, pick a Cardio session on its own day.">
          {([0, 10, 15, 20] as const).map((m) => (
            <Chip key={m} active={program.cardio_minutes === m} onClick={() => void update({ cardio_minutes: m })}>
              {m === 0 ? "None" : `${m} min`}
            </Chip>
          ))}
        </Row>
      </Card>

      <Card>
        <Toggle
          label="AI suggestions"
          hint="Lets you adjust a plan in plain English, and plan joint sessions when both of you turn this on."
          on={program.ai_enabled}
          onChange={(v) => void update({ ai_enabled: v })}
        />
        <div className="mt-3 space-y-1.5 rounded-2xl bg-surface-2 p-3 text-xs text-muted">
          <p className="font-medium text-text">What&apos;s shared, and only when you tap an AI button</p>
          <p>Sent to Anthropic&apos;s Claude: the session plan, the exercises available at your location, your program, how many days ago you did each exercise, and what you type.</p>
          <p>Never sent: your name, email, body weight, meals or the weights you lift. {partnerName ?? "Your partner"}&apos;s history is only included in a joint plan when they turn this on too.</p>
          <p>Anthropic deletes API data within 30 days and does not train on it. FitPartner keeps no copy of the request.</p>
          {partnerName && <p className="text-text">{partnerName} has AI {partnerAi ? "on" : "off"}.</p>}
        </div>
      </Card>
    </div>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
      <div className="mt-2 flex flex-wrap gap-1.5" role="radiogroup" aria-label={label}>
        {children}
      </div>
    </div>
  );
}

function Toggle({ label, hint, on, onChange }: { label: string; hint: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-start justify-between gap-4">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="mt-0.5 block text-xs text-muted">{hint}</span>
      </span>
      <input type="checkbox" role="switch" checked={on} onChange={(e) => onChange(e.target.checked)} className="mt-1 size-5 shrink-0 accent-[var(--color-you)]" />
    </label>
  );
}
