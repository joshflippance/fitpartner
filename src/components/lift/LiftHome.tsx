"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { loadLocations, loadOpenWorkout, loadRoutines, startWorkout } from "@/lib/lift-data";
import type { Location, Profile, Routine, RoutineExercise, WorkoutLog } from "@/lib/types";
import { Button, Card } from "../ui";

const LOCATION_KEY = "fitpartner:location";

export function LiftHome({ userId, householdId, partner }: { userId: string; householdId: string; partner: Profile | null }) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [items, setItems] = useState<RoutineExercise[]>([]);
  const [open, setOpen] = useState<WorkoutLog | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [locs, r, o] = await Promise.all([
          loadLocations(supabase, householdId),
          loadRoutines(supabase, householdId),
          loadOpenWorkout(supabase, userId),
        ]);
        if (cancelled) return;
        setLocations(locs);
        setRoutines(r.routines);
        setItems(r.items);
        setOpen(o);
        let saved: string | null = null;
        try {
          saved = localStorage.getItem(LOCATION_KEY);
        } catch {}
        if (saved && locs.some((l) => l.id === saved)) setLocationId(saved);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Couldn't load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase, householdId, userId]);

  function pickLocation(id: string | null) {
    setLocationId(id);
    try {
      if (id) localStorage.setItem(LOCATION_KEY, id);
      else localStorage.removeItem(LOCATION_KEY);
    } catch {}
  }

  async function start(routine: Routine | null) {
    setBusy(true);
    setError(null);
    try {
      const w = await startWorkout(supabase, userId, householdId, {
        name: routine?.name ?? "Workout",
        routineId: routine?.id ?? null,
        locationId,
      });
      router.push(`/lift/session/${w.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't start the workout");
      setBusy(false);
    }
  }

  const count = (id: string) => items.filter((i) => i.routine_id === id).length;
  const mine = routines.filter((r) => r.owner_id === userId);
  const theirs = routines.filter((r) => r.owner_id !== userId);

  return (
    <div className="space-y-4">
      <h1 className="px-1 text-2xl font-semibold tracking-tight">Lift</h1>

      {error && <p className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>}

      {open && (
        <Card className="border-you/40">
          <p className="text-sm text-muted">Workout in progress</p>
          <p className="mt-1 font-medium">{open.name}</p>
          <Button className="mt-4 w-full" onClick={() => router.push(`/lift/session/${open.id}`)}>
            Resume
          </Button>
        </Card>
      )}

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium">Where are you training?</h2>
          <Link href="/lift/locations" className="text-sm text-muted underline-offset-4 hover:underline">
            Edit
          </Link>
        </div>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Location">
          <Chip active={locationId === null} onClick={() => pickLocation(null)}>
            Anywhere
          </Chip>
          {locations.map((l) => (
            <Chip key={l.id} active={locationId === l.id} onClick={() => pickLocation(l.id)}>
              {l.name}
            </Chip>
          ))}
          {locations.length === 0 && !loading && (
            <Link href="/lift/locations" className="rounded-full border border-dashed border-line px-3 py-1.5 text-sm text-muted">
              + Add Home or Gym
            </Link>
          )}
        </div>
        <Button variant="ghost" className="mt-4 w-full" disabled={busy || Boolean(open)} onClick={() => void start(null)}>
          Start an empty workout
        </Button>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium">Your routines</h2>
          <Link href="/lift/routines/new" className="text-sm font-medium text-you">
            + New
          </Link>
        </div>
        {loading ? (
          <div className="h-16 animate-pulse rounded-2xl bg-surface-2" />
        ) : mine.length === 0 ? (
          <p className="text-sm text-muted">No routines yet. Build one, or copy {partner?.display_name ?? "your partner"}&apos;s.</p>
        ) : (
          <RoutineList list={mine} count={count} onStart={start} disabled={busy || Boolean(open)} />
        )}
      </Card>

      {partner && (
        <Card>
          <h2 className="mb-3 font-medium">{partner.display_name}&apos;s routines</h2>
          {theirs.length === 0 ? (
            <p className="text-sm text-muted">Nothing shared yet.</p>
          ) : (
            <RoutineList list={theirs} count={count} onStart={start} disabled={busy || Boolean(open)} />
          )}
        </Card>
      )}

      <Link href="/lift/exercises" className="block">
        <Card className="flex items-center justify-between">
          <span>
            <span className="block font-medium">Exercise library</span>
            <span className="text-sm text-muted">Browse, filter by location, add your own</span>
          </span>
          <span className="text-muted">›</span>
        </Card>
      </Link>
    </div>
  );
}

function RoutineList({
  list,
  count,
  onStart,
  disabled,
}: {
  list: Routine[];
  count: (id: string) => number;
  onStart: (r: Routine) => void;
  disabled: boolean;
}) {
  return (
    <ul className="divide-y divide-line">
      {list.map((r) => (
        <li key={r.id} className="flex items-center justify-between gap-3 py-3">
          <Link href={`/lift/routines/${r.id}`} className="min-w-0">
            <span className="block truncate font-medium">{r.name}</span>
            <span className="text-xs text-muted">
              {count(r.id)} {count(r.id) === 1 ? "exercise" : "exercises"}
            </span>
          </Link>
          <button
            onClick={() => onStart(r)}
            disabled={disabled || count(r.id) === 0}
            className="shrink-0 rounded-full bg-you px-4 py-2 text-sm font-medium text-black disabled:opacity-40"
          >
            Start
          </button>
        </li>
      ))}
    </ul>
  );
}

export function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm ${active ? "bg-you font-medium text-black" : "border border-line bg-surface-2 text-text"}`}
    >
      {children}
    </button>
  );
}
