import "server-only";
import { kindOf, validatePlan, type DayType, type Plan } from "./planner";
import { isAvailable } from "./lifting";
import type { Exercise, Location } from "./types";

/**
 * AI plan adjustments with Claude Sonnet 5.5 (Josh's choice, 2026-11-08).
 *
 * Privacy rules, enforced here:
 *   * Only workout context is sent: the exercise catalogue for the location, session type and length,
 *     the current plan, the person's request, and how many days ago each day type and exercise was trained.
 *   * Never sent: names, emails, user or household ids, body weight, meals, lifted weights, partner data
 *     unless the partner has also opted in.
 *   * Nothing is logged: prompts and replies are not written to the database or the server log.
 * The model can only answer through the submit_plan tool, and the answer is validated against the library.
 */

export const AI_MODEL = "claude-sonnet-5-5";
// Overridable only for local testing against a mock.
const API_URL = `${process.env.ANTHROPIC_BASE_URL ?? "https://api.anthropic.com"}/v1/messages`;

export interface PersonContext {
  /** Who this is in the prompt, never a real name. */
  label: "You" | "Partner";
  minutes: number;
  split: string;
  /** Day types trained recently, with days ago. */
  recentDays: { day: DayType; daysAgo: number }[];
  /** Strength exercise ids trained recently, with days ago. */
  recentExercises: { exerciseId: string; daysAgo: number }[];
  workoutsThisWeek: number;
  weeklyTarget: number;
}

export interface AdjustInput {
  mode: "adjust" | "joint";
  request: string;
  plan: Plan;
  library: Exercise[];
  location: Pick<Location, "equipment"> | null;
  people: PersonContext[];
  daysLeftInWeek: number;
}

export type AdjustResult = { ok: true; plan: Plan } | { ok: false; status: number; message: string };

const SYSTEM = `You adjust gym sessions for a couples fitness app. You only answer by calling submit_plan.

Rules:
- Use only exercises from the catalogue, by their code. Never invent exercises.
- Order: warm-up first (easy cardio, then dynamic moves), then lifting, then any cardio finisher, then held stretches. Never put held stretches before lifting.
- Hard intervals never go before leg work. Steady cardio after lifting is fine.
- Fit the session into the requested minutes. Roughly: each lifting set takes 45 seconds plus its rest, plus a minute between exercises.
- Big compound lifts first, smaller isolation work after.
- Do not set weights; the app chooses weights from each person's history.
- Prefer exercises the person has trained recently so their progress continues, unless they ask for variety.
- If the request mentions pain or an injury, avoid loading that area, choose gentler options, and say in the note that pain that persists or is sharp needs a doctor or physiotherapist. Do not diagnose.
- Joint sessions: both partners do the same exercises in the same order, taking turns, so one partner's set is the other's rest. Keep to the shorter of their available times unless asked otherwise.
- The note is 1 to 3 short sentences in plain language explaining what changed and why. No dashes.`;

const TOOL = {
  name: "submit_plan",
  description: "Submit the adjusted session.",
  input_schema: {
    type: "object",
    additionalProperties: false,
    required: ["day", "minutes", "note", "warmup", "strength", "cardio", "stretch"],
    properties: {
      day: { type: "string", enum: ["full", "upper", "lower", "push", "pull", "legs", "circuit", "cardio", "mobility"] },
      minutes: { type: "integer", minimum: 10, maximum: 120 },
      note: { type: "string" },
      circuit: {
        type: "object",
        additionalProperties: false,
        required: ["rounds", "round_rest"],
        properties: { rounds: { type: "integer" }, round_rest: { type: "integer" } },
      },
      warmup: { type: "array", items: timedItem() },
      strength: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["code", "sets", "rep_min", "rep_max", "rest"],
          properties: {
            code: { type: "string" },
            sets: { type: "integer" },
            rep_min: { type: "integer" },
            rep_max: { type: "integer" },
            rest: { type: "integer", description: "seconds" },
            reason: { type: "string" },
          },
        },
      },
      cardio: { type: "array", items: timedItem() },
      stretch: { type: "array", items: timedItem() },
    },
  },
};

function timedItem() {
  return {
    type: "object",
    additionalProperties: false,
    required: ["code", "seconds"],
    properties: { code: { type: "string" }, seconds: { type: "integer" }, reason: { type: "string" } },
  };
}

/** Short codes instead of database ids: fewer tokens and nothing internal leaves the server. */
function codebook(library: Exercise[], location: Pick<Location, "equipment"> | null) {
  const usable = library.filter((e) => !e.archived && isAvailable(e, location));
  const toCode = new Map<string, string>();
  const toId = new Map<string, string>();
  usable.forEach((e, i) => {
    const code = `x${i + 1}`;
    toCode.set(e.id, code);
    toId.set(code, e.id);
  });
  return { usable, toCode, toId };
}

