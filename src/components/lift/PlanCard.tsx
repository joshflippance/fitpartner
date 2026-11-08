"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DAY_LABEL, SESSION_MINUTES, SPLITS, buildPlan, estimateMinutes, nextDay, type DayType, type Plan } from "@/lib/planner";
import { streakRisk, workoutsThisWeek } from "@/lib/plan-context";
import type { Exercise, Location, Profile, TrainingProgram } from "@/lib/types";
import { Button, Card } from "../ui";
import { Chip } from "./LiftHome";
import { ExerciseGuideSheet } from "./ExerciseGuideSheet";

type Program = Omit<TrainingProgram, "user_id" | "household_id" | "updated_at">;

const OTHER_TYPES: DayType[] = ["cardio", "mobility"];
const QUICK_ASKS = ["Short on time", "Sore shoulders", "Lower back is tight", "Bench is taken", "Something different", "Go easy today"];

export function PlanCard({
  library,
  location,
  program,
  partner,
  partnerProgram,
  context,
  userId,
  disabled,
  onStart,
}: {
  library: Exercise[];
  location: Location | null;
  program: Program;
  partner: Profile | null;
  partnerProgram: Program | null;
  context: {
    today: string;
    recentDays: DayType[];
    lastTrained: Map<string, string>;
    week: { user_id: string; log_date: string; status: string }[];
    myTarget: number;
  };
  userId: string;
  disabled: boolean;
  onStart: (plan: Plan, name: string) => void;
}) {
  const planned = nextDay(program.split, context.recentDays);
  const [day, setDay] = useState<DayType | null>(null);
  const [minutes, setMinutes] = useState<number | null>(null);
  const [joint, setJoint] = useState(false);
  const [changing, setChanging] = useState(false);
  const [aiPlan, setAiPlan] = useState<{ key: string; plan: Plan } | null>(null);
  const [asking, setAsking] = useState(false);
  const [request, setRequest] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [guide, setGuide] = useState<string | null>(null);

  const activeDay = day ?? planned;
  const jointMinutes = Math.min(program.minutes, partnerProgram?.minutes ?? program.minutes);
  const activeMinutes = minutes ?? (joint ? jointMinutes : program.minutes);
  const key = `${activeDay}|${activeMinutes}|${location?.id ?? "any"}|${joint}`;

  const rulesPlan = useMemo(() => {
    const p = buildPlan({ day: activeDay, minutes: activeMinutes, library, location, lastTrained: context.lastTrained, program });
    return joint ? { ...p, joint: true } : p;
  }, [activeDay, activeMinutes, library, location, context.lastTrained, program, joint]);
  // An AI plan only stands while its inputs are unchanged.
  const plan = aiPlan && aiPlan.key === key ? aiPlan.plan : rulesPlan;
  const byId = useMemo(() => new Map(library.map((e) => [e.id, e])), [library]);
  const nameOf = (id: string) => byId.get(id)?.name ?? "Exercise";

  const myDone = workoutsThisWeek(context.week.filter((w) => w.user_id === userId), context.today);
  const partnerDone = partner ? workoutsThisWeek(context.week.filter((w) => w.user_id === partner.id), context.today) : 0;
  const risk = streakRisk(
    [
      { label: "You", done: myDone, target: context.myTarget },
      ...(partner ? [{ label: partner.display_name, done: partnerDone, target: partner.weekly_workout_target }] : []),
    ],
    context.today,
  );

  const aiReady = program.ai_enabled && (!joint || Boolean(partnerProgram?.ai_enabled));

  async function askAi(text: string) {
    setAiBusy(true);
    setAiError(null);
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode: joint ? "joint" : "adjust", request: text, plan: rulesPlan, locationId: location?.id ?? null, today: context.today }),
      });
      const body = (await res.json().catch(() => ({}))) as { plan?: Plan; error?: string };
      if (!res.ok || !body.plan) throw new Error(body.error ?? "The AI couldn't answer right now. Your plan is unchanged.");
      setAiPlan({ key, plan: body.plan });
      setAsking(false);
      setRequest("");
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setAiBusy(false);
    }
  }

  const title = `${joint ? "Joint " : ""}${DAY_LABEL[plan.day]}`;
  const splitDays = SPLITS.find((s) => s.id === program.split)!.days;
  const typeChoices = [...new Set<DayType>([...splitDays, ...SPLITS.flatMap((s) => s.days), ...OTHER_TYPES])];

  return (
    <div className="space-y-4">
      {risk.length > 0 && (
        <Card className="border-partner/40">
          <p className="text-sm font-medium">Streak check</p>
          <ul className="mt-1 space-y-0.5 text-sm text-muted">
            {risk.map((r) => (
              <li key={r.label}>
                {r.label === "You" ? "You need" : `${r.label} needs`} {r.needed} more {r.needed === 1 ? "workout" : "workouts"} with {r.left}{" "}
                {r.left === 1 ? "day" : "days"} left{r.lastChance ? ", every day counts now" : ""}.
              </li>
            ))}
          </ul>
          {activeMinutes > 30 && (
            <button onClick={() => setMinutes(30)} className="mt-2 text-sm font-medium text-you">
              Make today a quick 30 minutes
            </button>
          )}
        </Card>
      )}

      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted">{day || minutes || joint ? "Today's session" : "Next up"}</p>
            <h2 className="mt-0.5 text-xl font-semibold tracking-tight">
              {title} <span className="font-normal text-muted">· {plan.minutes} min</span>
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              {SPLITS.find((s) => s.id === program.split)!.label} · {myDone} of {context.myTarget} this week
            </p>
          </div>
          <Link href="/lift/program" className="shrink-0 text-sm text-muted underline-offset-4 hover:underline">
            Program
          </Link>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={() => setChanging(!changing)} className="rounded-full border border-line px-3 py-1.5 text-sm">
            {changing ? "Done" : "Change type or length"}
          </button>
          {partner && (
            <button
              onClick={() => setJoint(!joint)}
              aria-pressed={joint}
              className={`rounded-full px-3 py-1.5 text-sm ${joint ? "bg-partner font-medium text-black" : "border border-line"}`}
            >
              {joint ? `With ${partner.display_name}` : `Train with ${partner.display_name}`}
            </button>
          )}
          {(day || minutes) && (
            <button
              onClick={() => {
                setDay(null);
                setMinutes(null);
              }}
              className="rounded-full px-3 py-1.5 text-sm text-muted"
            >
              Back to program
            </button>
          )}
        </div>

        {changing && (
          <div className="mt-3 space-y-3 rounded-2xl bg-surface-2 p-3">
            <div>
              <p className="mb-1.5 text-xs text-muted">Type</p>
              <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Session type">
                {typeChoices.map((d) => (
                  <Chip key={d} active={activeDay === d} onClick={() => setDay(d === planned ? null : d)}>
                    {DAY_LABEL[d]}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-xs text-muted">Length</p>
              <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Session length">
                {SESSION_MINUTES.map((m) => (
                  <Chip key={m} active={activeMinutes === m} onClick={() => setMinutes(m)}>
                    {m} min
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        )}

        {joint && (
          <p className="mt-3 text-xs text-muted">
            Same exercises, taking turns: your set is {partner?.display_name}&apos;s rest. Weights come from each person&apos;s own history.
          </p>
        )}

        <PlanPreview plan={plan} nameOf={nameOf} onGuide={setGuide} />

        {plan.note && (
          <p className="mt-3 rounded-2xl bg-surface-2 px-3 py-2 text-sm">
            {plan.source === "ai" && <span className="mr-1.5 rounded-full bg-you/15 px-1.5 py-0.5 text-[11px] font-medium text-you">AI</span>}
            {plan.note}
          </p>
        )}

        <div className="mt-4 space-y-2">
          <Button className="w-full" disabled={disabled} onClick={() => onStart(plan, title)}>
            Start {title.toLowerCase()}
          </Button>

          {plan.source === "ai" ? (
            <button onClick={() => setAiPlan(null)} className="w-full py-1 text-sm text-muted">
              Undo AI changes
            </button>
          ) : !asking ? (
            <Button variant="ghost" className="w-full" onClick={() => setAsking(true)}>
              {joint ? "Plan it together with AI" : "Adjust with AI"}
            </Button>
          ) : null}
        </div>

        {asking && (
          <div className="mt-3 space-y-3 rounded-2xl bg-surface-2 p-3">
            {!aiReady ? (
              <p className="text-sm text-muted">
                {program.ai_enabled
                  ? `${partner?.display_name ?? "Your partner"} hasn't turned on AI suggestions, so a joint AI plan can't use their history. The plan above still works without it.`
                  : "AI suggestions are off. Turn them on in "}
                {!program.ai_enabled && (
                  <Link href="/lift/program" className="text-you underline">
                    Program settings
                  </Link>
                )}
              </p>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void askAi(request);
                }}
                className="space-y-2"
              >
                <label htmlFor="ai-request" className="text-sm font-medium">
                  {joint ? "Anything to plan around?" : "What should change?"}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_ASKS.map((q) => (
                    <button key={q} type="button" onClick={() => setRequest(q)} className="rounded-full border border-line px-2.5 py-1 text-xs">
                      {q}
                    </button>
                  ))}
                </div>
                <textarea
                  id="ai-request"
                  value={request}
                  onChange={(e) => setRequest(e.target.value)}
                  maxLength={300}
                  rows={2}
                  placeholder={joint ? "We have 40 minutes and only one bench" : "Only 25 minutes, and my left shoulder is sore"}
                  className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm"
                />
                <p className="text-[11px] text-muted">Sent to Claude: this plan, your exercise list and recent training dates. Not your name, weights or meals. Don&apos;t include medical details.</p>
                {aiError && <p className="text-sm text-danger">{aiError}</p>}
                <div className="grid grid-cols-2 gap-2">
                  <Button type="button" variant="ghost" onClick={() => setAsking(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={aiBusy}>
                    {aiBusy ? "Thinking…" : "Adjust"}
                  </Button>
                </div>
              </form>
            )}
            {!aiReady && (
              <button onClick={() => setAsking(false)} className="text-sm text-muted">
                Close
              </button>
            )}
          </div>
        )}
      </Card>
      {guide && <ExerciseGuideSheet name={guide} onClose={() => setGuide(null)} />}
    </div>
  );
}

export function PlanPreview({ plan, nameOf, onGuide }: { plan: Plan; nameOf: (id: string) => string; onGuide?: (name: string) => void }) {
  const mins = (s: number) => (s >= 90 ? `${Math.round(s / 60)} min` : `${s} s`);
  const total = (items: { seconds: number }[]) => Math.round(items.reduce((t, i) => t + i.seconds, 0) / 60);
  const row = (id: string, detail: string, reason?: string) => (
    <li key={id} className="flex items-baseline justify-between gap-3 py-1.5 text-sm">
      <button onClick={() => onGuide?.(nameOf(id))} className="min-w-0 truncate text-left hover:text-you">
        {nameOf(id)}
        {reason && <span className="block truncate text-xs text-muted">{reason}</span>}
      </button>
      <span className="shrink-0 text-xs text-muted tabular-nums">{detail}</span>
    </li>
  );
  const section = (label: string, extra: string, children: React.ReactNode) => (
    <div>
      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted">
        {label} <span className="font-normal normal-case tracking-normal">{extra}</span>
      </p>
      <ul className="divide-y divide-line">{children}</ul>
    </div>
  );
  return (
    <div className="mt-1">
      {plan.warmup.length > 0 && section("Warm-up", `· ${total(plan.warmup)} min`, plan.warmup.map((i) => row(i.exercise_id, mins(i.seconds), i.reason)))}
      {plan.strength.length > 0 &&
        section(
          plan.circuit ? "Circuit" : "Lifting",
          plan.circuit ? `· ${plan.circuit.rounds} rounds, ${plan.circuit.round_rest} s rest between rounds` : `· ${plan.strength.length} exercises`,
          plan.strength.map((i) =>
            row(i.exercise_id, plan.circuit ? `${i.rep_min} to ${i.rep_max}` : `${i.sets} × ${i.rep_min === i.rep_max ? i.rep_min : `${i.rep_min} to ${i.rep_max}`}`, i.reason),
          ),
        )}
      {plan.cardio.length > 0 && section("Cardio", "", plan.cardio.map((i) => row(i.exercise_id, mins(i.seconds), i.reason)))}
      {plan.stretch.length > 0 && section("Stretch", `· ${total(plan.stretch)} min, hold each`, plan.stretch.map((i) => row(i.exercise_id, mins(i.seconds), i.reason)))}
      {plan.strength.length + plan.cardio.length + plan.warmup.length === 0 && (
        <p className="mt-3 text-sm text-muted">Nothing fits this location. Add equipment to it, or pick Anywhere.</p>
      )}
      <p className="mt-2 text-right text-xs text-muted">About {estimateMinutes(plan)} min</p>
    </div>
  );
}
