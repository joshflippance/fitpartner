import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "./types";

export async function loadPartner(supabase: SupabaseClient, householdId: string, userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, household_id, calorie_target, protein_target, weight_unit, weekly_workout_target, share_weight, share_meals")
    .eq("household_id", householdId)
    .neq("id", userId)
    .maybeSingle();
  return (data as Profile | null) ?? null;
}