/** The user message. Exported for tests so the privacy rules can be checked. */
export function buildPrompt(input: AdjustInput) {
  const { usable, toCode, toId } = codebook(input.library, input.location);
  const code = (id: string) => toCode.get(id) ?? "?";
  const catalogue = usable
    .map((e) => `${toCode.get(e.id)} | ${e.name} | ${kindOf(e)} | ${e.muscle_group}${e.equipment.length ? ` | needs ${e.equipment.join(", ")}` : ""}`)
    .join("\n");
  const plan = {
    day: input.plan.day,
    minutes: input.plan.minutes,
    circuit: input.plan.circuit,
    warmup: input.plan.warmup.map((i) => ({ code: code(i.exercise_id), seconds: i.seconds })),
    strength: input.plan.strength.map((i) => ({ code: code(i.exercise_id), sets: i.sets, rep_min: i.rep_min, rep_max: i.rep_max, rest: i.rest })),
    cardio: input.plan.cardio.map((i) => ({ code: code(i.exercise_id), seconds: i.seconds })),
    stretch: input.plan.stretch.map((i) => ({ code: code(i.exercise_id), seconds: i.seconds })),
  };
  const people = input.people
    .map((p) => {
      const days = p.recentDays.map((d) => `${d.day} ${d.daysAgo}d ago`).join(", ") || "none";
      const exercises = p.recentExercises.filter((r) => toCode.has(r.exerciseId)).map((r) => `${code(r.exerciseId)} ${r.daysAgo}d ago`).join(", ") || "none";
      return `${p.label}: program ${p.split}, usually ${p.minutes} min. Workouts this week ${p.workoutsThisWeek} of ${p.weeklyTarget}. Recent sessions: ${days}. Recent exercises: ${exercises}.`;
    })
    .join("\n");

  const task =
    input.mode === "joint"
      ? "Plan one joint session for both partners to do together at this location."
      : "Adjust this session for the person's request.";
  const text = `${task}

Days left in the week: ${input.daysLeftInWeek}.

People:
${people}

Current plan (from the app's rules):
${JSON.stringify(plan)}

Request: ${input.request.trim() || "(none, use your judgment)"}

Catalogue (code | name | kind | muscle | equipment):
${catalogue}`;
  return { text, toId };
}

/** Map codes back to ids and validate. */
export function decodeAndValidate(raw: Record<string, unknown>, toId: Map<string, string>, input: AdjustInput) {
  const mapList = (list: unknown) =>
    (Array.isArray(list) ? list : []).map((i: Record<string, unknown>) => ({ ...i, exercise_id: toId.get(String(i?.code)) ?? `unknown:${String(i?.code)}` }));
  return validatePlan(
    {
      ...raw,
      warmup: mapList(raw.warmup),
      strength: mapList(raw.strength),
      cardio: mapList(raw.cardio),
      stretch: mapList(raw.stretch),
      joint: input.mode === "joint",
    },
    input.library,
    input.location,
  );
}

export async function adjustPlan(input: AdjustInput, apiKey: string | undefined): Promise<AdjustResult> {
  if (!apiKey) return { ok: false, status: 503, message: "AI isn't set up yet: the server has no Anthropic API key." };
  const { text, toId } = buildPrompt(input);

  let response: Response;
  try {
    response = await fetch(API_URL, {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: AI_MODEL,
        max_tokens: 2000,
        system: SYSTEM,
        tools: [TOOL],
        tool_choice: { type: "tool", name: "submit_plan" },
        messages: [{ role: "user", content: text }],
      }),
      signal: AbortSignal.timeout(45_000),
    });
  } catch {
    return { ok: false, status: 504, message: "The AI took too long. Your plan is unchanged." };
  }
  if (!response.ok) {
    // Status only: the body can echo the prompt, and nothing of the prompt is logged.
    console.error(`AI plan request failed with status ${response.status}`);
    return { ok: false, status: 502, message: "The AI couldn't answer right now. Your plan is unchanged." };
  }
  const body = (await response.json()) as { content?: { type: string; name?: string; input?: Record<string, unknown> }[] };
  const call = body.content?.find((c) => c.type === "tool_use" && c.name === "submit_plan");
  if (!call?.input) return { ok: false, status: 502, message: "The AI didn't return a plan. Your plan is unchanged." };

  const result = decodeAndValidate(call.input, toId, input);
  if (!result.ok) {
    console.error(`AI plan failed validation (${result.errors.length} problems)`);
    return { ok: false, status: 502, message: "The AI suggested something that doesn't fit your library or equipment. Your plan is unchanged." };
  }
  return { ok: true, plan: result.plan };
}
