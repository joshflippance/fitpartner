import { isAvailable } from "./lifting";
import type { Exercise, ExerciseKind, Location, MuscleGroup, Split, TrainingProgram } from "./types";

/**
 * Rules-based workout planner.
 *
 * Josh's choices (2026-11-06 to 2026-11-08): a default program per person with a per-session override
 * of type and length; warm-up before lifting, held stretches after, optional cardio finisher; weights
 * always come from the progression engine at session time, never from the plan.
 */

export type DayType = "full" | "upper" | "lower" | "push" | "pull" | "legs" | "circuit" | "cardio" | "mobility";
export type SessionMinutes = 30 | 45 | 60 | 75;

export interface PlanStrengthItem {
  exercise_id: string;
  sets: number;
  rep_min: number;
  rep_max: number;
  rest: number;
  reason?: string;
}

export interface PlanTimedItem {
  exercise_id: string;
  seconds: number;
  reason?: string;
}

export interface Plan {
  version: 1;
  day: DayType;
  minutes: number;
  source: "rules" | "ai";
  /** Circuit: do one set of each exercise in turn, rest `round_rest` seconds, repeat `rounds` times. */
  circuit?: { rounds: number; round_rest: number };
  warmup: PlanTimedItem[];
  strength: PlanStrengthItem[];
  cardio: PlanTimedItem[];
  stretch: PlanTimedItem[];
  /** Plain-language summary, mostly from the AI layer. */
  note?: string;
  /** Set when the plan was made for both partners; each person still logs their own session. */
  joint?: boolean;
}

export const SPLITS: { id: Split; label: string; days: DayType[]; hint: string }[] = [
  { id: "full_body", label: "Full body", days: ["full"], hint: "2 to 3 days a week" },
  { id: "upper_lower", label: "Upper / Lower", days: ["upper", "lower"], hint: "4 days a week" },
  { id: "ppl", label: "Push / Pull / Legs", days: ["push", "pull", "legs"], hint: "3 or 6 days a week" },
  { id: "ppl_ul", label: "Push / Pull / Legs + Upper / Lower", days: ["push", "pull", "legs", "upper", "lower"], hint: "5 days a week" },
  { id: "circuit", label: "Circuit", days: ["circuit"], hint: "Fast pace, short rests" },
];

export const DAY_LABEL: Record<DayType, string> = {
  full: "Full body",
  upper: "Upper",
  lower: "Lower",
  push: "Push",
  pull: "Pull",
  legs: "Legs",
  circuit: "Circuit",
  cardio: "Cardio",
  mobility: "Mobility",
};

export const SESSION_MINUTES: SessionMinutes[] = [30, 45, 60, 75];

/** Muscle slots per day, biggest lifts first. Slots repeat from the top when a long session needs more. */
const SLOTS: Record<Exclude<DayType, "cardio" | "mobility">, MuscleGroup[]> = {
  push: ["chest", "shoulders", "chest", "triceps", "shoulders", "triceps"],
  pull: ["back", "back", "biceps", "shoulders", "back", "biceps"],
  legs: ["quads", "hamstrings", "glutes", "quads", "calves", "core"],
  upper: ["chest", "back", "shoulders", "back", "chest", "biceps", "triceps"],
  lower: ["quads", "hamstrings", "glutes", "quads", "calves", "core"],
  full: ["quads", "chest", "back", "hamstrings", "shoulders", "core", "glutes", "biceps"],
  circuit: ["quads", "chest", "back", "glutes", "shoulders", "core", "hamstrings", "triceps"],
};

