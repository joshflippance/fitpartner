"use client";

import { useState } from "react";
import { MUSCLE_GROUPS, equipmentLabel, isAvailable, muscleLabel, sortExercises } from "@/lib/lifting";
import type { Exercise, Location, MuscleGroup } from "@/lib/types";
import { Input } from "../ui";

/** Search and filter list. Used inline by the library page and inside the picker sheet. */
export function ExerciseList({
  exercises,
  location,
  onPick,
  pickLabel,
  renderExtra,
}: {
  exercises: Exercise[];
  location: Location | null;
  onPick?: (e: Exercise) => void;
  pickLabel?: string;
  renderExtra?: (e: Exercise) => React.ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState<MuscleGroup | "all">("all");
  const [showAll, setShowAll] = useState(false);

  const q = query.trim().toLowerCase();
  const filtered = sortExercises(exercises).filter(
    (e) =>
      (muscle === "all" || e.muscle_group === muscle) &&
      (!q || e.name.toLowerCase().includes(q)) &&
      (showAll || isAvailable(e, location)),
  );
  const hidden = location && !showAll ? sortExercises(exercises).filter((e) => !isAvailable(e, location)).length : 0;

  return (
    <div>
      <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search exercises" aria-label="Search exercises" />
      <div className="-mx-1 mt-3 flex gap-1.5 overflow-x-auto pb-1">
        {[{ id: "all" as const, label: "All" }, ...MUSCLE_GROUPS].map((m) => (
          <button
            key={m.id}
            onClick={() => setMuscle(m.id)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs ${muscle === m.id ? "bg-you font-medium text-black" : "bg-surface-2 text-muted"}`}
          >
            {m.label}
          </button>
        ))}
      </div>
      {location && (
        <label className="mt-3 flex items-center justify-between text-xs text-muted">
          <span>{showAll ? "Showing everything" : `Only what ${location.name} has${hidden ? ` (${hidden} hidden)` : ""}`}</span>
          <button onClick={() => setShowAll(!showAll)} className="underline-offset-4 hover:underline">
            {showAll ? `Filter to ${location.name}` : "Show all"}
          </button>
        </label>
      )}
      <ul className="mt-2 divide-y divide-line">
        {filtered.map((e) => (
          <li key={e.id} className="flex items-center justify-between gap-3 py-2.5">
            <span className="min-w-0">
              <span className="block truncate text-sm">
                {e.name}
                {e.household_id && <span className="ml-1.5 text-xs text-you">custom</span>}
              </span>
              <span className="text-xs text-muted">
                {muscleLabel(e.muscle_group)} · {e.equipment.length ? e.equipment.map(equipmentLabel).join(", ") : "Bodyweight"}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2">
              {renderExtra?.(e)}
              {onPick && (
                <button onClick={() => onPick(e)} className="rounded-full border border-you/40 px-3 py-1.5 text-xs font-medium text-you">
                  {pickLabel ?? "Add"}
                </button>
              )}
            </span>
          </li>
        ))}
        {filtered.length === 0 && <li className="py-6 text-center text-sm text-muted">No matches.</li>}
      </ul>
    </div>
  );
}

export function ExercisePicker({
  exercises,
  location,
  onPick,
  onClose,
}: {
  exercises: Exercise[];
  location: Location | null;
  onPick: (e: Exercise) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/60" role="dialog" aria-modal="true" aria-label="Add exercise">
      <div className="flex max-h-[85dvh] w-full max-w-md flex-col rounded-t-3xl border border-line bg-surface p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add exercise</h2>
          <button onClick={onClose} className="text-sm text-muted">Close</button>
        </div>
        <div className="-mx-1 overflow-y-auto px-1">
          <ExerciseList exercises={exercises} location={location} onPick={onPick} />
        </div>
      </div>
    </div>
  );
}
