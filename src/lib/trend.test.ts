import { describe, expect, it } from "vitest";
import { addDays } from "./dates";
import { trendChange, weightTrend } from "./trend";

describe("weightTrend", () => {
  it("starts at the first weigh-in and sorts by date", () => {
    const t = weightTrend([
      { log_date: "2026-10-02", weight_kg: 81 },
      { log_date: "2026-10-01", weight_kg: 80 },
    ]);
    expect(t[0]).toEqual({ date: "2026-10-01", weight: 80, trend: 80 });
    expect(t[1].trend).toBeCloseTo(80.1, 5);
  });

  it("smooths a one-day spike", () => {
    const t = weightTrend([
      { log_date: "2026-10-01", weight_kg: 80 },
      { log_date: "2026-10-02", weight_kg: 83 },
      { log_date: "2026-10-03", weight_kg: 80 },
    ]);
    expect(t[1].trend).toBeLessThan(80.5);
    expect(t[2].trend).toBeLessThan(80.3);
  });

  it("compounds the factor across gaps", () => {
    const gap = weightTrend([
      { log_date: "2026-10-01", weight_kg: 80 },
      { log_date: "2026-10-11", weight_kg: 78 },
    ]);
    // 10 day gap: 1 - 0.9^10 = 0.651
    expect(gap[1].trend).toBeCloseTo(80 - 2 * (1 - 0.9 ** 10), 5);
  });

  it("returns nothing for no entries", () => {
    expect(weightTrend([])).toEqual([]);
  });
});

describe("trendChange", () => {
  it("measures trend movement over a window", () => {
    const pts = weightTrend(Array.from({ length: 31 }, (_, i) => ({ log_date: addDays("2026-09-01", i), weight_kg: 80 - i * 0.1 })));
    expect(trendChange(pts, 30)).toBeLessThan(0);
    expect(trendChange(pts, 7)).toBeGreaterThan(trendChange(pts, 30)!);
  });

  it("is null with a single point", () => {
    expect(trendChange(weightTrend([{ log_date: "2026-10-01", weight_kg: 80 }]), 30)).toBeNull();
  });
});
