import { addDays, toLocalDate } from "./dates";
import { weekStart } from "./streak";

/**
 * Entries can be logged or edited for any day in the current or previous week.
 * Older weeks are locked so a closed streak week can't be rewritten.
 */
export function loggableRange(today: string = toLocalDate()) {
  return { min: addDays(weekStart(today), -7), max: today };
}

export function isLoggable(date: string, today: string = toLocalDate()) {
  const { min, max } = loggableRange(today);
  return date >= min && date <= max;
}

export function dayLabel(date: string, today: string = toLocalDate()) {
  if (date === today) return "Today";
  if (date === addDays(today, -1)) return "Yesterday";
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}
