import { describe, expect, it } from "vitest";
import { increment, roundWeight, suggestNext } from "./progression";
import { isAvailable } from "./lifting";
import { toKg } from "./units";

const t = { sets: 3, repMin: 8, repMax: 12 };
const lb = (w: number) => toKg(w, "lb");
const sets = (weightLb: number, ...reps: number[]) => reps.map((r) => ({ reps: r, weight_kg: lb(weightLb) }));

describe("suggestNext", () => {
  it("asks for a starting weight with no history", () => {
    const s = suggestNext([], t, "chest", "lb");
    expect(s).toMatchObject({ weight: null, reps: 8, kind: "first" });
  });

  it("adds a rep when the range isn't topped out", () => {
    const s = suggestNext(sets(50, 10, 9, 9), t, "chest", "lb");
    expect(s).toMatchObject({ weight: 50, reps: 10, kind: "build" });
  });

  it("never asks for more than the top of the range", () => {
    expect(suggestNext(sets(50, 12, 12, 11), t, "chest", "lb").reps).toBe(12);
  });

  it("adds 5 lb upper body when every set hits the top", () => {
    const s = suggestNext(sets(50, 12, 12, 12), t, "chest", "lb");
    expect(s).toMatchObject({ weight: 55, reps: 8, kind: "increase" });
  });

  it("adds 10 lb lower body", () => {
    expect(suggestNext(sets(135, 12, 12, 12), t, "quads", "lb").weight).toBe(145);
  });

  it("uses kg steps for kg users", () => {
    const kgSets = [12, 12, 12].map((r) => ({ reps: r, weight_kg: 40 }));
    expect(suggestNext(kgSets, t, "back", "kg")).toMatchObject({ weight: 42.5, weightKg: 42.5 });
    expect(suggestNext(kgSets, t, "glutes", "kg").weight).toBe(45);
  });

  it("does not increase when fewer sets than the target were done", () => {
    expect(suggestNext(sets(50, 12, 12), t, "chest", "lb").kind).toBe("build");
  });

  it("only counts sets at the heaviest weight", () => {
    const mixed = [...sets(40, 12), ...sets(50, 12, 12, 12)];
    expect(suggestNext(mixed, t, "chest", "lb").weight).toBe(55);
  });

  it("holds the weight after falling below the range", () => {
    expect(suggestNext(sets(60, 7, 6, 6), t, "chest", "lb")).toMatchObject({ weight: 60, reps: 8, kind: "hold" });
  });

  it("handles bodyweight exercises", () => {
    expect(suggestNext([{ reps: 9, weight_kg: 0 }, { reps: 8, weight_kg: 0 }, { reps: 8, weight_kg: 0 }], t, "chest", "lb"))
      .toMatchObject({ weight: 0, reps: 9, kind: "build" });
    expect(suggestNext([12, 12, 12].map((r) => ({ reps: r, weight_kg: 0 })), t, "chest", "lb").kind).toBe("bodyweight_top");
  });

  it("rounds converted weights to plate-friendly steps", () => {
    // 22.68 kg is 50 lb; stored value round-trips cleanly.
    expect(suggestNext([12, 12, 12].map((r) => ({ reps: r, weight_kg: 22.68 })), t, "chest", "lb").weight).toBe(55);
  });
});

describe("helpers", () => {
  it("increments by body region and unit", () => {
    expect(increment("biceps", "lb")).toBe(5);
    expect(increment("hamstrings", "lb")).toBe(10);
    expect(increment("shoulders", "kg")).toBe(2.5);
    expect(increment("quads", "kg")).toBe(5);
  });

  it("rounds to plate steps", () => {
    expect(roundWeight(52.3, "lb")).toBe(52.5);
    expect(roundWeight(22.6, "kg")).toBe(22.5);
  });

  it("filters exercises by location equipment", () => {
    const home = { equipment: ["dumbbells", "bench"] };
    expect(isAvailable({ equipment: ["dumbbells", "bench"] }, home)).toBe(true);
    expect(isAvailable({ equipment: ["barbell"] }, home)).toBe(false);
    expect(isAvailable({ equipment: [] }, home)).toBe(true);
    expect(isAvailable({ equipment: ["barbell"] }, null)).toBe(true);
  });
});