/** Preferred starter exercises in order: compound lifts first within each muscle. Custom exercises follow. */
const PRIORITY = [
  "Barbell Bench Press", "Dumbbell Bench Press", "Incline Dumbbell Press", "Push-up", "Chest Press Machine", "Cable Fly",
  "Pull-up", "Barbell Row", "Lat Pulldown", "One-arm Dumbbell Row", "Seated Cable Row", "Deadlift",
  "Overhead Press", "Dumbbell Shoulder Press", "Lateral Raise", "Face Pull",
  "Barbell Curl", "Dumbbell Curl", "Hammer Curl", "Cable Curl",
  "Close-grip Bench Press", "Dip", "Triceps Pushdown", "Overhead Triceps Extension",
  "Back Squat", "Goblet Squat", "Leg Press", "Bulgarian Split Squat", "Walking Lunge", "Leg Extension",
  "Romanian Deadlift", "Dumbbell Romanian Deadlift", "Leg Curl",
  "Hip Thrust", "Glute Bridge", "Cable Kickback",
  "Standing Calf Raise", "Seated Calf Raise",
  "Hanging Leg Raise", "Plank", "Cable Crunch",
  "Kettlebell Swing",
];
const CARDIO_PRIORITY = ["Treadmill", "Stationary Bike", "Rowing Machine", "Elliptical", "Jump Rope", "Jumping Jacks", "Brisk Walk or Jog"];
const WARMUP_BY_FOCUS: Record<"upper" | "lower" | "full", string[]> = {
  upper: ["Arm Circles", "Band Pull-Apart", "Cat-Cow", "World's Greatest Stretch", "Inchworm"],
  lower: ["Leg Swings", "Hip Circles", "Bodyweight Squat", "World's Greatest Stretch", "Cat-Cow"],
  full: ["World's Greatest Stretch", "Inchworm", "Leg Swings", "Arm Circles", "Bodyweight Squat"],
};
const FOCUS: Record<DayType, "upper" | "lower" | "full"> = {
  push: "upper", pull: "upper", upper: "upper", legs: "lower", lower: "lower",
  full: "full", circuit: "full", cardio: "full", mobility: "full",
};
/** Where a worked muscle shows up first in the stretch list. */
const STRETCH_FOR: Partial<Record<MuscleGroup, string[]>> = {
  chest: ["Chest Doorway Stretch"],
  shoulders: ["Cross-body Shoulder Stretch"],
  triceps: ["Overhead Triceps Stretch"],
  biceps: ["Biceps Wall Stretch"],
  back: ["Lat Stretch", "Child's Pose"],
  quads: ["Kneeling Hip Flexor Stretch", "Standing Quad Stretch"],
  hamstrings: ["Seated Hamstring Stretch"],
  glutes: ["Figure-4 Glute Stretch"],
  calves: ["Wall Calf Stretch"],
  core: ["Cobra Stretch"],
  full_body: ["Child's Pose"],
};

const WORK_SECONDS = 45; // average time under load per set, used for sizing only
const TRANSITION_SECONDS = 60; // moving between exercises

export const kindOf = (e: Pick<Exercise, "kind">): ExerciseKind => e.kind ?? "strength";

/** The next day in a split's rotation, given the days done most recently first. */
export function nextDay(split: Split, recentDays: DayType[]): DayType {
  const days = SPLITS.find((s) => s.id === split)!.days;
  const last = recentDays.find((d) => days.includes(d));
  if (!last) return days[0];
  return days[(days.indexOf(last) + 1) % days.length];
}

export interface PlanInput {
  day: DayType;
  minutes: number;
  library: Exercise[];
  location: Pick<Location, "equipment"> | null;
  /** Exercise id to the time it was last trained; used exercises are preferred so progression continues. */
  lastTrained?: Map<string, string>;
  program?: Pick<TrainingProgram, "cardio_minutes" | "warmup" | "stretch">;
}

const DEFAULT_PROGRAM = { cardio_minutes: 0, warmup: true, stretch: true } as const;

