import { addDays } from "./dates";

/** Daily smoothing factor. 0.1 is the classic "trend weight" setting: about a 10 day memory. */
export const TREND_ALPHA = 0.1;

export interface TrendPoint {
  date: string;
  weight: number; // raw weigh-in, kg
  trend: number; // smoothed, kg
}

function daysBetween(a: string, b: string) {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000);
}

/**
 * Exponentially smoothed weight trend. Gaps between weigh-ins are handled by
 * compounding the daily factor, so skipping days doesn't over-weight the next entry.
 */
export function weightTrend(entries: { log_date: string; weight_kg: number }[], alpha = TREND_ALPHA): TrendPoint[] {
  const sorted = [...entries].sort((a, b) => a.log_date.localeCompare(b.log_date));
  const out: TrendPoint[] = [];
  for (const e of sorted) {
    const prev = out.at(-1);
    if (!prev) {
      out.push({ date: e.log_date, weight: e.weight_kg, trend: e.weight_kg });
      continue;
    }
    const gap = Math.max(1, daysBetween(prev.date, e.log_date));
    const a = 1 - Math.pow(1 - alpha, gap);
    out.push({ date: e.log_date, weight: e.weight_kg, trend: prev.trend + a * (e.weight_kg - prev.trend) });
  }
  return out;
}

/** Trend change over the window ending at the last point, or null without enough data. */
export function trendChange(points: TrendPoint[], days: number): number | null {
  const last = points.at(-1);
  if (!last) return null;
  const since = addDays(last.date, -days);
  const first = points.find((p) => p.date >= since);
  if (!first || first === last) return null;
  return last.trend - first.trend;
}
