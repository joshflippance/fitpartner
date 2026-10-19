import { isLowerBody } from "./lifting";
import { fromKg, toKg } from "./units";
import type { MuscleGroup, WeightUnit } from "./types";

/**
 * Rep-range ("double progression") suggestions.
 *
 * Each routine exercise has a rep range, for example 8 to 12. Keep the weight and add reps
 * until every working set reaches the top of the range, then add weight and drop back to
 * the bottom of the range.
 */

export interface Target {
  sets: number;
  repMin: number;
  repMax: number;
}

export interface LoggedSet {
  reps: number;
  weight_kg: number;
}

export interface Suggestion {
  /** Suggested weight in the person's unit, or null when there's no history. */
  weight: number | null;
  weightKg: number | null;
  reps: number;
  /** Short reason shown under the exercise. */
  reason: string;
  kind: "first" | "increase" | "build" | "hold" | "bodyweight_top";
}

/** Weight steps: 5 lb or 2.5 kg for upper body, double for lower body. */
export function increment(muscle: MuscleGroup, unit: WeightUnit) {
  const base = unit === "kg" ? 2.5 : 5;
  return isLowerBody(muscle) ? base * 2 : base;
}

/** Round to the nearest plate-friendly step (0.5 lb or 0.25 kg). */
export function roundWeight(value: number, unit: WeightUnit) {
  const step = unit === "kg" ? 0.25 : 0.5;
  return Math.round(value / step) * step;
}

export function suggestNext(
  lastSession: LoggedSet[],
  target: Target,
  muscle: MuscleGroup,
  unit: WeightUnit,
): Suggestion {
  const { repMin, repMax, sets } = target;
  if (lastSession.length === 0) {
    return {
      weight: null,
      weightKg: null,
      reps: repMin,
      reason: `First time: pick a weight you can lift for ${repMin} to ${repMax} reps.`,
      kind: "first",
    };
  }

  const topKg = Math.max(...lastSession.map((s) => s.weight_kg));
  const working = lastSession.filter((s) => s.weight_kg === topKg).slice(0, sets);
  const top = roundWeight(fromKg(topKg, unit), unit);
  const lowest = Math.min(...working.map((s) => s.reps));
  const allAtTop = working.length >= sets && working.every((s) => s.reps >= repMax);

  if (topKg === 0) {
    if (allAtTop) {
      return {
        weight: 0,
        weightKg: 0,
        reps: repMax,
        reason: `Hit ${repMax} on every set. Add weight or move to a harder variation.`,
        kind: "bodyweight_top",
      };
    }
    const reps = Math.min(repMax, Math.max(repMin, lowest + 1));
    return { weight: 0, weightKg: 0, reps, reason: `Aim for ${reps} reps on every set.`, kind: "build" };
  }

  if (allAtTop) {
    const step = increment(muscle, unit);
    const next = roundWeight(top + step, unit);
    return {
      weight: next,
      weightKg: Math.round(toKg(next, unit) * 100) / 100,
      reps: repMin,
      reason: `Hit ${repMax} on all ${sets} sets last time, so up ${step} ${unit}.`,
      kind: "increase",
    };
  }

  if (lowest < repMin) {
    return {
      weight: top,
      weightKg: topKg,
      reps: repMin,
      reason: `Below ${repMin} last time. Stay at ${top} ${unit} and aim for ${repMin}.`,
      kind: "hold",
    };
  }

  const reps = Math.min(repMax, lowest + 1);
  return {
    weight: top,
    weightKg: topKg,
    reps,
    reason: `Last time ${working.map((s) => s.reps).join(", ")}. Aim for ${reps} on every set.`,
    kind: "build",
  };
}
