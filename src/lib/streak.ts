import { addDays, toLocalDate } from "./dates";
import type { WorkoutLog } from "./types";

/**
 * Shared streak rule. Pick one:
 *  - "together": a day counts only when BOTH partners logged a workout.
 *  - "either":   a day counts when EITHER partner logged a workout.
 */
export const STREAK_MODE: "together" | "either" = "either";

/**
 * Consecutive qualifying days ending today. If today doesn't qualify yet,
 * the streak still counts through yesterday so it doesn't reset at midnight.
 */
export function sharedWorkoutStreak(
  workouts: Pick<WorkoutLog, "user_id" | "log_date">[],
  memberIds: string[],
  today: string = toLocalDate(),
): number {
  const byDay = new Map<string, Set<string>>();
  for (const w of workouts) {
    if (!byDay.has(w.log_date)) byDay.set(w.log_date, new Set());
    byDay.get(w.log_date)!.add(w.user_id);
  }

  const qualifies = (day: string) => {
    const users = byDay.get(day);
    if (!users) return false;
    return STREAK_MODE === "either" ? users.size > 0 : memberIds.every((id) => users.has(id));
  };

  let day = qualifies(today) ? today : addDays(today, -1);
  let streak = 0;
  while (qualifies(day)) {
    streak += 1;
    day = addDays(day, -1);
  }
  return streak;
}
