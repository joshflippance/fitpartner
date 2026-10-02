import { describe, expect, it } from "vitest";
import { weekStart, weeklyWorkoutStreak } from "./streak";

const members = [
  { id: "josh", weekly_workout_target: 3 },
  { id: "april", weekly_workout_target: 2 },
];
const logs = (user: string, ...days: string[]) => days.map((log_date) => ({ user_id: user, log_date }));

// 2026-10-02 is a Friday; its week starts Monday 2026-09-28.
const TODAY = "2026-10-02";

describe("weekStart", () => {
  it("returns Monday for any day in the week", () => {
    expect(weekStart("2026-09-28")).toBe("2026-09-28");
    expect(weekStart("2026-10-02")).toBe("2026-09-28");
    expect(weekStart("2026-10-04")).toBe("2026-09-28"); // Sunday
  });

  it("crosses month and year boundaries", () => {
    expect(weekStart("2026-03-01")).toBe("2026-02-23");
    expect(weekStart("2027-01-01")).toBe("2026-12-28");
  });
});

describe("weeklyWorkoutStreak", () => {
  const twoGoodWeeks = [
    ...logs("josh", "2026-09-14", "2026-09-16", "2026-09-18", "2026-09-21", "2026-09-23", "2026-09-25"),
    ...logs("april", "2026-09-15", "2026-09-17", "2026-09-22", "2026-09-24"),
  ];

  it("counts consecutive complete weeks through last week while this week is in progress", () => {
    const r = weeklyWorkoutStreak(twoGoodWeeks, members, TODAY);
    expect(r.streak).toBe(2);
    expect(r.thisWeekDone).toBe(false);
  });

  it("adds the current week once both partners hit their targets", () => {
    const done = [...twoGoodWeeks, ...logs("josh", "2026-09-28", "2026-09-30", "2026-10-02"), ...logs("april", "2026-09-29", "2026-10-01")];
    const r = weeklyWorkoutStreak(done, members, TODAY);
    expect(r.streak).toBe(3);
    expect(r.thisWeekDone).toBe(true);
    expect(r.thisWeek).toEqual({ josh: 3, april: 2 });
  });

  it("counts distinct days, not entries", () => {
    const doubled = [...logs("josh", "2026-09-28", "2026-09-28", "2026-09-28"), ...logs("april", "2026-09-29", "2026-09-30")];
    const r = weeklyWorkoutStreak(doubled, members, TODAY);
    expect(r.thisWeek.josh).toBe(1);
    expect(r.thisWeekDone).toBe(false);
  });

  it("breaks the streak when one partner misses a week", () => {
    const missed = [...twoGoodWeeks.filter((l) => !(l.user_id === "april" && l.log_date >= "2026-09-21"))];
    expect(weeklyWorkoutStreak(missed, members, TODAY).streak).toBe(0);
  });

  it("works for a single member before the partner joins", () => {
    const solo = logs("josh", "2026-09-21", "2026-09-23", "2026-09-25");
    expect(weeklyWorkoutStreak(solo, [members[0]], TODAY).streak).toBe(1);
  });

  it("returns zero with no members", () => {
    expect(weeklyWorkoutStreak([], [], TODAY).streak).toBe(0);
  });
});
