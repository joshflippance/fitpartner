"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Exercise, Location, Profile, Routine, RoutineExercise, TrainingProgram, WorkoutBlock, WorkoutLog, WorkoutSet } from "./types";
import { addDays, toLocalDate } from "./dates";
import { weekStart } from "./streak";
import type { Plan } from "./planner";

const num = <T extends { weight_kg: number | string }>(r: T) => ({ ...r, weight_kg: Number(r.weight_kg) });

export async function loadProfile(sb: SupabaseClient, userId: string) {
  const { data } = await sb
    .from("profiles")
    .select("id, display_name, household_id, calorie_target, protein_target, weight_unit, weekly_workout_target, share_weight, share_meals")
    .eq("id", userId)
    .single();
  return data as Profile | null;
}

export async function loadLibrary(sb: SupabaseClient) {
  const { data, error } = await sb.from("exercises").select("*").order("name");
  if (error) throw error;
  return (data ?? []) as Exercise[];
}

export async function loadLocations(sb: SupabaseClient, householdId: string) {
  const { data, error } = await sb.from("locations").select("*").eq("household_id", householdId).order("name");
  if (error) throw error;
  return (data ?? []) as Location[];
}

export async function loadRoutines(sb: SupabaseClient, householdId: string) {
  const [r, re] = await Promise.all([
    sb.from("routines").select("*").eq("household_id", householdId).order("updated_at", { ascending: false }),
    sb.from("routine_exercises").select("*").order("position"),
  ]);
  if (r.error) throw r.error;
  if (re.error) throw re.error;
  return { routines: (r.data ?? []) as Routine[], items: (re.data ?? []) as RoutineExercise[] };
}

export async function loadOpenWorkout(sb: SupabaseClient, userId: string) {
  const { data } = await sb
    .from("workout_logs")
    .select("*")
    .eq("user_id", userId)
    .not("started_at", "is", null)
    .is("finished_at", null)
    .order("started_at", { ascending: false })
    .limit(1);
  return (data?.[0] ?? null) as WorkoutLog | null;
}

/** My most recent previous session for each exercise, excluding the current workout. */
export async function loadLastSessions(sb: SupabaseClient, userId: string, exerciseIds: string[], excludeWorkout?: string) {
  const result = new Map<string, WorkoutSet[]>();
  if (exerciseIds.length === 0) return result;
  let q = sb
    .from("workout_sets")
    .select("*")
    .eq("user_id", userId)
    .in("exercise_id", exerciseIds)
    .order("created_at", { ascending: false })
    .limit(600);
  if (excludeWorkout) q = q.neq("workout_id", excludeWorkout);
  const { data } = await q;
  for (const row of (data ?? []).map(num) as WorkoutSet[]) {
    const existing = result.get(row.exercise_id);
    if (!existing) result.set(row.exercise_id, [row]);
    else if (existing[0].workout_id === row.workout_id) existing.push(row);
  }
  for (const list of result.values()) list.sort((a, b) => a.set_number - b.set_number);
  return result;
}

export async function startWorkout(
  sb: SupabaseClient,
  userId: string,
  householdId: string,
  opts: { name: string; routineId: string | null; locationId: string | null; plan?: Plan | null },
) {
  const { data, error } = await sb
    .from("workout_logs")
    .insert({
      user_id: userId,
      household_id: householdId,
      log_date: toLocalDate(),
      name: opts.name,
      routine_id: opts.routineId,
      location_id: opts.locationId,
      plan: opts.plan ?? null,
      started_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data as WorkoutLog;
}

export const normalizeSet = num;

export const DEFAULT_PROGRAM: Omit<TrainingProgram, "user_id" | "household_id" | "updated_at"> = {
  split: "full_body",
  days_per_week: 3,
  minutes: 45,
  cardio_minutes: 0,
  warmup: true,
  stretch: true,
  ai_enabled: false,
};

/** Both partners' programs, keyed by user id. Missing means the defaults. */
export async function loadPrograms(sb: SupabaseClient, householdId: string) {
  const { data } = await sb.from("training_programs").select("*").eq("household_id", householdId);
  return new Map(((data ?? []) as TrainingProgram[]).map((p) => [p.user_id, p]));
}

export async function saveProgram(sb: SupabaseClient, userId: string, householdId: string, values: Partial<TrainingProgram>) {
  const { error } = await sb.from("training_programs").upsert({ ...values, user_id: userId, household_id: householdId }, { onConflict: "user_id" });
  if (error) throw error;
}

/** What the planner needs: my recent planned days, when I last did each exercise, and this week's workouts for both of us. */
export async function loadPlanningContext(sb: SupabaseClient, userId: string, householdId: string) {
  const today = toLocalDate();
  const since = addDays(today, -60);
  const [logs, sets, week] = await Promise.all([
    sb.from("workout_logs").select("log_date, plan, status, finished_at").eq("user_id", userId).gte("log_date", since).order("log_date", { ascending: false }),
    sb.from("workout_sets").select("exercise_id, created_at").eq("user_id", userId).gte("created_at", `${since}T00:00:00Z`).order("created_at", { ascending: false }).limit(1000),
    sb.from("workout_logs").select("user_id, log_date, status").eq("household_id", householdId).gte("log_date", weekStart(today)).lte("log_date", today),
  ]);
  const lastTrained = new Map<string, string>();
  for (const s of sets.data ?? []) if (!lastTrained.has(s.exercise_id)) lastTrained.set(s.exercise_id, s.created_at);
  return {
    today,
    logs: (logs.data ?? []) as { log_date: string; plan: Plan | null; status: string; finished_at: string | null }[],
    lastTrained,
    week: (week.data ?? []) as { user_id: string; log_date: string; status: string }[],
  };
}

/** The partner's joint session in progress today, if any, so the other partner can join it. */
export async function loadPartnerJoint(sb: SupabaseClient, partnerId: string) {
  const { data } = await sb
    .from("workout_logs")
    .select("*")
    .eq("user_id", partnerId)
    .eq("log_date", toLocalDate())
    .is("finished_at", null)
    .not("started_at", "is", null)
    .order("started_at", { ascending: false })
    .limit(1);
  const w = (data?.[0] ?? null) as WorkoutLog | null;
  return w?.plan?.joint ? w : null;
}

export async function loadBlocks(sb: SupabaseClient, workoutId: string) {
  const { data } = await sb.from("workout_blocks").select("*").eq("workout_id", workoutId);
  return (data ?? []) as WorkoutBlock[];
}
