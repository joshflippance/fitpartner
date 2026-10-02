"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useHouseholdData } from "@/hooks/useHouseholdData";
import { toLocalDate } from "@/lib/dates";
import { formatWeight, toKg } from "@/lib/units";
import { Button, Card, Field, Input } from "./ui";

type Tab = "meal" | "weight" | "workout";
const TABS: { id: Tab; label: string }[] = [
  { id: "meal", label: "Meal" },
  { id: "weight", label: "Weight" },
  { id: "workout", label: "Workout" },
];

export function Logger({ userId, householdId }: { userId: string; householdId: string }) {
  const supabase = useMemo(() => createClient(), []);
  const { profiles, meals, weights, workouts } = useHouseholdData(householdId);
  const me = profiles.find((p) => p.id === userId);
  const unit = me?.weight_unit ?? "lb";
  const today = toLocalDate();

  const [tab, setTab] = useState<Tab>("meal");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const base = { user_id: userId, household_id: householdId, log_date: today };

  async function run(action: () => PromiseLike<{ error: { message: string } | null }>, ok: string, form?: HTMLFormElement) {
    setBusy(true);
    const { error } = await action();
    setBusy(false);
    setToast(error ? { kind: "err", text: error.message } : { kind: "ok", text: ok });
    if (!error) form?.reset();
    setTimeout(() => setToast(null), 2500);
  }

  function onMeal(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    void run(
      () =>
        supabase.from("meal_logs").insert({
          ...base,
          name: String(f.get("name") || "Meal"),
          calories: Number(f.get("calories")),
          protein_g: Number(f.get("protein") || 0),
        }),
      "Meal logged",
      e.currentTarget,
    );
  }

  function onWeight(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const kg = Math.round(toKg(Number(f.get("weight")), unit) * 100) / 100;
    void run(
      () => supabase.from("weight_logs").upsert({ ...base, weight_kg: kg }, { onConflict: "user_id,log_date" }),
      "Weight saved",
      e.currentTarget,
    );
  }

  function onWorkout(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const duration = Number(f.get("duration"));
    void run(
      () =>
        supabase.from("workout_logs").insert({
          ...base,
          name: String(f.get("name") || "Lift"),
          duration_min: duration > 0 ? duration : null,
          notes: String(f.get("notes") || "") || null,
        }),
      "Workout logged",
      e.currentTarget,
    );
  }

  const remove = (table: "meal_logs" | "weight_logs" | "workout_logs", id: string) =>
    run(() => supabase.from(table).delete().eq("id", id), "Removed");

  const myMeals = meals.filter((m) => m.user_id === userId);
  const myWeight = weights.find((w) => w.user_id === userId && w.log_date === today);
  const myWorkouts = workouts.filter((w) => w.user_id === userId && w.log_date === today);

  return (
    <div className="space-y-4">
      <h1 className="px-1 text-2xl font-semibold tracking-tight">Log</h1>

      <div className="grid grid-cols-3 gap-1 rounded-2xl bg-surface p-1" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`h-10 rounded-xl text-sm font-medium transition ${tab === t.id ? "bg-you text-black" : "text-muted"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card>
        {tab === "meal" && (
          <form onSubmit={onMeal} className="space-y-4">
            <Field label="What did you eat?">
              <Input name="name" placeholder="Chicken and rice" autoComplete="off" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Calories">
                <Input name="calories" type="number" inputMode="numeric" min={0} max={9999} required />
              </Field>
              <Field label="Protein (g)">
                <Input name="protein" type="number" inputMode="decimal" step="0.1" min={0} max={999} />
              </Field>
            </div>
            <Button type="submit" disabled={busy} className="w-full">Add meal</Button>
          </form>
        )}

        {tab === "weight" && (
          <form onSubmit={onWeight} className="space-y-4">
            <Field label={`Morning weight (${unit})`}>
              <Input name="weight" type="number" inputMode="decimal" step="0.1" min={1} max={880} required />
            </Field>
            <p className="text-xs text-muted">One entry per day. Saving again replaces today&apos;s.</p>
            <Button type="submit" disabled={busy} className="w-full">Save weight</Button>
          </form>
        )}

        {tab === "workout" && (
          <form onSubmit={onWorkout} className="space-y-4">
            <Field label="Workout">
              <Input name="name" placeholder="Push day" autoComplete="off" />
            </Field>
            <Field label="Duration (min)">
              <Input name="duration" type="number" inputMode="numeric" min={1} max={600} />
            </Field>
            <Field label="Notes">
              <Input name="notes" placeholder="Bench 3x5 @ 185" autoComplete="off" />
            </Field>
            <Button type="submit" disabled={busy} className="w-full">Log workout</Button>
          </form>
        )}
      </Card>

      {toast && (
        <p className={`rounded-2xl px-4 py-3 text-sm ${toast.kind === "ok" ? "bg-you/10 text-you" : "bg-danger/10 text-danger"}`}>
          {toast.text}
        </p>
      )}

      <Card>
        <h2 className="mb-3 font-medium">Your entries today</h2>
        <ul className="divide-y divide-line text-sm">
          {myWeight && (
            <Row label="Weight" detail={formatWeight(myWeight.weight_kg, unit)} onDelete={() => remove("weight_logs", myWeight.id)} />
          )}
          {myWorkouts.map((w) => (
            <Row key={w.id} label={w.name} detail={w.duration_min ? `${w.duration_min} min` : "Workout"} onDelete={() => remove("workout_logs", w.id)} />
          ))}
          {myMeals.map((m) => (
            <Row key={m.id} label={m.name} detail={`${m.calories} kcal · ${m.protein_g}g`} onDelete={() => remove("meal_logs", m.id)} />
          ))}
          {!myWeight && myWorkouts.length === 0 && myMeals.length === 0 && (
            <li className="py-2 text-muted">Nothing yet.</li>
          )}
        </ul>
      </Card>
    </div>
  );
}

function Row({ label, detail, onDelete }: { label: string; detail: string; onDelete: () => void }) {
  return (
    <li className="flex items-center justify-between gap-3 py-2.5">
      <span className="truncate">{label}</span>
      <span className="flex shrink-0 items-center gap-3 text-muted">
        <span className="tabular-nums">{detail}</span>
        <button onClick={onDelete} aria-label={`Delete ${label}`} className="text-muted hover:text-danger">✕</button>
      </span>
    </li>
  );
}
