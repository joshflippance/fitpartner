import { describe, expect, it } from "vitest";
import { addDays, toLocalDate } from "./dates";
import { isLoggable, loggableRange } from "./logging";

describe("dates", () => {
  it("formats local dates with zero padding", () => {
    expect(toLocalDate(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("adds days across months, years and leap days", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("survives a DST change", () => {
    expect(addDays("2026-03-07", 2)).toBe("2026-03-09");
    expect(addDays("2026-11-01", -1)).toBe("2026-10-31");
  });
});

describe("loggable window", () => {
  const today = "2026-10-02"; // Friday, week starts 2026-09-28

  it("spans the previous Monday through today", () => {
    expect(loggableRange(today)).toEqual({ min: "2026-09-21", max: "2026-10-02" });
  });

  it("rejects dates outside the window", () => {
    expect(isLoggable("2026-09-21", today)).toBe(true);
    expect(isLoggable("2026-09-20", today)).toBe(false);
    expect(isLoggable("2026-10-03", today)).toBe(false);
  });
});
