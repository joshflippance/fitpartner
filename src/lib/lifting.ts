import type { Exercise, Location, MuscleGroup } from "./types";

export const EQUIPMENT = [
  { id: "barbell", label: "Barbell" },
  { id: "squat_rack", label: "Squat rack" },
  { id: "bench", label: "Bench" },
  { id: "dumbbells", label: "Dumbbells" },
  { id: "kettlebell", label: "Kettlebell" },
  { id: "cable", label: "Cable machine" },
  { id: "machine", label: "Weight machines" },
  { id: "pull_up_bar", label: "Pull-up bar" },
  { id: "bands", label: "Resistance bands" },
] as const;

export const MUSCLE_GROUPS: { id: MuscleGroup; label: string }[] = [
  { id: "chest", label: "Chest" },
  { id: "back", label: "Back" },
  { id: "shoulders", label: "Shoulders" },
  { id: "biceps", label: "Biceps" },
  { id: "triceps", label: "Triceps" },
  { id: "quads", label: "Quads" },
  { id: "hamstrings", label: "Hamstrings" },
  { id: "glutes", label: "Glutes" },
  { id: "calves", label: "Calves" },
  { id: "core", label: "Core" },
  { id: "full_body", label: "Full body" },
];

export const equipmentLabel = (id: string) => EQUIPMENT.find((e) => e.id === id)?.label ?? id;
export const muscleLabel = (id: string) => MUSCLE_GROUPS.find((m) => m.id === id)?.label ?? id;

const LOWER_BODY: MuscleGroup[] = ["quads", "hamstrings", "glutes", "calves"];
export const isLowerBody = (m: MuscleGroup) => LOWER_BODY.includes(m);

/** An exercise is available at a location when every piece of equipment it needs is there. No location means everything. */
export function isAvailable(exercise: Pick<Exercise, "equipment">, location: Pick<Location, "equipment"> | null) {
  if (!location) return true;
  return exercise.equipment.every((item) => location.equipment.includes(item));
}

/** Library first sorted by muscle group then name, with archived custom exercises removed. */
export function sortExercises<T extends Pick<Exercise, "name" | "muscle_group" | "archived">>(list: T[]): T[] {
  const order = new Map(MUSCLE_GROUPS.map((m, i) => [m.id, i]));
  return list
    .filter((e) => !e.archived)
    .sort((a, b) => (order.get(a.muscle_group)! - order.get(b.muscle_group)!) || a.name.localeCompare(b.name));
}
