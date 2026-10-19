"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Exercise, Location, Profile, Routine, RoutineExercise, WorkoutLog, WorkoutSet } from "./types";
import { toLocalDate } from "./dates";

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
  opts: { name: string; routineId: string | null; locationId: string | null },
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
      started_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data as WorkoutLog;
}

export const normalizeSet = num;
