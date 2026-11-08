import { addDays } from "./dates";
import { weekStart } from "./streak";
import type { DayType } from "./planner";

export interface LogRow {
  log_date: string;
  status?: string | null;
  finished_at?: string | null;
  plan?: { day?: DayType } | null;
}
export interface SetRow {
  exercise_id: string;
  log_date: string;
}

const daysBetween = (from: string, to: string) => Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);

/** Day types trained, most recent first (planned sessions only; routine and empty workouts have no day type). */
export function recentDayTypes(logs: LogRow[], today: string) {
  return logs
    .filter((l) => l.plan?.day && l.log_date <= today)
    .sort((a, b) => b.log_date.localeCompare(a.log_date))
    .map((l) => ({ day: l.plan!.day as DayType, daysAgo: daysBetween(l.log_date, today) }));
}

/** Each exercise once, with how many days ago it was last trained. */
export function recentExercises(sets: SetRow[], today: string) {
  const latest = new Map<string, string>();
  for (const s of sets) if (!latest.has(s.exercise_id) || s.log_date > latest.get(s.exercise_id)!) latest.set(s.exercise_id, s.log_date);
  return [...latest].map(([exerciseId, date]) => ({ exerciseId, daysAgo: daysBetween(date, today) })).sort((a, b) => a.daysAgo - b.daysAgo);
}

/** Distinct days with a counted workout this week, matching how the streak counts. */
export function workoutsThisWeek(logs: LogRow[], today: string) {
  const start = weekStart(today);
  return new Set(logs.filter((l) => l.log_date >= start && l.log_date <= today && (l.status ?? "counted") === "counted").map((l) => l.log_date)).size;
}

/** Days left in the week including today. */
export const daysLeftInWeek = (today: string) => 7 - daysBetween(weekStart(today), today);

/** Partners who still need workouts to keep the shared streak, given the days left. */
export function streakRisk(people: { label: string; done: number; target: number }[], today: string) {
  const left = daysLeftInWeek(today);
  return people
    .map((p) => ({ ...p, needed: Math.max(0, p.target - p.done) }))
    .filter((p) => p.needed > 0 && p.needed >= left - 1)
    .map((p) => ({ ...p, left, lastChance: p.needed >= left }));
}

export const isIsoDate = (s: unknown): s is string => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
export const windowStart = (today: string) => addDays(today, -28);
