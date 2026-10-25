"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { sortSaved } from "@/lib/meals";
import type { SavedMeal } from "@/lib/types";

/** The household's active saved meals, kept live with Realtime. */
export function useSavedMeals(householdId: string) {
  const supabase = useMemo(() => createClient(), []);
  const [saved, setSaved] = useState<SavedMeal[]>([]);

  const refresh = useCallback(async () => {
    const { data } = await supabase.from("saved_meals").select("*").eq("household_id", householdId).eq("archived", false);
    if (data) setSaved(sortSaved(data.map((r) => ({ ...r, protein_g: Number(r.protein_g) })) as SavedMeal[]));
  }, [supabase, householdId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
    const channel = supabase
      .channel(`saved-meals:${householdId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "saved_meals", filter: `household_id=eq.${householdId}` }, () => void refresh())
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, householdId, refresh]);

  return { saved, refresh };
}
