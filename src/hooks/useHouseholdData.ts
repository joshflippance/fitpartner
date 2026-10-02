"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { addDays, toLocalDate } from "@/lib/dates";
import type { MealLog, Profile, WeightLog, WorkoutLog } from "@/lib/types";

const STREAK_LOOKBACK_DAYS = 365;
const WEIGHT_LOOKBACK_DAYS = 60;
const REALTIME_TABLES = ["profiles", "meal_logs", "weight_logs", "workout_logs"] as const;

export interface HouseholdData {
  profiles: Profile[];
  meals: MealLog[]; // today only
  weights: WeightLog[]; // recent
  workouts: WorkoutLog[]; // recent, for streak
  loading: boolean;
  error: string | null;
  live: boolean; // realtime channel connected
  refresh: () => Promise<void>;
}

export function useHouseholdData(householdId: string): HouseholdData {
  const supabase = useMemo(() => createClient(), []);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [weights, setWeights] = useState<WeightLog[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(async () => {
    const today = toLocalDate();
    const [p, m, w, wo] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, display_name, household_id, calorie_target, protein_target, weight_unit, weekly_workout_target")
        .eq("household_id", householdId)
        .order("created_at"),
      supabase.from("meal_logs").select("*").eq("household_id", householdId).eq("log_date", today).order("created_at"),
      supabase
        .from("weight_logs")
        .select("*")
        .eq("household_id", householdId)
        .gte("log_date", addDays(today, -WEIGHT_LOOKBACK_DAYS))
        .order("log_date", { ascending: false }),
      supabase
        .from("workout_logs")
        .select("*")
        .eq("household_id", householdId)
        .gte("log_date", addDays(today, -STREAK_LOOKBACK_DAYS))
        .order("log_date", { ascending: false }),
    ]);

    const firstError = [p, m, w, wo].find((r) => r.error)?.error;
    setError(firstError ? firstError.message : null);
    if (p.data) setProfiles(p.data as Profile[]);
    if (m.data) setMeals(m.data.map((r) => ({ ...r, protein_g: Number(r.protein_g) })) as MealLog[]);
    if (w.data) setWeights(w.data.map((r) => ({ ...r, weight_kg: Number(r.weight_kg) })) as WeightLog[]);
    if (wo.data) setWorkouts(wo.data as WorkoutLog[]);
    setLoading(false);
  }, [supabase, householdId]);

  useEffect(() => {
    // Initial load; state updates happen after the awaits resolve.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();

    // Any change in the household triggers a short debounced refetch.
    // Refetching (vs. patching state) keeps sums and the streak correct for inserts, edits and deletes.
    const scheduleRefresh = () => {
      if (debounce.current) clearTimeout(debounce.current);
      debounce.current = setTimeout(() => void refresh(), 150);
    };

    let channel = supabase.channel(`household:${householdId}`);
    for (const table of REALTIME_TABLES) {
      channel = channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table, filter: `household_id=eq.${householdId}` },
        scheduleRefresh,
      );
    }
    channel.subscribe((status) => setLive(status === "SUBSCRIBED"));

    // Catch up after the phone wakes or the PWA returns to the foreground.
    const onVisible = () => document.visibilityState === "visible" && scheduleRefresh();
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      if (debounce.current) clearTimeout(debounce.current);
      void supabase.removeChannel(channel);
    };
  }, [supabase, householdId, refresh]);

  return { profiles, meals, weights, workouts, loading, error, live, refresh };
}
