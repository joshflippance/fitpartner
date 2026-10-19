"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { loadLastSessions, loadLibrary, loadProfile, normalizeSet } from "@/lib/lift-data";
import { muscleLabel } from "@/lib/lifting";
import { roundWeight, suggestNext, type Suggestion } from "@/lib/progression";
import { fromKg, toKg } from "@/lib/units";
import type { Exercise, Location, RoutineExercise, WeightUnit, WorkoutLog, WorkoutSet } from "@/lib/types";
import { Button, Card } from "../ui";
import { ExercisePicker } from "./ExercisePicker";
import { RestTimer } from "./RestTimer";

interface Target {
  sets: number;
  repMin: number;
  repMax: number;
  rest: number;
}
const DEFAULT_TARGET: Target = { sets: 3, repMin: 8, repMax: 12, rest: 90 };

type Draft = { weight: string; reps: string };

/** Timestamp `seconds` from now (or from `base`). Kept outside the component for render purity. */
const secondsFromNow = (seconds: number, base?: number | null) => (base ?? Date.now()) + seconds * 1000;

export function ActiveSession({ workoutId, userId }: { workoutId: string; userId: string }) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [workout, setWorkout] = useState<WorkoutLog | null>(null);
  const [unit, setUnit] = useState<WeightUnit>("lb");
  const [library, setLibrary] = useState<Exercise[]>([]);
  const [location, setLocation] = useState<Location | null>(null);
  const [items, setItems] = useState<RoutineExercise[]>([]);
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [last, setLast] = useState<Map<string, WorkoutSet[]>>(new Map());
  const [extra, setExtra] = useState<string[]>([]); // exercises added during the session
  const [extraRows, setExtraRows] = useState<Record<string, number>>({});
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [editing, setEditing] = useState<string | null>(null); // set id being edited
  const [restUntil, setRestUntil] = useState<number | null>(null);
  const [picking, setPicking] = useState(false);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reloadSets = useCallback(async () => {
    const { data } = await supabase.from("workout_sets").select("*").eq("workout_id", workoutId).order("created_at");
    setSets(((data ?? []) as WorkoutSet[]).map(normalizeSet));
  }, [supabase, workoutId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: w, error: wErr } = await supabase.from("workout_logs").select("*").eq("id", workoutId).single();
        if (wErr || !w) throw new Error("Workout not found");
        const [profile, lib, re, loc, s] = await Promise.all([
          loadProfile(supabase, userId),
          loadLibrary(supabase),
          w.routine_id
            ? supabase.from("routine_exercises").select("*").eq("routine_id", w.routine_id).order("position")
            : Promise.resolve({ data: [] as RoutineExercise[] }),
          w.location_id ? supabase.from("locations").select("*").eq("id", w.location_id).single() : Promise.resolve({ data: null }),
          supabase.from("workout_sets").select("*").eq("workout_id", workoutId).order("created_at"),
        ]);
        if (cancelled) return;
        const routineItems = (re.data ?? []) as RoutineExercise[];
        const existing = ((s.data ?? []) as WorkoutSet[]).map(normalizeSet);
        const ids = [...new Set([...routineItems.map((i) => i.exercise_id), ...existing.map((x) => x.exercise_id)])];
        const history = await loadLastSessions(supabase, userId, ids, workoutId);
        if (cancelled) return;
        setWorkout(w as WorkoutLog);
        setUnit(profile?.weight_unit ?? "lb");
        setLibrary(lib);
        setItems(routineItems);
        setLocation((loc.data as Location | null) ?? null);
        setSets(existing);
        setLast(history);
        setExtra(ids.filter((id) => !routineItems.some((i) => i.exercise_id === id)));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Couldn't load the workout");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase, workoutId, userId]);

  const byId = useMemo(() => new Map(library.map((e) => [e.id, e])), [library]);
  const order = [...items.map((i) => i.exercise_id), ...extra.filter((id) => !items.some((i) => i.exercise_id === id))];

  const targetFor = (exerciseId: string): Target => {
    const i = items.find((x) => x.exercise_id === exerciseId);
    return i ? { sets: i.target_sets, repMin: i.rep_min, repMax: i.rep_max, rest: i.rest_seconds } : DEFAULT_TARGET;
  };

  async function addExercise(e: Exercise) {
    setPicking(false);
    if (order.includes(e.id)) return;
    setExtra((cur) => [...cur, e.id]);
    const history = await loadLastSessions(supabase, userId, [e.id], workoutId);
    setLast((cur) => new Map([...cur, ...history]));
  }

  async function logSet(exerciseId: string, setNumber: number, draft: Draft, existing?: WorkoutSet) {
    const reps = Math.round(Number(draft.reps));
    const weight = draft.weight === "" ? 0 : Number(draft.weight);
    if (!Number.isFinite(reps) || reps < 0 || !Number.isFinite(weight) || weight < 0) {
      setError("Enter a weight and reps.");
      return;
    }
    setBusy(true);
    setError(null);
    const values = { reps, weight_kg: Math.round(toKg(weight, unit) * 100) / 100 };
    const { error } = existing
      ? await supabase.from("workout_sets").update(values).eq("id", existing.id)
      : await supabase.from("workout_sets").insert({
          ...values,
          workout_id: workoutId,
          user_id: userId,
          household_id: workout!.household_id,
          exercise_id: exerciseId,
          set_number: setNumber,
        });
    setBusy(false);
    if (error) return setError(error.message);
    setEditing(null);
    if (!existing) setRestUntil(secondsFromNow(targetFor(exerciseId).rest));
    await reloadSets();
  }

  async function removeSet(s: WorkoutSet) {
    const { error } = await supabase.from("workout_sets").delete().eq("id", s.id);
    if (error) return setError(error.message);
    setEditing(null);
    await reloadSets();
  }

  async function finish() {
    if (!workout) return;
    setBusy(true);
    if (sets.length === 0) {
      await supabase.from("workout_logs").delete().eq("id", workout.id);
      router.push("/lift");
      return;
    }
    const minutes = workout.started_at
      ? Math.min(600, Math.max(1, Math.round((Date.now() - new Date(workout.started_at).getTime()) / 60_000)))
      : null;
    const { error } = await supabase
      .from("workout_logs")
      .update({ finished_at: new Date().toISOString(), duration_min: minutes })
      .eq("id", workout.id);
    if (error) {
      setError(error.message);
      return setBusy(false);
    }
    router.push("/");
  }

  if (loading) return <div className="h-64 animate-pulse rounded-3xl bg-surface" />;
  if (!workout) return <p className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger">{error ?? "Workout not found"}</p>;
  if (workout.user_id !== userId) {
    return (
      <Card>
        <p className="text-muted">This is your partner&apos;s workout.</p>
        <Link href="/lift" className="mt-3 inline-block text-sm text-you">Back to Lift</Link>
      </Card>
    );
  }

  const finished = Boolean(workout.finished_at);

  return (
    <div className="space-y-4 pb-16">
      <header className="flex items-center justify-between gap-3 px-1">
        <div className="min-w-0">
          <Link href="/lift" className="text-sm text-muted">‹ Lift</Link>
          <h1 className="truncate text-2xl font-semibold tracking-tight">{workout.name}</h1>
          <p className="text-xs text-muted">
            {location ? location.name : "Anywhere"}
            {workout.started_at && !finished && <> · <Elapsed since={workout.started_at} /></>}
            {finished && " · Finished"}
          </p>
        </div>
      </header>

      {error && <p className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>}

      {order.map((exerciseId) => {
        const ex = byId.get(exerciseId);
        if (!ex) return null;
        const target = targetFor(exerciseId);
        const logged = sets.filter((s) => s.exercise_id === exerciseId).sort((a, b) => a.set_number - b.set_number);
        const prev = last.get(exerciseId) ?? [];
        const suggestion = suggestNext(prev, target, ex.muscle_group, unit);
        const rowCount = Math.max(target.sets, logged.length) + (extraRows[exerciseId] ?? 0);

        return (
          <Card key={exerciseId} className="p-4">
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <h2 className="truncate font-medium">{ex.name}</h2>
              <span className="shrink-0 text-xs text-muted">{muscleLabel(ex.muscle_group)}</span>
            </div>
            <SuggestionLine s={suggestion} unit={unit} target={target} bodyweight={ex.equipment.length === 0} />
            {prev.length > 0 && (
              <p className="mt-0.5 text-xs text-muted tabular-nums">
                Last: {prev.map((p) => `${fmt(fromKg(p.weight_kg, unit), unit)}×${p.reps}`).join(", ")}
              </p>
            )}

            <div className="mt-3 grid grid-cols-[2rem_1fr_1fr_3rem] items-center gap-2 text-xs text-muted">
              <span>Set</span>
              <span>{unit}</span>
              <span>Reps</span>
              <span />
            </div>
            {Array.from({ length: rowCount }, (_, i) => {
              const n = i + 1;
              const done = logged.find((s) => s.set_number === n);
              const key = `${exerciseId}:${n}`;
              const prevInSession = logged.filter((s) => s.set_number < n).at(-1);
              const defaults: Draft = {
                weight:
                  prevInSession != null
                    ? String(fmt(fromKg(prevInSession.weight_kg, unit), unit))
                    : suggestion.weight != null
                      ? String(suggestion.weight)
                      : "",
                reps: String(prevInSession?.reps ?? suggestion.reps),
              };
              const isEditing = done && editing === done.id;
              const draft =
                drafts[key] ??
                (done ? { weight: String(fmt(fromKg(done.weight_kg, unit), unit)), reps: String(done.reps) } : defaults);
              const setDraft = (patch: Partial<Draft>) => setDrafts((cur) => ({ ...cur, [key]: { ...draft, ...patch } }));

              if (done && !isEditing) {
                return (
                  <button
                    key={key}
                    onClick={() => !finished && setEditing(done.id)}
                    className="grid w-full grid-cols-[2rem_1fr_1fr_3rem] items-center gap-2 rounded-xl py-1.5 text-left tabular-nums"
                  >
                    <span className="text-sm text-muted">{n}</span>
                    <span className="h-10 rounded-xl bg-you/10 px-3 leading-10">{fmt(fromKg(done.weight_kg, unit), unit)}</span>
                    <span className="h-10 rounded-xl bg-you/10 px-3 leading-10">{done.reps}</span>
                    <span className="flex size-10 items-center justify-center rounded-xl bg-you text-black" aria-label="Logged">✓</span>
                  </button>
                );
              }

              return (
                <div key={key} className="grid grid-cols-[2rem_1fr_1fr_3rem] items-center gap-2 py-1.5">
                  <span className="text-sm text-muted">{n}</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step={unit === "kg" ? 0.25 : 0.5}
                    min={0}
                    value={draft.weight}
                    placeholder="0"
                    onChange={(e) => setDraft({ weight: e.target.value })}
                    disabled={finished}
                    aria-label={`Set ${n} weight`}
                    className="h-10 w-full rounded-xl border border-line bg-surface-2 px-3 text-base tabular-nums text-text outline-none focus:border-you"
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={100}
                    value={draft.reps}
                    onChange={(e) => setDraft({ reps: e.target.value })}
                    disabled={finished}
                    aria-label={`Set ${n} reps`}
                    className="h-10 w-full rounded-xl border border-line bg-surface-2 px-3 text-base tabular-nums text-text outline-none focus:border-you"
                  />
                  {isEditing ? (
                    <span className="flex gap-1">
                      <button onClick={() => void logSet(exerciseId, n, draft, done)} className="flex size-10 items-center justify-center rounded-xl bg-you text-black" aria-label="Save set">✓</button>
                    </span>
                  ) : (
                    <button
                      onClick={() => void logSet(exerciseId, n, draft)}
                      disabled={busy || finished}
                      className="flex size-10 items-center justify-center rounded-xl border border-line text-muted active:scale-95 disabled:opacity-40"
                      aria-label={`Log set ${n}`}
                    >
                      ✓
                    </button>
                  )}
                  {isEditing && (
                    <span className="col-span-4 flex justify-end gap-4 text-xs">
                      <button onClick={() => setEditing(null)} className="text-muted">Cancel</button>
                      <button onClick={() => void removeSet(done)} className="text-danger">Delete set</button>
                    </span>
                  )}
                </div>
              );
            })}
            {!finished && (
              <button
                onClick={() => setExtraRows((cur) => ({ ...cur, [exerciseId]: (cur[exerciseId] ?? 0) + 1 }))}
                className="mt-2 text-sm text-muted"
              >
                + Add set
              </button>
            )}
          </Card>
        );
      })}

      {order.length === 0 && <p className="px-1 text-sm text-muted">Add your first exercise to get started.</p>}

      {!finished && (
        <>
          <Button variant="ghost" className="w-full" onClick={() => setPicking(true)}>+ Add exercise</Button>
          {confirmFinish ? (
            <Card className="space-y-3">
              <p className="text-sm">
                {sets.length === 0
                  ? "No sets logged. This will discard the workout."
                  : `Finish with ${sets.length} ${sets.length === 1 ? "set" : "sets"} logged? It counts toward today's streak.`}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="ghost" onClick={() => setConfirmFinish(false)}>Keep going</Button>
                <Button variant={sets.length === 0 ? "danger" : "primary"} disabled={busy} onClick={() => void finish()}>
                  {sets.length === 0 ? "Discard" : "Finish"}
                </Button>
              </div>
            </Card>
          ) : (
            <Button className="w-full" onClick={() => setConfirmFinish(true)}>Finish workout</Button>
          )}
        </>
      )}

      {restUntil && <RestTimer until={restUntil} onAdd={(s) => setRestUntil((t) => secondsFromNow(s, t))} onDone={() => setRestUntil(null)} />}

      {picking && (
        <ExercisePicker exercises={library} location={location} onPick={(e) => void addExercise(e)} onClose={() => setPicking(false)} />
      )}
    </div>
  );
}

function fmt(value: number, unit: WeightUnit) {
  return roundWeight(value, unit);
}

function SuggestionLine({ s, unit, target, bodyweight }: { s: Suggestion; unit: WeightUnit; target: Target; bodyweight: boolean }) {
  const range = target.repMin === target.repMax ? `${target.repMin}` : `${target.repMin} to ${target.repMax}`;
  const headline =
    s.weight == null
      ? `${target.sets} sets of ${range}`
      : s.weight === 0
        ? `Target: ${s.reps} reps`
        : `Target: ${s.weight} ${unit} × ${s.reps}`;
  return (
    <div className="text-sm">
      <p className={s.kind === "increase" ? "font-medium text-you" : "font-medium"}>
        {s.kind === "increase" && "↑ "}
        {headline}
      </p>
      <p className="text-xs text-muted">
        {s.kind === "first" && bodyweight
          ? `First time: aim for ${range} clean reps. Leave weight at 0, or add it if you use a vest or dumbbell.`
          : s.reason}
      </p>
    </div>
  );
}

function Elapsed({ since }: { since: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);
  const mins = Math.max(0, Math.floor((now - new Date(since).getTime()) / 60_000));
  return <span>{mins} min</span>;
}
