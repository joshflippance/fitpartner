import { createClient } from "@/lib/supabase/server";
import { adjustPlan, type PersonContext } from "@/lib/ai-plan";
import { validatePlan, type Plan } from "@/lib/planner";
import { daysLeftInWeek, isIsoDate, recentDayTypes, recentExercises, windowStart, workoutsThisWeek, type LogRow } from "@/lib/plan-context";
import type { Exercise, Location, TrainingProgram } from "@/lib/types";

const MAX_REQUEST = 300;

/**
 * POST /api/plan  { mode: "adjust" | "joint", request, plan, locationId, today }
 * Runs only for signed-in people who turned AI on; a joint plan also needs the partner's opt-in.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return Response.json({ error: "Sign in first." }, { status: 401 });

  let body: { mode?: string; request?: unknown; plan?: unknown; locationId?: unknown; today?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }
  const mode = body.mode === "joint" ? "joint" : "adjust";
  const request = typeof body.request === "string" ? body.request.slice(0, MAX_REQUEST) : "";
  const today = isIsoDate(body.today) ? body.today : new Date().toISOString().slice(0, 10);
  const locationId = typeof body.locationId === "string" ? body.locationId : null;

  const { data: me } = await supabase.from("profiles").select("id, household_id, weekly_workout_target").eq("id", userId).single();
  if (!me?.household_id) return Response.json({ error: "Join a household first." }, { status: 403 });

  const [{ data: programs }, { data: members }, libraryRes, locationRes] = await Promise.all([
    supabase.from("training_programs").select("*").eq("household_id", me.household_id),
    supabase.from("profiles").select("id, weekly_workout_target").eq("household_id", me.household_id),
    supabase.from("exercises").select("*"),
    locationId ? supabase.from("locations").select("*").eq("id", locationId).single() : Promise.resolve({ data: null }),
  ]);
  const programOf = (id: string) => (programs ?? []).find((p) => p.user_id === id) as TrainingProgram | undefined;
  const mine = programOf(userId);
  if (!mine?.ai_enabled) return Response.json({ error: "Turn on AI suggestions in Lift settings first." }, { status: 403 });

  const partner = (members ?? []).find((m) => m.id !== userId);
  const partnerProgram = partner ? programOf(partner.id) : undefined;
  if (mode === "joint") {
    if (!partner) return Response.json({ error: "Joint sessions need a partner in your household." }, { status: 403 });
    if (!partnerProgram?.ai_enabled) return Response.json({ error: "Your partner hasn't turned on AI suggestions, so a joint plan can't use their history." }, { status: 403 });
  }

  const library = (libraryRes.data ?? []) as Exercise[];
  const location = (locationRes.data as Location | null) ?? null;
  const current = validatePlan(body.plan, library, location);
  if (!current.ok) return Response.json({ error: "The current plan doesn't match your library. Refresh and try again." }, { status: 400 });

  const since = windowStart(today);
  const people: PersonContext[] = [];
  const ids = mode === "joint" && partner ? [userId, partner.id] : [userId];
  for (const id of ids) {
    const [{ data: logs }, { data: sets }] = await Promise.all([
      supabase.from("workout_logs").select("id, log_date, status, plan").eq("user_id", id).gte("log_date", since),
      supabase.from("workout_sets").select("exercise_id, workout_id").eq("user_id", id).gte("created_at", `${since}T00:00:00Z`),
    ]);
    const logRows = (logs ?? []) as (LogRow & { id: string })[];
    const dateOf = new Map(logRows.map((l) => [l.id, l.log_date]));
    const program = programOf(id);
    people.push({
      label: id === userId ? "You" : "Partner",
      minutes: program?.minutes ?? 45,
      split: program?.split ?? "full_body",
      recentDays: recentDayTypes(logRows, today).slice(0, 8),
      recentExercises: recentExercises(
        (sets ?? []).filter((s) => dateOf.has(s.workout_id)).map((s) => ({ exercise_id: s.exercise_id, log_date: dateOf.get(s.workout_id)! })),
        today,
      ).slice(0, 30),
      workoutsThisWeek: workoutsThisWeek(logRows, today),
      weeklyTarget: (members ?? []).find((m) => m.id === id)?.weekly_workout_target ?? 3,
    });
  }

  const result = await adjustPlan(
    { mode, request, plan: current.plan as Plan, library, location, people, daysLeftInWeek: daysLeftInWeek(today) },
    process.env.ANTHROPIC_API_KEY,
  );
  if (!result.ok) return Response.json({ error: result.message }, { status: result.status });
  return Response.json({ plan: result.plan });
}
