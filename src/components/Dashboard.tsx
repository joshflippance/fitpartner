"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useHouseholdData } from "@/hooks/useHouseholdData";
import { dayLabel } from "@/lib/logging";
import { weeklyWorkoutStreak, type WeeklyStreak } from "@/lib/streak";
import { toLocalDate } from "@/lib/dates";
import { formatWeight } from "@/lib/units";
import type { MealLog, Nudge, Profile, WeightLog, WorkoutLog } from "@/lib/types";
import { ProgressBar } from "./ProgressBar";
import { Card } from "./ui";

export function Dashboard({
  userId,
  householdId,
  pairCode,
}: {
  userId: string;
  householdId: string;
  pairCode: string;
}) {
  const supabase = useMemo(() => createClient(), []);
  const { profiles, meals, weights, workouts, nudges, loading, error, live, refresh } = useHouseholdData(householdId);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const me = profiles.find((p) => p.id === userId);
  const partner = profiles.find((p) => p.id !== userId);
  const streak = weeklyWorkoutStreak(workouts, profiles);
  const today = toLocalDate();

  const incoming = nudges.filter((n) => n.to_user === userId && !n.seen_at);
  const toReview = partner ? workouts.filter((w) => w.user_id === partner.id && w.status === "pending") : [];

  function flash(kind: "ok" | "err", text: string) {
    setNotice({ kind, text });
    setTimeout(() => setNotice(null), 3000);
  }

  async function sendNudge() {
    const { error } = await supabase.rpc("send_nudge");
    if (error) flash("err", error.message);
    else flash("ok", `Nudge sent to ${partner?.display_name ?? "your partner"}`);
  }

  async function markSeen(ids: string[]) {
    await supabase.from("nudges").update({ seen_at: new Date().toISOString() }).in("id", ids);
    void refresh();
  }

  async function review(id: string, approve: boolean) {
    const { error } = await supabase.rpc("review_workout", { workout_id: id, approve });
    if (error) flash("err", error.message);
    else flash("ok", approve ? "Counted toward the streak" : "Marked as not counted");
    void refresh();
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between px-1">
        <div>
          <p className="text-sm text-muted">
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Today</h1>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-muted" title={live ? "Live sync on" : "Connecting"}>
          <span className={`size-2 rounded-full ${live ? "bg-you" : "bg-muted"}`} />
          {live ? "Live" : "Syncing"}
        </span>
      </header>

      {error && <p className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>}

      {incoming.length > 0 && partner && (
        <NudgeBanner nudges={incoming} from={partner.display_name} onDismiss={() => void markSeen(incoming.map((n) => n.id))} />
      )}

      {toReview.length > 0 && partner && (
        <ReviewCard workouts={toReview} partnerName={partner.display_name} today={today} onReview={(id, ok) => void review(id, ok)} />
      )}

      {notice && (
        <p
          role="status"
          className={`rounded-2xl px-4 py-3 text-sm ${notice.kind === "ok" ? "bg-you/10 text-you" : "bg-danger/10 text-danger"}`}
        >
          {notice.text}
        </p>
      )}

      <StreakCard data={streak} members={[me, partner].filter((p): p is Profile => Boolean(p))} userId={userId} />

      {loading ? (
        <SkeletonCards />
      ) : (
        <>
          {me && <PersonCard profile={me} color="you" isYou meals={meals} weights={weights} workouts={workouts} today={today} />}
          {partner ? (
            <PersonCard
              profile={partner}
              color="partner"
              meals={meals}
              weights={weights}
              workouts={workouts}
              today={today}
              onNudge={() => void sendNudge()}
            />
          ) : (
            <Card className="border-dashed text-center">
              <p className="text-muted">Waiting for your partner to join</p>
              <p className="mt-2 font-mono text-3xl font-semibold tracking-[0.25em] text-partner">{pairCode}</p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function StreakCard({ data, members, userId }: { data: WeeklyStreak; members: Profile[]; userId: string }) {
  return (
    <Card className="bg-gradient-to-br from-surface to-surface-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">Shared weekly streak</p>
          <p className="mt-1 text-xs text-muted/70">Weeks you both hit your targets</p>
        </div>
        <p className="flex items-baseline gap-1">
          <span className="text-5xl font-semibold tabular-nums">{data.streak}</span>
          <span className="text-muted">{data.streak === 1 ? "week" : "weeks"}</span>
        </p>
      </div>

      <div className="mt-4 space-y-2 border-t border-line pt-3">
        {members.map((m) => {
          const done = data.thisWeek[m.id] ?? 0;
          const isYou = m.id === userId;
          return (
            <div key={m.id} className="flex items-center justify-between text-sm">
              <span className="text-muted">{m.display_name}</span>
              <span className="flex items-center gap-2">
                <span className="flex gap-1" aria-label={`${done} of ${m.weekly_workout_target} sessions this week`}>
                  {Array.from({ length: m.weekly_workout_target }, (_, i) => (
                    <span
                      key={i}
                      className={`size-2.5 rounded-full ${i < done ? (isYou ? "bg-you" : "bg-partner") : "bg-line"}`}
                    />
                  ))}
                </span>
                <span className="w-8 text-right tabular-nums text-muted">{done}/{m.weekly_workout_target}</span>
              </span>
            </div>
          );
        })}
        <p className="pt-1 text-xs text-muted/70">
          {data.thisWeekDone ? "This week is locked in." : "This week counts once you both hit your targets."}
        </p>
      </div>
    </Card>
  );
}

function PersonCard({
  profile,
  color,
  isYou,
  meals,
  weights,
  workouts,
  today,
  onNudge,
}: {
  profile: Profile;
  color: "you" | "partner";
  isYou?: boolean;
  meals: MealLog[];
  weights: WeightLog[];
  workouts: WorkoutLog[];
  today: string;
  onNudge?: () => void;
}) {
  const mine = meals.filter((m) => m.user_id === profile.id);
  const calories = mine.reduce((sum, m) => sum + m.calories, 0);
  const protein = mine.reduce((sum, m) => sum + m.protein_g, 0);
  const latestWeight = weights.find((w) => w.user_id === profile.id);
  const trainedToday = workouts.find((w) => w.user_id === profile.id && w.log_date === today && w.status !== "declined");
  const pending = workouts.filter((w) => w.user_id === profile.id && w.status === "pending").length;
  const mealsHidden = !isYou && !profile.share_meals;
  const weightHidden = !isYou && !profile.share_weight;

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-medium">
          <span className={`size-2.5 rounded-full ${color === "you" ? "bg-you" : "bg-partner"}`} />
          {profile.display_name}
          {isYou && <span className="text-xs text-muted">(you)</span>}
        </h2>
        <span
          className={`rounded-full px-2.5 py-1 text-xs ${
            trainedToday ? (color === "you" ? "bg-you/15 text-you" : "bg-partner/15 text-partner") : "bg-surface-2 text-muted"
          }`}
        >
          {trainedToday ? `${trainedToday.status === "pending" ? "⏳" : "✓"} ${trainedToday.name}` : "Rest day so far"}
        </span>
      </div>

      {mealsHidden ? (
        <p className="rounded-2xl bg-surface-2 px-4 py-6 text-center text-sm text-muted">{profile.display_name} keeps meals private</p>
      ) : (
        <div className="space-y-4">
          <ProgressBar label="Calories" value={calories} target={profile.calorie_target} unit="kcal" color={color} />
          <ProgressBar label="Protein" value={protein} target={profile.protein_target} unit="g" color={color} />
        </div>
      )}

      <div className="mt-4 flex justify-between gap-3 border-t border-line pt-3 text-sm text-muted">
        <span>{mealsHidden ? "Meals private" : `${mine.length} ${mine.length === 1 ? "meal" : "meals"} logged`}</span>
        <span>
          {weightHidden
            ? "Weight private"
            : latestWeight
              ? `${formatWeight(latestWeight.weight_kg, profile.weight_unit)}${latestWeight.log_date === today ? " today" : ""}`
              : "No weigh-in yet"}
        </span>
      </div>

      {(pending > 0 || onNudge || (isYou && (!profile.share_meals || !profile.share_weight))) && (
        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted">
          <span>
            {pending > 0 && `${pending} late ${pending === 1 ? "workout" : "workouts"} waiting for ${isYou ? "your partner" : "you"}`}
            {pending === 0 && isYou && "Some of your data is hidden from your partner"}
          </span>
          {onNudge && (
            <button
              onClick={onNudge}
              className="shrink-0 rounded-full border border-partner/40 px-3 py-1.5 font-medium text-partner active:scale-[0.97]"
            >
              Nudge {profile.display_name}
            </button>
          )}
        </div>
      )}
    </Card>
  );
}

function timeAgo(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  return `${hrs} ${hrs === 1 ? "hour" : "hours"} ago`;
}

function NudgeBanner({ nudges, from, onDismiss }: { nudges: Nudge[]; from: string; onDismiss: () => void }) {
  return (
    <div role="status" className="flex items-center justify-between gap-3 rounded-2xl border border-partner/30 bg-partner/10 px-4 py-3">
      <p className="text-sm">
        <span className="font-medium text-partner">{from}</span> nudged you{nudges.length > 1 ? ` ${nudges.length} times` : ""}
        <span className="text-muted"> · {timeAgo(nudges[0].created_at)}</span>
      </p>
      <button onClick={onDismiss} className="shrink-0 text-sm font-medium text-text">Got it</button>
    </div>
  );
}

function ReviewCard({
  workouts,
  partnerName,
  today,
  onReview,
}: {
  workouts: WorkoutLog[];
  partnerName: string;
  today: string;
  onReview: (id: string, approve: boolean) => void;
}) {
  return (
    <Card className="border-partner/30">
      <h2 className="font-medium">Pinky Promise</h2>
      <p className="mb-3 mt-1 text-sm text-muted">
        {partnerName} logged {workouts.length === 1 ? "a workout" : "workouts"} late. Count {workouts.length === 1 ? "it" : "them"} toward the streak?
      </p>
      <ul className="divide-y divide-line text-sm">
        {workouts.map((w) => (
          <li key={w.id} className="flex items-center justify-between gap-3 py-2.5">
            <span className="min-w-0">
              <span className="block truncate">{w.name}</span>
              <span className="text-xs text-muted">{dayLabel(w.log_date, today)}</span>
            </span>
            <span className="flex shrink-0 gap-2">
              <button onClick={() => onReview(w.id, false)} className="rounded-full px-3 py-1.5 text-xs text-muted">
                Not this time
              </button>
              <button onClick={() => onReview(w.id, true)} className="rounded-full bg-you px-3 py-1.5 text-xs font-medium text-black">
                Count it
              </button>
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function SkeletonCards() {
  return (
    <>
      {[0, 1].map((i) => (
        <div key={i} className="h-56 animate-pulse rounded-3xl border border-line bg-surface" />
      ))}
    </>
  );
}