/** Build a session that fits the time, the location's equipment and the day type. */
export function buildPlan(input: PlanInput): Plan {
  const { day, minutes, location } = input;
  const program = input.program ?? DEFAULT_PROGRAM;
  const lastTrained = input.lastTrained ?? new Map<string, string>();
  const usable = input.library.filter((e) => !e.archived && isAvailable(e, location));
  const byName = new Map(usable.map((e) => [e.name.toLowerCase(), e]));
  const pick = (names: string[]) => names.map((n) => byName.get(n.toLowerCase())).filter((e): e is Exercise => Boolean(e));
  const ofKind = (k: ExerciseKind) => usable.filter((e) => kindOf(e) === k);
  const total = minutes * 60;
  const short = minutes <= 30;

  const cardioChoice = (): Exercise | undefined => pick(CARDIO_PRIORITY)[0] ?? ofKind("cardio")[0];

  // Warm-up: a few minutes of easy cardio, then dynamic moves for the day's focus.
  const warmup: PlanTimedItem[] = [];
  if (program.warmup || day === "mobility") {
    const c = day === "mobility" ? undefined : cardioChoice();
    if (c && day !== "cardio") warmup.push({ exercise_id: c.id, seconds: short ? 120 : 180, reason: "Easy pace to raise your heart rate" });
    const dynamic = [...pick(WARMUP_BY_FOCUS[FOCUS[day]]), ...ofKind("warmup")];
    const count = day === "mobility" ? 6 : short ? 2 : 3;
    for (const e of unique(dynamic).slice(0, count)) warmup.push({ exercise_id: e.id, seconds: day === "mobility" ? 60 : 45 });
  }

  if (day === "cardio" || day === "mobility") {
    const stretch = stretchesFor(["full_body", "quads", "hamstrings", "back", "chest", "glutes", "calves", "shoulders"], day === "mobility" ? 8 : short ? 3 : 4, pick, ofKind, 60);
    const used = sum(warmup) + sum(stretch);
    const cardio: PlanTimedItem[] = [];
    if (day === "cardio") {
      const c = cardioChoice();
      if (c) cardio.push({ exercise_id: c.id, seconds: Math.max(600, total - used), reason: "Steady pace you could hold a conversation at" });
    }
    return { version: 1, day, minutes, source: "rules", warmup, strength: [], cardio, stretch };
  }

  // Held stretches at the end, for the muscles worked. Sized now, filled after choosing exercises.
  const stretchCount = program.stretch ? (short ? 3 : minutes >= 60 ? 5 : 4) : 0;
  const stretchBudget = stretchCount * 45;
  let cardioSeconds = program.cardio_minutes * 60;
  let strengthBudget = total - sum(warmup) - stretchBudget - cardioSeconds;
  let note: string | undefined;
  if (cardioSeconds > 0 && strengthBudget < 15 * 60) {
    strengthBudget += cardioSeconds;
    cardioSeconds = 0;
    note = "Cardio finisher skipped to leave time for lifting.";
  }

  const isCircuit = day === "circuit";
  const slots = SLOTS[day];
  let strength: PlanStrengthItem[] = [];
  let circuit: Plan["circuit"];

  if (isCircuit) {
    const rounds = 3;
    const roundRest = 60;
    const perStation = WORK_SECONDS + 15;
    const stations = clamp(Math.floor((strengthBudget / rounds - roundRest) / perStation), 4, slots.length);
    strength = chooseExercises(slots, stations, ofKind("strength"), lastTrained).map((e) => ({
      exercise_id: e.id, sets: rounds, rep_min: 10, rep_max: 15, rest: 15,
    }));
    circuit = { rounds, round_rest: roundRest };
  } else {
    const rest = short ? 60 : 90;
    const sets = 3;
    const perExercise = sets * (WORK_SECONDS + rest) + TRANSITION_SECONDS;
    const count = clamp(Math.floor(strengthBudget / perExercise), 2, 10);
    const chosen = chooseExercises(slots, count, ofKind("strength"), lastTrained);
    strength = chosen.map((e, i) => {
      const small = e.muscle_group === "calves" || e.muscle_group === "core";
      return {
        exercise_id: e.id,
        sets,
        rep_min: i === 0 && !small ? 6 : small ? 12 : 8,
        rep_max: i === 0 && !small ? 10 : small ? 15 : 12,
        rest: i === 0 && !short ? 120 : rest,
      };
    });
  }

  const cardio: PlanTimedItem[] = [];
  if (cardioSeconds > 0) {
    const c = cardioChoice();
    if (c) cardio.push({ exercise_id: c.id, seconds: cardioSeconds, reason: "After lifting, so your strength work comes first" });
  }

  const worked = strength.map((s) => usable.find((e) => e.id === s.exercise_id)!.muscle_group);
  const stretch = stretchesFor(worked, stretchCount, pick, ofKind, 45);

  return { version: 1, day, minutes, source: "rules", circuit, warmup, strength, cardio, stretch, note };
}

