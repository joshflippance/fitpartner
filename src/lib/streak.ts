import { addDays, toLocalDate } from "./dates";
import type { Profile, WorkoutLog } from "./types";

/** Weeks start on Monday. Change to 0 for Sunday. */
export const WEEK_STARTS_ON = 1;

/** Local date (YYYY-MM-DD) of the first day of the week containing `date`. */
export function weekStart(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const day = new Date(y, m - 1, d).getDay();
  return addDays(date, -((day - WEEK_STARTS_ON + 7) % 7));
}

export interface WeeklyStreak {
  /** Consecutive weeks where every member hit their target. */
  streak: number;
  /** Distinct training days this week, per user. */
  thisWeek: Record<string, number>;
  /** True once every member has hit their target this week. */
  thisWeekDone: boolean;
}

/**
 * Shared weekly streak. A week counts when every member trains on at least
 * `weekly_workout_target` distinct days. The current week only adds to the
 * streak once it's complete; until then the streak runs through last week.
 */
export function weeklyWorkoutStreak(
  workouts: Pick<WorkoutLog, "user_id" | "log_date">[],
  members: Pick<Profile, "id" | "weekly_workout_target">[],
  today: string = toLocalDate(),
): WeeklyStreak {
  // week -> user -> distinct days
  const days = new Map<string, Map<string, Set<string>>>();
  for (const w of workouts) {
    const wk = weekStart(w.log_date);
    if (!days.has(wk)) days.set(wk, new Map());
    const byUser = days.get(wk)!;
    if (!byUser.has(w.user_id)) byUser.set(w.user_id, new Set());
    byUser.get(w.user_id)!.add(w.log_date);
  }

  const countFor = (wk: string, userId: string) => days.get(wk)?.get(userId)?.size ?? 0;
  const weekDone = (wk: string) =>
    members.length > 0 && members.every((m) => countFor(wk, m.id) >= m.weekly_workout_target);

  const current = weekStart(today);
  const thisWeek = Object.fromEntries(members.map((m) => [m.id, countFor(current, m.id)]));
  const thisWeekDone = weekDone(current);

  let wk = thisWeekDone ? current : addDays(current, -7);
  let streak = 0;
  while (weekDone(wk)) {
    streak += 1;
    wk = addDays(wk, -7);
  }

  return { streak, thisWeek, thisWeekDone };
}
