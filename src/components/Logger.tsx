"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useHouseholdData } from "@/hooks/useHouseholdData";
import { addDays, toLocalDate } from "@/lib/dates";
import { dayLabel, loggableRange } from "@/lib/logging";
import { formatWeight, fromKg, toKg } from "@/lib/units";
import type { MealLog, WeightLog, WorkoutLog } from "@/lib/types";
import { Button, Card, Field, Input } from "./ui";

type Tab = "meal" | "weight" | "workout";
const TABS: { id: Tab; label: string }[] = [
  { id: "meal", label: "Meal" },
  { id: "weight", label: "Weight" },
  { id: "workout", label: "Workout" },
];

type Editing =
  | { kind: "meal"; row: MealLog }
  | { kind: "weight"; row: WeightLog }
  | { kind: "workout"; row: WorkoutLog }
  | null;

type Result = PromiseLike<{ error: { message: string } | null }>;

export function Logger({ userId, householdId }: { userId: string; householdId: string }) {
  const supabase = useMemo(() => createClient(), []);
  const today = toLocalDate();
  const range = loggableRange(today);

  const [date, setDate] = useState(today);
  const { profiles, meals, weights, workouts } = useHouseholdData(householdId, { mealDate: date });
  const me = profiles.find((p) => p.id === userId);
  const unit = me?.weight_unit ?? "lb";

  const [tab, setTab] = useState<Tab>("meal");
  const [editing, setEditing] = useState<Editing>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const base = { user_id: userId, household_id: householdId, log_date: date };

  async function run(action: () => Result, ok: string, form?: HTMLFormElement) {
    setBusy(true);
    const { error } = await action();
    setBusy(false);
    setToast(error ? { kind: "err", text: error.message } : { kind: "ok", text: ok });
    if (!error) {
      form?.reset();
      setEditing(null);
    }
    setTimeout(() => setToast(null), 2500);
  }

  function changeDate(next: string) {
    if (next < range.min || next > range.max) return;
    setDate(next);
    setEditing(null);
  }

  function startEdit(next: NonNullable<Editing>) {
    setEditing(next);
    setTab(next.kind);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onMeal(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const values = {
      name: String(f.get("name") || "Meal"),
      calories: Number(f.get("calories")),
      protein_g: Number(f.get("protein") || 0),
    };
    const row = editing?.kind === "meal" ? editing.row : null;
    void run(
      () => (row ? supabase.from("meal_logs").update(values).eq("id", row.id) : supabase.from("meal_logs").insert({ ...base, ...values })),
      row ? "Meal updated" : "Meal logged",
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
    const values = {
      name: String(f.get("name") || "Lift"),
      duration_min: duration > 0 ? duration : null,
      notes: String(f.get("notes") || "") || null,
    };
    const row = editing?.kind === "workout" ? editing.row : null;
    void run(
      () =>
        row ? supabase.from("workout_logs").update(values).eq("id", row.id) : supabase.from("workout_logs").insert({ ...base, ...values }),
      row ? "Workout updated" : "Workout logged",
      e.currentTarget,
    );
  }

  const remove = (table: "meal_logs" | "weight_logs" | "workout_logs", id: string) =>
    run(() => supabase.from(table).delete().eq("id", id), "Removed");

  const myMeals = meals.filter((m) => m.user_id === userId);
  const myWeight = weights.find((w) => w.user_id === userId && w.log_date === date);
  const myWorkouts = workouts.filter((w) => w.user_id === userId && w.log_date === date);

  const editMeal = editing?.kind === "meal" ? editing.row : null;
  const editWorkout = editing?.kind === "workout" ? editing.row : null;
  const formKey = editing ? `${editing.kind}-${editing.row.id}` : `new-${date}`;

  return (
    <div className="space-y-4">
      <h1 className="px-1 text-2xl font-semibold tracking-tight">Log</h1>

      <DatePicker date={date} today={today} min={range.min} max={range.max} onChange={changeDate} />

      <div className="grid grid-cols-3 gap-1 rounded-2xl bg-surface p-1" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => {
              setTab(t.id);
              setEditing(null);
            }}
            className={`h-10 rounded-xl text-sm font-medium transition ${tab === t.id ? "bg-you text-black" : "text-muted"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card>
        {editing && (
          <div className="mb-4 flex items-center justify-between rounded-xl bg-surface-2 px-3 py-2 text-sm">
            <span>Editing {editing.kind}</span>
            <button onClick={() => setEditing(null)} className="text-muted underline-offset-4 hover:underline">
              Cancel
            </button>
          </div>
        )}

        {tab === "meal" && (
          <form key={formKey} onSubmit={onMeal} className="space-y-4">
            <Field label="What did you eat?">
              <Input name="name" placeholder="Chicken and rice" autoComplete="off" defaultValue={editMeal?.name} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Calories">
                <Input name="calories" type="number" inputMode="numeric" min={0} max={9999} required defaultValue={editMeal?.calories} />
              </Field>
              <Field label="Protein (g)">
                <Input name="protein" type="number" inputMode="decimal" step="0.1" min={0} max={999} defaultValue={editMeal?.protein_g} />
              </Field>
            </div>
            <Button type="submit" disabled={busy} className="w-full">{editMeal ? "Save changes" : "Add meal"}</Button>
          </form>
        )}

        {tab === "weight" && (
          <form key={formKey} onSubmit={onWeight} className="space-y-4">
            <Field label={`Morning weight (${unit})`}>
              <Input
                name="weight"
                type="number"
                inputMode="decimal"
                step="0.1"
                min={1}
                max={880}
                required
                defaultValue={myWeight ? fromKg(myWeight.weight_kg, unit).toFixed(1) : undefined}
              />
            </Field>
            <p className="text-xs text-muted">One entry per day. Saving again replaces it.</p>
            <Button type="submit" disabled={busy} className="w-full">Save weight</Button>
          </form>
        )}

        {tab === "workout" && (
          <form key={formKey} onSubmit={onWorkout} className="space-y-4">
            <Field label="Workout">
              <Input name="name" placeholder="Push day" autoComplete="off" defaultValue={editWorkout?.name} />
            </Field>
            <Field label="Duration (min)">
              <Input name="duration" type="number" inputMode="numeric" min={1} max={600} defaultValue={editWorkout?.duration_min ?? undefined} />
            </Field>
            <Field label="Notes">
              <Input name="notes" placeholder="Bench 3x5 @ 185" autoComplete="off" defaultValue={editWorkout?.notes ?? undefined} />
            </Field>
            <Button type="submit" disabled={busy} className="w-full">{editWorkout ? "Save changes" : "Log workout"}</Button>
          </form>
        )}
      </Card>

      {toast && (
        <p className={`rounded-2xl px-4 py-3 text-sm ${toast.kind === "ok" ? "bg-you/10 text-you" : "bg-danger/10 text-danger"}`}>
          {toast.text}
        </p>
      )}

      <Card>
        <h2 className="mb-3 font-medium">Your entries, {dayLabel(date, today).toLowerCase()}</h2>
        <ul className="divide-y divide-line text-sm">
          {myWeight && (
            <Row
              label="Weight"
              detail={formatWeight(myWeight.weight_kg, unit)}
              onEdit={() => startEdit({ kind: "weight", row: myWeight })}
              onDelete={() => remove("weight_logs", myWeight.id)}
            />
          )}
          {myWorkouts.map((w) => (
            <Row
              key={w.id}
              label={w.name}
              detail={w.duration_min ? `${w.duration_min} min` : "Workout"}
              onEdit={() => startEdit({ kind: "workout", row: w })}
              onDelete={() => remove("workout_logs", w.id)}
            />
          ))}
          {myMeals.map((m) => (
            <Row
              key={m.id}
              label={m.name}
              detail={`${m.calories} kcal · ${m.protein_g}g`}
              onEdit={() => startEdit({ kind: "meal", row: m })}
              onDelete={() => remove("meal_logs", m.id)}
            />
          ))}
          {!myWeight && myWorkouts.length === 0 && myMeals.length === 0 && <li className="py-2 text-muted">Nothing yet.</li>}
        </ul>
      </Card>
    </div>
  );
}

function DatePicker({
  date,
  today,
  min,
  max,
  onChange,
}: {
  date: string;
  today: string;
  min: string;
  max: string;
  onChange: (d: string) => void;
}) {
  const arrow = "flex size-10 items-center justify-center rounded-xl text-lg disabled:opacity-30";
  return (
    <div className="flex items-center justify-between rounded-2xl bg-surface p-1">
      <button className={arrow} onClick={() => onChange(addDays(date, -1))} disabled={date <= min} aria-label="Previous day">
        ‹
      </button>
      <label className="relative flex flex-1 justify-center">
        <span className={`text-sm font-medium ${date === today ? "text-text" : "text-you"}`}>{dayLabel(date, today)}</span>
        <input
          type="date"
          value={date}
          min={min}
          max={max}
          onChange={(e) => e.target.value && onChange(e.target.value)}
          className="absolute inset-0 opacity-0"
          aria-label="Pick a date"
        />
      </label>
      <button className={arrow} onClick={() => onChange(addDays(date, 1))} disabled={date >= max} aria-label="Next day">
        ›
      </button>
    </div>
  );
}

function Row({ label, detail, onEdit, onDelete }: { label: string; detail: string; onEdit: () => void; onDelete: () => void }) {
  return (
    <li className="flex items-center justify-between gap-3 py-2.5">
      <button onClick={onEdit} className="truncate text-left hover:text-you" aria-label={`Edit ${label}`}>
        {label}
      </button>
      <span className="flex shrink-0 items-center gap-3 text-muted">
        <span className="tabular-nums">{detail}</span>
        <button onClick={onDelete} aria-label={`Delete ${label}`} className="hover:text-danger">✕</button>
      </span>
    </li>
  );
}
