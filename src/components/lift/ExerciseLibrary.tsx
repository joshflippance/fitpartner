"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { EQUIPMENT, MUSCLE_GROUPS } from "@/lib/lifting";
import { loadLibrary, loadLocations } from "@/lib/lift-data";
import type { Exercise, Location, MuscleGroup } from "@/lib/types";
import { Button, Card, Field, Input } from "../ui";
import { Chip } from "./LiftHome";
import { ExerciseList } from "./ExercisePicker";

export function ExerciseLibrary({ userId, householdId }: { userId: string; householdId: string }) {
  const supabase = useMemo(() => createClient(), []);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Exercise | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => setExercises(await loadLibrary(supabase));

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadLibrary(supabase), loadLocations(supabase, householdId)])
      .then(([ex, locs]) => {
        if (cancelled) return;
        setExercises(ex);
        setLocations(locs);
      })
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [supabase, householdId]);

  const location = locations.find((l) => l.id === locationId) ?? null;

  async function archive(e: Exercise) {
    const { error } = await supabase.from("exercises").update({ archived: true }).eq("id", e.id);
    if (error) return setError(error.message);
    await reload();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <Link href="/lift" className="text-xl text-muted" aria-label="Back">‹</Link>
          <h1 className="text-2xl font-semibold tracking-tight">Exercises</h1>
        </div>
        <button onClick={() => setEditing("new")} className="text-sm font-medium text-you">+ Custom</button>
      </div>

      {error && <p className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>}

      {editing && (
        <ExerciseForm
          initial={editing === "new" ? null : editing}
          onCancel={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await reload();
          }}
          userId={userId}
          householdId={householdId}
        />
      )}

      {locations.length > 0 && (
        <div className="flex flex-wrap gap-2 px-1" role="radiogroup" aria-label="Filter by location">
          <Chip active={!locationId} onClick={() => setLocationId(null)}>Anywhere</Chip>
          {locations.map((l) => (
            <Chip key={l.id} active={locationId === l.id} onClick={() => setLocationId(l.id)}>{l.name}</Chip>
          ))}
        </div>
      )}

      <Card>
        <ExerciseList
          exercises={exercises}
          location={location}
          renderExtra={(e) =>
            e.created_by === userId ? (
              <span className="flex gap-2 text-xs">
                <button onClick={() => setEditing(e)} className="text-muted">Edit</button>
                <button onClick={() => void archive(e)} className="text-muted">Hide</button>
              </span>
            ) : null
          }
        />
      </Card>
    </div>
  );
}

function ExerciseForm({
  initial,
  onCancel,
  onSaved,
  userId,
  householdId,
}: {
  initial: Exercise | null;
  onCancel: () => void;
  onSaved: () => void;
  userId: string;
  householdId: string;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [name, setName] = useState(initial?.name ?? "");
  const [muscle, setMuscle] = useState<MuscleGroup>(initial?.muscle_group ?? "chest");
  const [equipment, setEquipment] = useState<string[]>(initial?.equipment ?? []);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const toggle = (id: string) => setEquipment((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const values = { name: name.trim(), muscle_group: muscle, equipment };
    const { error } = initial
      ? await supabase.from("exercises").update(values).eq("id", initial.id)
      : await supabase.from("exercises").insert({ ...values, household_id: householdId, created_by: userId });
    setBusy(false);
    if (error) return setError(error.message.includes("duplicate") ? "An exercise with that name already exists." : error.message);
    onSaved();
  }

  return (
    <Card>
      <form onSubmit={submit} className="space-y-4">
        <h2 className="font-medium">{initial ? "Edit exercise" : "New custom exercise"}</h2>
        <Field label="Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required placeholder="Landmine press" />
        </Field>
        <Field label="Main muscle">
          <select
            value={muscle}
            onChange={(e) => setMuscle(e.target.value as MuscleGroup)}
            className="h-12 w-full rounded-2xl border border-line bg-surface px-4 text-base text-text"
          >
            {MUSCLE_GROUPS.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </Field>
        <div>
          <p className="mb-2 text-sm text-muted">Equipment needed (leave empty for bodyweight)</p>
          <ul className="grid grid-cols-2 gap-2">
            {EQUIPMENT.map((eq) => (
              <li key={eq.id}>
                <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-surface-2 px-3 py-2.5 text-sm">
                  <input type="checkbox" checked={equipment.includes(eq.id)} onChange={() => toggle(eq.id)} className="size-4 accent-[var(--you)]" />
                  {eq.label}
                </label>
              </li>
            ))}
          </ul>
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={busy || !name.trim()}>{initial ? "Save" : "Add"}</Button>
        </div>
      </form>
    </Card>
  );
}