function chooseExercises(slots: MuscleGroup[], count: number, pool: Exercise[], lastTrained: Map<string, string>): Exercise[] {
  const rank = (e: Exercise) => {
    const p = PRIORITY.indexOf(e.name);
    const trained = lastTrained.has(e.id) ? 0 : 1; // keep doing what you've been doing so progression continues
    return trained * 1000 + (p === -1 ? 500 : p);
  };
  const chosen: Exercise[] = [];
  for (let i = 0; chosen.length < count && i < slots.length * 2; i++) {
    const muscle = slots[i % slots.length];
    const candidate = pool
      .filter((e) => e.muscle_group === muscle && !chosen.includes(e))
      .sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name))[0];
    if (candidate) chosen.push(candidate);
  }
  return chosen;
}

function stretchesFor(
  muscles: MuscleGroup[],
  count: number,
  pick: (names: string[]) => Exercise[],
  ofKind: (k: ExerciseKind) => Exercise[],
  seconds: number,
): PlanTimedItem[] {
  if (count === 0) return [];
  const ordered = unique([...pick(unique(muscles).flatMap((m) => STRETCH_FOR[m] ?? [])), ...ofKind("stretch")]);
  return ordered.slice(0, count).map((e) => ({ exercise_id: e.id, seconds }));
}

/** Rough minutes a plan takes, for the preview. */
export function estimateMinutes(plan: Plan): number {
  const timed = sum(plan.warmup) + sum(plan.cardio) + sum(plan.stretch);
  const strength = plan.circuit
    ? plan.circuit.rounds * (plan.strength.length * (WORK_SECONDS + 15) + plan.circuit.round_rest)
    : plan.strength.reduce((t, s) => t + s.sets * (WORK_SECONDS + s.rest) + TRANSITION_SECONDS, 0);
  return Math.round((timed + strength) / 60);
}

/** Every exercise id a plan uses, in session order. */
export const planExerciseIds = (plan: Plan) => [
  ...plan.warmup.map((i) => i.exercise_id),
  ...plan.strength.map((i) => i.exercise_id),
  ...plan.cardio.map((i) => i.exercise_id),
  ...plan.stretch.map((i) => i.exercise_id),
];

const sum = (items: PlanTimedItem[]) => items.reduce((t, i) => t + i.seconds, 0);
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
function unique<T>(list: T[]): T[] {
  return [...new Set(list)];
}

const DAY_TYPES: DayType[] = ["full", "upper", "lower", "push", "pull", "legs", "circuit", "cardio", "mobility"];

/**
 * Check a plan from outside the rules (the AI layer) against the library and location.
 * Unknown or unavailable exercises, wrong kinds and out-of-range numbers are rejected rather than repaired,
 * so a bad answer never reaches a session. Returns the cleaned plan or the reasons it failed.
 */
