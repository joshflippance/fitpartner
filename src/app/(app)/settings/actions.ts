"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, Math.round(n)));

export async function updateProfile(formData: FormData) {
  const { supabase, userId } = await requireUser();
  await supabase
    .from("profiles")
    .update({
      display_name: String(formData.get("display_name") || "Me").slice(0, 40),
      calorie_target: clamp(Number(formData.get("calorie_target")), 800, 8000),
      protein_target: clamp(Number(formData.get("protein_target")), 0, 500),
      weekly_workout_target: clamp(Number(formData.get("weekly_workout_target")) || 3, 1, 7),
      weight_unit: formData.get("weight_unit") === "kg" ? "kg" : "lb",
    })
    .eq("id", userId);
  revalidatePath("/", "layout");
}

export async function leaveHousehold() {
  const { supabase } = await requireUser();
  await supabase.rpc("leave_household");
  redirect("/pair");
}
