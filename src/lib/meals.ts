import type { MealLog } from "./types";

export type MealTemplate = Pick<MealLog, "name" | "calories" | "protein_g">;

const key = (m: MealTemplate) => `${m.name.trim().toLowerCase()}|${m.calories}|${m.protein_g}`;

/** A person's most recent distinct meals (same name, calories and protein count once). */
export function recentMeals(meals: MealLog[], userId: string, limit = 10): MealTemplate[] {
  const mine = meals
    .filter((m) => m.user_id === userId)
    .sort((a, b) => b.log_date.localeCompare(a.log_date) || b.created_at.localeCompare(a.created_at));
  const seen = new Set<string>();
  const out: MealTemplate[] = [];
  for (const m of mine) {
    const k = key(m);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push({ name: m.name, calories: m.calories, protein_g: m.protein_g });
    if (out.length === limit) break;
  }
  return out;
}

/** Scale a meal to a portion. Calories round to whole numbers, protein to 0.1 g. */
export function scaleMeal(meal: MealTemplate, factor: number): MealTemplate {
  const f = Number.isFinite(factor) && factor > 0 ? factor : 1;
  return {
    name: meal.name,
    calories: Math.round(meal.calories * f),
    protein_g: Math.round(meal.protein_g * f * 10) / 10,
  };
}

export const PORTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;