export function validatePlan(
  raw: unknown,
  library: Exercise[],
  location: Pick<Location, "equipment"> | null,
): { ok: true; plan: Plan } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  const r = (raw ?? {}) as Record<string, unknown>;
  const byId = new Map(library.filter((e) => !e.archived).map((e) => [e.id, e]));
  const day = DAY_TYPES.includes(r.day as DayType) ? (r.day as DayType) : null;
  if (!day) errors.push("unknown day type");
  const minutes = Number(r.minutes);
  if (!Number.isInteger(minutes) || minutes < 10 || minutes > 120) errors.push("minutes out of range");

  // Duplicates are checked per section: the same bike can warm you up and finish the session.
  const seen = new Map<string, Set<string>>();
  const check = (id: unknown, kinds: ExerciseKind[], where: string): Exercise | null => {
    const e = typeof id === "string" ? byId.get(id) : undefined;
    if (!e) return errors.push(`${where}: unknown exercise`), null;
    if (!kinds.includes(kindOf(e))) return errors.push(`${where}: ${e.name} is the wrong kind`), null;
    if (!isAvailable(e, location)) return errors.push(`${where}: ${e.name} needs equipment that is not here`), null;
    const inSection = seen.get(where) ?? new Set<string>();
    seen.set(where, inSection);
    if (inSection.has(e.id)) return errors.push(`${where}: ${e.name} appears twice`), null;
    inSection.add(e.id);
    return e;
  };
  const int = (v: unknown, lo: number, hi: number, label: string) => {
    const n = Number(v);
    if (!Number.isInteger(n) || n < lo || n > hi) errors.push(`${label} out of range`);
    return n;
  };
  const timed = (list: unknown, kinds: ExerciseKind[], where: string, max: number): PlanTimedItem[] =>
    (Array.isArray(list) ? list : []).slice(0, max).map((i: Record<string, unknown>) => {
      const e = check(i?.exercise_id, kinds, where);
      return { exercise_id: e?.id ?? "", seconds: int(i?.seconds, 15, 3600, `${where} seconds`), ...(typeof i?.reason === "string" ? { reason: i.reason.slice(0, 140) } : {}) };
    });

  const warmup = timed(r.warmup, ["warmup", "cardio"], "warm-up", 8);
  const cardio = timed(r.cardio, ["cardio"], "cardio", 3);
  const stretch = timed(r.stretch, ["stretch"], "stretch", 10);
  const strength: PlanStrengthItem[] = (Array.isArray(r.strength) ? r.strength : []).slice(0, 12).map((i: Record<string, unknown>) => {
    const e = check(i?.exercise_id, ["strength"], "lifting");
    const rep_min = int(i?.rep_min, 1, 50, "rep_min");
    const rep_max = int(i?.rep_max, 1, 50, "rep_max");
    if (rep_max < rep_min) errors.push("rep_max below rep_min");
    return {
      exercise_id: e?.id ?? "",
      sets: int(i?.sets, 1, 10, "sets"),
      rep_min,
      rep_max,
      rest: int(i?.rest, 0, 600, "rest"),
      ...(typeof i?.reason === "string" ? { reason: i.reason.slice(0, 140) } : {}),
    };
  });
  if (day && day !== "cardio" && day !== "mobility" && strength.length === 0) errors.push("no lifting in a lifting session");

  let circuit: Plan["circuit"];
  if (r.circuit && typeof r.circuit === "object") {
    const c = r.circuit as Record<string, unknown>;
    circuit = { rounds: int(c.rounds, 1, 8, "rounds"), round_rest: int(c.round_rest, 0, 300, "round rest") };
  }
  if (errors.length) return { ok: false, errors };
  return {
    ok: true,
    plan: {
      version: 1,
      day: day!,
      minutes,
      source: "ai",
      circuit,
      warmup,
      strength,
      cardio,
      stretch,
      ...(typeof r.note === "string" ? { note: r.note.slice(0, 400) } : {}),
      ...(r.joint === true ? { joint: true } : {}),
    },
  };
}
