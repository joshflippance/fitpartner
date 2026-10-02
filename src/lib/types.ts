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
  created_at: string;
}
