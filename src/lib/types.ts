export type WeightUnit = "lb" | "kg";

export interface Household {
  id: string;
  name: string;
  pair_code: string;
  created_by: string;
  created_at: string;
}

export interface Profile {
  id: string;
  display_name: string;
  household_id: string | null;
  calorie_target: number;
  protein_target: number;
  weight_unit: WeightUnit;
  weekly_workout_target: number;
  share_weight: boolean;
  share_meals: boolean;
}

export interface MealLog {
  id: string;
  user_id: string;
  household_id: string;
  log_date: string;
  name: string;
  calories: number;
  protein_g: number;
  created_at: string;
}

export interface WeightLog {
  id: string;
  user_id: string;
  household_id: string;
  log_date: string;
  weight_kg: number;
  created_at: string;
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  household_id: string;
  log_date: string;
  name: string;
  duration_min: number | null;
  notes: string | null;
  routine_id?: string | null;
  location_id?: string | null;
  started_at?: string | null;
  finished_at?: string | null;
  plan?: import("./planner").Plan | null;
  status: WorkoutStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

/** counted: adds to the streak. pending: logged late, waiting on the partner. declined: partner said no. */
export type WorkoutStatus = "counted" | "pending" | "declined";

export interface Nudge {
  id: string;
  household_id: string;
  from_user: string;
  to_user: string;
  created_at: string;
  seen_at: string | null;
}

// ---------------------------------------------------------------------------
// Lifting (FP-15)
// ---------------------------------------------------------------------------

export type MuscleGroup =
  | "chest" | "back" | "shoulders" | "biceps" | "triceps"
  | "quads" | "hamstrings" | "glutes" | "calves" | "core" | "full_body";

export interface Location {
  id: string;
  household_id: string;
  name: string;
  equipment: string[];
  created_by: string | null;
}

export interface Exercise {
  id: string;
  household_id: string | null;
  name: string;
  muscle_group: MuscleGroup;
  equipment: string[];
  created_by: string | null;
  archived: boolean;
  /** strength: sets and reps. cardio, warmup, stretch: timed. Older rows without it are strength. */
  kind?: ExerciseKind;
}

export type ExerciseKind = "strength" | "cardio" | "warmup" | "stretch";

/** A timed item done in a session: warm-up, cardio or stretch. */
export interface WorkoutBlock {
  id: string;
  workout_id: string;
  user_id: string;
  household_id: string;
  exercise_id: string;
  section: "warmup" | "cardio" | "stretch";
  seconds: number;
  created_at: string;
}

export type Split = "full_body" | "upper_lower" | "ppl" | "ppl_ul" | "circuit";

export interface TrainingProgram {
  user_id: string;
  household_id: string;
  split: Split;
  days_per_week: number;
  minutes: 30 | 45 | 60 | 75;
  cardio_minutes: 0 | 10 | 15 | 20;
  warmup: boolean;
  stretch: boolean;
  ai_enabled: boolean;
  updated_at: string;
}

export interface Routine {
  id: string;
  household_id: string;
  owner_id: string;
  name: string;
  notes: string | null;
  copied_from: string | null;
  updated_at: string;
}

export interface RoutineExercise {
  id: string;
  routine_id: string;
  exercise_id: string;
  position: number;
  target_sets: number;
  rep_min: number;
  rep_max: number;
  rest_seconds: number;
}

export interface WorkoutSet {
  id: string;
  workout_id: string;
  user_id: string;
  household_id: string;
  exercise_id: string;
  set_number: number;
  reps: number;
  weight_kg: number;
  created_at: string;
}

export interface SavedMeal {
  id: string;
  household_id: string;
  name: string;
  calories: number;
  protein_g: number;
  created_by: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
}
