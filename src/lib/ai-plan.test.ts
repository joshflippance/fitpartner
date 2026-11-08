import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { buildPrompt, decodeAndValidate, type AdjustInput } from "./ai-plan";
import { buildPlan } from "./planner";
import { daysLeftInWeek, recentDayTypes, recentExercises, streakRisk, workoutsThisWeek } from "./plan-context";
import type { Exercise } from "./types";

const library: Exercise[] = [
  { id: "11111111-aaaa", household_id: null, name: "Goblet Squat", muscle_group: "quads", equipment: ["dumbbells"], created_by: null, archived: false, kind: "strength" },
  { id: "22222222-bbbb", household_id: null, name: "Push-up", muscle_group: "chest", equipment: [], created_by: null, archived: false, kind: "strength" },
  { id: "33333333-cccc", household_id: null, name: "Dumbbell Curl", muscle_group: "biceps", equipment: ["dumbbells"], created_by: null, archived: false, kind: "strength" },
  { id: "44444444-dddd", household_id: null, name: "Back Squat", muscle_group: "quads", equipment: ["barbell"], created_by: null, archived: false, kind: "strength" },
  { id: "55555555-eeee", household_id: null, name: "Jumping Jacks", muscle_group: "full_body", equipment: [], created_by: null, archived: false, kind: "cardio" },
  { id: "66666666-ffff", household_id: null, name: "Child's Pose", muscle_group: "back", equipment: [], created_by: null, archived: false, kind: "stretch" },
];
const location = { equipment: ["dumbbells"] };

const input = (): AdjustInput => ({
  mode: "adjust",
  request: "Only 25 minutes today",
  plan: buildPlan({ day: "full", minutes: 45, library, location }),
  library,
  location,
  people: [{ label: "You", minutes: 45, split: "full_body", recentDays: [{ day: "full", daysAgo: 2 }], recentExercises: [{ exerciseId: "11111111-aaaa", daysAgo: 2 }], workoutsThisWeek: 1, weeklyTarget: 3 }],
  daysLeftInWeek: 4,
});

describe("AI prompt privacy", () => {
  it("sends codes, not database ids, and leaves out unavailable equipment", () => {
    const { text } = buildPrompt(input());
    expect(text).not.toMatch(/11111111|22222222|aaaa/);
    expect(text).toContain("Goblet Squat");
    expect(text).not.toContain("Back Squat");
  });

  it("has no names, emails or weights", () => {
    const { text } = buildPrompt(input());
    expect(text).not.toMatch(/@|kg|lb\b|Josh|April/i);
    expect(text).toContain("You:");
  });
});

describe("decoding the AI answer", () => {
  it("maps codes back to ids and validates", () => {
    const i = input();
    const { toId } = buildPrompt(i);
    const code = [...toId].find(([, id]) => id === "11111111-aaaa")![0];
    const r = decodeAndValidate({ day: "full", minutes: 25, note: "Shorter.", warmup: [], strength: [{ code, sets: 3, rep_min: 8, rep_max: 12, rest: 60 }], cardio: [], stretch: [] }, toId, i);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.plan.strength[0].exercise_id).toBe("11111111-aaaa");
  });

  it("rejects unknown codes", () => {
    const i = input();
    const { toId } = buildPrompt(i);
    const r = decodeAndValidate({ day: "full", minutes: 25, note: "", warmup: [], strength: [{ code: "x99", sets: 3, rep_min: 8, rep_max: 12, rest: 60 }], cardio: [], stretch: [] }, toId, i);
    expect(r.ok).toBe(false);
  });
});

describe("plan context", () => {
  const today = "2026-11-12"; // Thursday
  it("lists day types and exercises by recency", () => {
    expect(recentDayTypes([{ log_date: "2026-11-10", plan: { day: "push" } }, { log_date: "2026-11-11", plan: { day: "pull" } }, { log_date: "2026-11-09" }], today)).toEqual([
      { day: "pull", daysAgo: 1 },
      { day: "push", daysAgo: 2 },
    ]);
    expect(recentExercises([{ exercise_id: "a", log_date: "2026-11-01" }, { exercise_id: "a", log_date: "2026-11-10" }], today)).toEqual([{ exerciseId: "a", daysAgo: 2 }]);
  });

  it("counts distinct counted workout days this week", () => {
    expect(workoutsThisWeek([{ log_date: "2026-11-09" }, { log_date: "2026-11-09" }, { log_date: "2026-11-10", status: "pending" }, { log_date: "2026-11-06" }], today)).toBe(1);
  });

  it("flags a partner who is about to miss the weekly target", () => {
    expect(daysLeftInWeek(today)).toBe(4);
    const risk = streakRisk([{ label: "April", done: 0, target: 3 }, { label: "You", done: 3, target: 3 }], today);
    expect(risk.map((r) => r.label)).toEqual(["April"]);
    expect(streakRisk([{ label: "April", done: 2, target: 3 }], today)).toEqual([]);
  });
});
