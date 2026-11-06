import { describe, expect, it } from "vitest";
import guides from "./exercise-guides.json";
import { guideFor, howToVideoUrl } from "./exercise-guides";

describe("exercise guides", () => {
  it("covers all 42 starter exercises with two photos and steps", () => {
    const all = Object.values(guides);
    expect(all).toHaveLength(42);
    for (const g of all) {
      expect(g.images).toHaveLength(2);
      expect(g.steps.length).toBeGreaterThan(0);
    }
  });

  it("finds a guide ignoring case and outer spaces", () => {
    expect(guideFor("  barbell BENCH press ")?.slug).toBe("barbell-bench-press");
  });

  it("has no guide for a custom name", () => {
    expect(guideFor("Zercher carry")).toBeUndefined();
  });

  it("builds an encoded YouTube search", () => {
    expect(howToVideoUrl("Push-up")).toBe("https://www.youtube.com/results?search_query=how%20to%20Push-up%20exercise%20form");
  });
});
