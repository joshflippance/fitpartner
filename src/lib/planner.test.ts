import { describe, expect, it } from "vitest";
import { buildPlan, estimateMinutes, nextDay, planExerciseIds, validatePlan } from "./planner";
import type { Exercise, ExerciseKind, MuscleGroup } from "./types";

let n = 0;
const ex = (name: string, muscle_group: MuscleGroup, equipment: string[] = [], kind: ExerciseKind = "strength"): Exercise => ({
  id: `e${++n}`, household_id: null, name, muscle_group, equipment, created_by: null, archived: false, kind,
});

const library: Exercise[] = [
  ex("Barbell Bench Press", "chest", ["barbell", "bench"]),
  ex("Incline Dumbbell Press", "chest", ["dumbbells", "bench"]),
  ex("Push-up", "chest"),
  ex("Overhead Press", "shoulders", ["barbell"]),
  ex("Lateral Raise", "shoulders", ["dumbbells"]),
  ex("Triceps Pushdown", "triceps", ["cable"]),
  ex("Dip", "triceps"),
  ex("Pull-up", "back", ["pull_up_bar"]),
  ex("Barbell Row", "back", ["barbell"]),
  ex("One-arm Dumbbell Row", "back", ["dumbbells", "bench"]),
  ex("Dumbbell Curl", "biceps", ["dumbbells"]),
  ex("Face Pull", "shoulders", ["cable"]),
  ex("Back Squat", "quads", ["barbell", "squat_rack"]),
  ex("Goblet Squat", "quads", ["dumbbells"]),
  ex("Romanian Deadlift", "hamstrings", ["barbell"]),
  ex("Hip Thrust", "glutes", ["barbell", "bench"]),
  ex("Glute Bridge", "glutes"),
  ex("Standing Calf Raise", "calves"),
  ex("Plank", "core"),
  ex("Treadmill", "full_body", ["treadmill"], "cardio"),
  ex("Jumping Jacks", "full_body", [], "cardio"),
  ex("Arm Circles", "shoulders", [], "warmup"),
  ex("Cat-Cow", "back", [], "warmup"),
  ex("World's Greatest Stretch", "full_body", [], "warmup"),
  ex("Leg Swings", "hamstrings", [], "warmup"),
  ex("Hip Circles", "glutes", [], "warmup"),
  ex("Chest Doorway Stretch", "chest", [], "stretch"),
  ex("Cross-body Shoulder Stretch", "shoulders", [], "stretch"),
  ex("Overhead Triceps Stretch", "triceps", [], "stretch"),
  ex("Lat Stretch", "back", [], "stretch"),
  ex("Kneeling Hip Flexor Stretch", "quads", [], "stretch"),
  ex("Seated Hamstring Stretch", "hamstrings", [], "stretch"),
  ex("Figure-4 Glute Stretch", "glutes", [], "stretch"),
];
const name = (id: string) => library.find((e) => e.id === id)!.name;
const gym = { equipment: ["barbell", "bench", "dumbbells", "cable", "pull_up_bar", "squat_rack", "treadmill"] };
const home = { equipment: ["dumbbells"] };

describe("nextDay", () => {
  it("starts a split at its first day", () => {
    expect(nextDay("ppl", [])).toBe("push");
  });
  it("rotates after the most recent day of the split", () => {
    expect(nextDay("ppl", ["pull", "push"])).toBe("legs");
    expect(nextDay("ppl", ["legs"])).toBe("push");
  });
  it("ignores days from other splits and override sessions", () => {
    expect(nextDay("upper_lower", ["cardio", "push", "upper"])).toBe("lower");
  });
});

