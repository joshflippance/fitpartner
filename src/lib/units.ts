import type { WeightUnit } from "./types";

const LB_PER_KG = 2.20462;

export const toKg = (value: number, unit: WeightUnit) => (unit === "kg" ? value : value / LB_PER_KG);
export const fromKg = (kg: number, unit: WeightUnit) => (unit === "kg" ? kg : kg * LB_PER_KG);
export const formatWeight = (kg: number, unit: WeightUnit) => `${fromKg(kg, unit).toFixed(1)} ${unit}`;
