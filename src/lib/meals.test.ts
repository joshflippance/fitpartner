import { describe, expect, it } from "vitest";
import { recentMeals, scaleMeal } from "./meals";
import type { MealLog } from "./types";

let n = 0;
const meal = (user: string, date: string, name: string, calories: number, protein_g: number): MealLog => ({
  id: String(++n),
  user_id: user,
  household_id: "h",
  log_date: date,
  name,
  calories,
  protein_g,
  created_at: `${date}T12:00:${String(n).padStart(2, "0")}Z`,
});

describe("recentMeals", () => {
  const meals = [
    meal("josh", "2026-10-10", "Oats", 400, 20),
    meal("josh", "2026-10-11", "oats ", 400, 20),
    meal("josh", "2026-10-12", "Chicken and rice", 650, 55),
    meal("april", "2026-10-12", "Salad", 300, 10),
    meal("josh", "2026-10-09", "Oats", 450, 22),
  ];

  it("returns my meals newest first, deduped by name, calories and protein", () => {
    expect(recentMeals(meals, "josh").map((m) => `${m.name}:${m.calories}`)).toEqual([
      "Chicken and rice:650",
      "oats :400",
      "Oats:450",
    ]);
  });

  it("respects the limit and ignores the partner", () => {
    expect(recentMeals(meals, "josh", 1)).toHaveLength(1);
    expect(recentMeals(meals, "april").map((m) => m.name)).toEqual(["Salad"]);
  });
});

describe("scaleMeal", () => {
  it("scales and rounds", () => {
    expect(scaleMeal({ name: "Pasta", calories: 733, protein_g: 31.3 }, 0.5)).toEqual({ name: "Pasta", calories: 367, protein_g: 15.7 });
    expect(scaleMeal({ name: "Pasta", calories: 700, protein_g: 30 }, 1.5)).toEqual({ name: "Pasta", calories: 1050, protein_g: 45 });
  });

  it("treats bad factors as a full portion", () => {
    expect(scaleMeal({ name: "X", calories: 100, protein_g: 10 }, 0).calories).toBe(100);
    expect(scaleMeal({ name: "X", calories: 100, protein_g: 10 }, NaN).calories).toBe(100);
  });
});