describe("buildPlan", () => {
  it("puts warm-up first, chest compound first on push day, and stretches for worked muscles", () => {
    const plan = buildPlan({ day: "push", minutes: 45, library, location: gym });
    expect(name(plan.warmup[0].exercise_id)).toBe("Treadmill");
    expect(plan.warmup.length).toBe(4);
    expect(name(plan.strength[0].exercise_id)).toBe("Barbell Bench Press");
    expect(plan.strength[0].rep_min).toBe(6);
    expect(plan.strength.map((s) => name(s.exercise_id))).toContain("Overhead Press");
    expect(name(plan.stretch[0].exercise_id)).toBe("Chest Doorway Stretch");
    expect(plan.cardio).toHaveLength(0);
  });

  it("fits the time it was given", () => {
    for (const minutes of [30, 45, 60, 75]) {
      const plan = buildPlan({ day: "full", minutes, library, location: gym, program: { cardio_minutes: 10, warmup: true, stretch: true } });
      expect(Math.abs(estimateMinutes(plan) - minutes)).toBeLessThanOrEqual(8);
    }
  });

  it("gives longer sessions more exercises", () => {
    const short = buildPlan({ day: "upper", minutes: 30, library, location: gym });
    const long = buildPlan({ day: "upper", minutes: 75, library, location: gym });
    expect(long.strength.length).toBeGreaterThan(short.strength.length);
  });

  it("uses only equipment at the location", () => {
    const plan = buildPlan({ day: "push", minutes: 45, library, location: home });
    for (const id of planExerciseIds(plan)) {
      const e = library.find((x) => x.id === id)!;
      expect(e.equipment.every((q) => home.equipment.includes(q))).toBe(true);
    }
    expect(name(plan.warmup[0].exercise_id)).toBe("Jumping Jacks");
  });

  it("prefers exercises already trained so progression continues", () => {
    const goblet = library.find((e) => e.name === "Goblet Squat")!;
    const plan = buildPlan({ day: "legs", minutes: 45, library, location: gym, lastTrained: new Map([[goblet.id, "2026-11-01"]]) });
    expect(name(plan.strength[0].exercise_id)).toBe("Goblet Squat");
  });

  it("adds a cardio finisher after lifting, and drops it when time is too short", () => {
    const withCardio = buildPlan({ day: "pull", minutes: 60, library, location: gym, program: { cardio_minutes: 15, warmup: true, stretch: true } });
    expect(withCardio.cardio[0].seconds).toBe(900);
    const tight = buildPlan({ day: "pull", minutes: 30, library, location: gym, program: { cardio_minutes: 20, warmup: true, stretch: true } });
    expect(tight.cardio).toHaveLength(0);
    expect(tight.note).toMatch(/skipped/);
  });

  it("respects warm-up and stretch switches", () => {
    const plan = buildPlan({ day: "legs", minutes: 45, library, location: gym, program: { cardio_minutes: 0, warmup: false, stretch: false } });
    expect(plan.warmup).toHaveLength(0);
    expect(plan.stretch).toHaveLength(0);
  });

  it("builds a circuit with rounds and short rests", () => {
    const plan = buildPlan({ day: "circuit", minutes: 30, library, location: gym });
    expect(plan.circuit).toEqual({ rounds: 3, round_rest: 60 });
    expect(plan.strength.length).toBeGreaterThanOrEqual(4);
    expect(plan.strength.every((s) => s.rest === 15)).toBe(true);
  });

  it("builds cardio-only and mobility sessions with no lifting", () => {
    const cardio = buildPlan({ day: "cardio", minutes: 30, library, location: gym });
    expect(cardio.strength).toHaveLength(0);
    expect(name(cardio.cardio[0].exercise_id)).toBe("Treadmill");
    const mobility = buildPlan({ day: "mobility", minutes: 30, library, location: gym });
    expect(mobility.strength).toHaveLength(0);
    expect(mobility.stretch.length).toBeGreaterThan(3);
  });

  it("never repeats an exercise in one session", () => {
    const plan = buildPlan({ day: "upper", minutes: 75, library, location: gym });
    const ids = plan.strength.map((s) => s.exercise_id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("validatePlan", () => {
  const good = () => {
    const p = buildPlan({ day: "push", minutes: 45, library, location: gym });
    return { ...p, source: "ai" };
  };

  it("accepts a plan built from the library", () => {
    const r = validatePlan(good(), library, gym);
    expect(r.ok).toBe(true);
  });

  it("accepts the same machine in the warm-up and as a cardio finisher", () => {
    const p = buildPlan({ day: "pull", minutes: 45, library, location: gym, program: { cardio_minutes: 10, warmup: true, stretch: true } });
    expect(p.warmup[0].exercise_id).toBe(p.cardio[0].exercise_id);
    expect(validatePlan(p, library, gym).ok).toBe(true);
  });

  it("rejects invented exercises", () => {
    const p = good();
    p.strength[0] = { ...p.strength[0], exercise_id: "made-up" };
    const r = validatePlan(p, library, gym);
    expect(r.ok).toBe(false);
  });

  it("rejects equipment the location lacks", () => {
    const r = validatePlan(good(), library, home);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.join()).toMatch(/equipment/);
  });

  it("rejects a stretch placed in the lifting list and duplicates", () => {
    const p = good();
    const stretch = library.find((e) => e.kind === "stretch")!;
    p.strength.push({ exercise_id: stretch.id, sets: 3, rep_min: 8, rep_max: 12, rest: 60 });
    expect(validatePlan(p, library, gym).ok).toBe(false);
    const q = good();
    q.strength.push({ ...q.strength[0] });
    expect(validatePlan(q, library, gym).ok).toBe(false);
  });

  it("rejects out-of-range numbers", () => {
    const p = good();
    p.strength[0] = { ...p.strength[0], sets: 40 };
    expect(validatePlan(p, library, gym).ok).toBe(false);
  });
});
