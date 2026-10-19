"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { loadLibrary, loadLocations, startWorkout } from "@/lib/lift-data";
import { muscleLabel } from "@/lib/lifting";
import type { Exercise, Location, Routine, RoutineExercise } from "@/lib/types";
import { Button, Card, Field, Input } from "../ui";
import { ExercisePicker } from "./ExercisePicker";

type Row = Pick<RoutineExercise, "exercise_id" | "target_sets" | "rep_min" | "rep_max" | "rest_seconds"> & { key: string };

const newRow = (exerciseId: string): Row => ({
  key: crypto.randomUUID(),
  exercise_id: exerciseId,
  target_sets: 3,
  rep_min: 8,
  rep_max: 12,
  rest_seconds: 90,
});

export function RoutineEditor({
  routineId,
  userId,
  householdId,
  partnerName,
}: {
  routineId: string | "new";
  userId: string;
  householdId: string;
  partnerName: string | null;
}) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [library, setLibrary] = useState<Exercise[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [picking, setPicking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(routineId !== "new");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [lib, locs] = await Promise.all([loadLibrary(supabase), loadLocations(supabase, householdId)]);
        if (cancelled) return;
        setLibrary(lib);
        setLocations(locs);
        if (routineId === "new") return;
        const [r, re] = await Promise.all([
          supabase.from("routines").select("*").eq("id", routineId).single(),
          supabase.from("routine_exercises").select("*").eq("routine_id", routineId).order("position"),
        ]);
        if (cancelled) return;
        if (r.error || !r.data) throw new Error("Routine not found");
        setRoutine(r.data as Routine);
        setName(r.data.name);
        setNotes(r.data.notes ?? "");
        setRows(((re.data ?? []) as RoutineExercise[]).map((x) => ({ ...x, key: x.id })));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Couldn't load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase, routineId, householdId]);

  const isOwner = routineId === "new" || routine?.owner_id === userId;
  const byId = new Map(library.map((e) => [e.id, e]));

  const update = (key: string, patch: Partial<Row>) =>
    setRows((cur) =>
      cur.map((r) => {
        if (r.key !== key) return r;
        const next = { ...r, ...patch };
        if (next.rep_max < next.rep_min) next.rep_max = next.rep_min;
        return next;
      }),
    );
  const move = (key: string, dir: -1 | 1) =>
    setRows((cur) => {
      const i = cur.findIndex((r) => r.key === key);
      const j = i + dir;
      if (j < 0 || j >= cur.length) return cur;
      const copy = [...cur];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  async function save() {
    if (!name.trim()) return setError("Give the routine a name.");
    setBusy(true);
    setError(null);
    try {
      let id = routine?.id;
      if (!id) {
        const { data, error } = await supabase
          .from("routines")
          .insert({ household_id: householdId, owner_id: userId, name: name.trim(), notes: notes.trim() || null })
          .select()
          .single();
        if (error) throw error;
        id = data.id as string;
      } else {
        const { error } = await supabase.from("routines").update({ name: name.trim(), notes: notes.trim() || null }).eq("id", id);
        if (error) throw error;
      }
      // Atomic replace of the exercise list.
      const { error } = await supabase.rpc("save_routine_exercises", {
        routine: id,
        items: rows.map(({ exercise_id, target_sets, rep_min, rep_max, rest_seconds }) => ({
          exercise_id,
          target_sets,
          rep_min,
          rep_max,
          rest_seconds,
        })),
      });
      if (error) throw error;
      router.push("/lift");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save");
      setBusy(false);
    }
  }

  async function copy() {
    if (!routine) return;
    setBusy(true);
    const { data, error } = await supabase.rpc("copy_routine", { source: routine.id });
    if (error) {
      setError(error.message);
      return setBusy(false);
    }
    router.replace(`/lift/routines/${(data as Routine).id}`);
  }

  async function remove() {
    if (!routine) return;
    const { error } = await supabase.from("routines").delete().eq("id", routine.id);
    if (error) return setError(error.message);
    router.push("/lift");
  }

  async function start() {
    if (!routine) return;
    setBusy(true);
    try {
      let locationId: string | null = null;
      try {
        locationId = localStorage.getItem("fitpartner:location");
      } catch {}
      const w = await startWorkout(supabase, userId, householdId, {
        name: routine.name,
        routineId: routine.id,
        locationId: locations.some((l) => l.id === locationId) ? locationId : null,
      });
      router.push(`/lift/session/${w.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't start");
      setBusy(false);
    }
  }

  if (loading) return <div className="h-64 animate-pulse rounded-3xl bg-surface" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-1">
        <Link href="/lift" className="text-xl text-muted" aria-label="Back">‹</Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          {routineId === "new" ? "New routine" : isOwner ? "Edit routine" : routine?.name}
        </h1>
      </div>

      {!isOwner && (
        <Card className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted">{partnerName ?? "Your partner"}&apos;s routine. Copy it to change sets or exercises.</p>
          <Button variant="ghost" disabled={busy} onClick={() => void copy()} className="shrink-0">Copy to mine</Button>
        </Card>
      )}

      {error && <p className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>}

      {isOwner && (
        <Card className="space-y-4">
          <Field label="Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="Push day" />
          </Field>
          <Field label="Notes (optional)">
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Warm up with 2 light sets" />
          </Field>
        </Card>
      )}
      {!isOwner && routine?.notes && <p className="px-1 text-sm text-muted">{routine.notes}</p>}

      <div className="space-y-3">
        {rows.map((r, i) => {
          const ex = byId.get(r.exercise_id);
          return (
            <Card key={r.key} className="p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <span className="min-w-0">
                  <span className="block truncate font-medium">{ex?.name ?? "Exercise"}</span>
                  <span className="text-xs text-muted">{ex ? muscleLabel(ex.muscle_group) : ""}</span>
                </span>
                {isOwner && (
                  <span className="flex shrink-0 items-center gap-1 text-muted">
                    <IconButton label="Move up" disabled={i === 0} onClick={() => move(r.key, -1)}>↑</IconButton>
                    <IconButton label="Move down" disabled={i === rows.length - 1} onClick={() => move(r.key, 1)}>↓</IconButton>
                    <IconButton label="Remove" onClick={() => setRows((cur) => cur.filter((x) => x.key !== r.key))}>✕</IconButton>
                  </span>
                )}
              </div>
              {isOwner ? (
                <div className="grid grid-cols-4 gap-2">
                  <Num label="Sets" value={r.target_sets} min={1} max={10} onChange={(v) => update(r.key, { target_sets: v })} />
                  <Num label="Reps min" value={r.rep_min} min={1} max={50} onChange={(v) => update(r.key, { rep_min: v })} />
                  <Num label="Reps max" value={r.rep_max} min={r.rep_min} max={50} onChange={(v) => update(r.key, { rep_max: v })} />
                  <Num label="Rest (s)" value={r.rest_seconds} min={0} max={600} step={15} onChange={(v) => update(r.key, { rest_seconds: v })} />
                </div>
              ) : (
                <p className="text-sm text-muted tabular-nums">
                  {r.target_sets} × {r.rep_min === r.rep_max ? r.rep_min : `${r.rep_min} to ${r.rep_max}`} reps · rest {r.rest_seconds}s
                </p>
              )}
            </Card>
          );
        })}
        {rows.length === 0 && <p className="px-1 text-sm text-muted">No exercises yet.</p>}
      </div>

      {isOwner && (
        <Button variant="ghost" className="w-full" onClick={() => setPicking(true)}>+ Add exercise</Button>
      )}

      <div className="grid grid-cols-2 gap-3">
        {isOwner ? (
          <>
            {routine ? (
              confirmDelete ? (
                <Button variant="danger" onClick={() => void remove()}>Confirm delete</Button>
              ) : (
                <Button variant="danger" onClick={() => setConfirmDelete(true)}>Delete</Button>
              )
            ) : (
              <Button variant="ghost" onClick={() => router.push("/lift")}>Cancel</Button>
            )}
            <Button disabled={busy || !name.trim()} onClick={() => void save()}>Save</Button>
          </>
        ) : (
          <Button className="col-span-2" disabled={busy || rows.length === 0} onClick={() => void start()}>
            Start this routine
          </Button>
        )}
      </div>

      {picking && (
        <ExercisePicker
          exercises={library}
          location={null}
          onClose={() => setPicking(false)}
          onPick={(e) => {
            setRows((cur) => [...cur, newRow(e.id)]);
            setPicking(false);
          }}
        />
      )}
    </div>
  );
}

function Num({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-muted">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (Number.isFinite(v)) onChange(Math.min(max, Math.max(min, Math.round(v))));
        }}
        className="h-11 w-full rounded-xl border border-line bg-surface-2 px-2 text-center text-base tabular-nums text-text outline-none focus:border-you"
      />
    </label>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button aria-label={label} disabled={disabled} onClick={onClick} className="flex size-8 items-center justify-center rounded-lg hover:bg-surface-2 disabled:opacity-30">
      {children}
    </button>
  );
}
