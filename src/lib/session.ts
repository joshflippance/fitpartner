import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Household, Profile } from "@/lib/types";

/** Signed-in user plus profile. Redirects to /login when signed out. */
export async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, household_id, calorie_target, protein_target, weight_unit")
    .eq("id", userId)
    .single<Profile>();
  if (!profile) redirect("/login");

  return { supabase, userId, profile };
}

/** Signed-in user who is in a household. Redirects to /pair otherwise. */
export async function requireHousehold() {
  const ctx = await requireUser();
  if (!ctx.profile.household_id) redirect("/pair");

  const { data: household } = await ctx.supabase
    .from("households")
    .select("*")
    .eq("id", ctx.profile.household_id)
    .single<Household>();
  if (!household) redirect("/pair");

  return { ...ctx, household };
}
