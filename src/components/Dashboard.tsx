"use client";

import { useHouseholdData } from "@/hooks/useHouseholdData";
import { weeklyWorkoutStreak, type WeeklyStreak } from "@/lib/streak";
import { toLocalDate } from "@/lib/dates";
import { formatWeight } from "@/lib/units";
import type { MealLog, Profile, WeightLog, WorkoutLog } from "@/lib/types";
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
  const { profiles, meals, weights, workouts, loading, error, live } = useHouseholdData(householdId);

  const me = profiles.find((p) => p.id === userId);
  const partner = profiles.find((p) => p.id !== userId);
  const streak = weeklyWorkoutStreak(workouts, profiles);
  const today = toLocalDate();

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

      <StreakCard data={streak} members={[me, partner].filter((p): p is Profile => Boolean(p))} userId={userId} />

      {loading ? (
        <SkeletonCards />
      ) : (
        <>
          {me && <PersonCard profile={me} color="you" isYou meals={meals} weights={weights} workouts={workouts} today={today} />}
          {partner ? (
            <PersonCard profile={partner} color="partner" meals={meals} weights={weights} workouts={workouts} today={today} />
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
}: {
  profile: Profile;
  color: "you" | "partner";
  isYou?: boolean;
  meals: MealLog[];
  weights: WeightLog[];
  workouts: WorkoutLog[];
  today: string;
}) {
  const mine = meals.filter((m) => m.user_id === profile.id);
  const calories = mine.reduce((sum, m) => sum + m.calories, 0);
  const protein = mine.reduce((sum, m) => sum + m.protein_g, 0);
  const latestWeight = weights.find((w) => w.user_id === profile.id);
  const trainedToday = workouts.find((w) => w.user_id === profile.id && w.log_date === today);

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
          {trainedToday ? `✓ ${trainedToday.name}` : "Rest day so far"}
        </span>
      </div>

      <div className="space-y-4">
        <ProgressBar label="Calories" value={calories} target={profile.calorie_target} unit="kcal" color={color} />
        <ProgressBar label="Protein" value={protein} target={profile.protein_target} unit="g" color={color} />
      </div>

      <div className="mt-4 flex justify-between border-t border-line pt-3 text-sm text-muted">
        <span>{mine.length} {mine.length === 1 ? "meal" : "meals"} logged</span>
        <span>
          {latestWeight
            ? `${formatWeight(latestWeight.weight_kg, profile.weight_unit)}${latestWeight.log_date === today ? " today" : ""}`
            : "No weigh-in yet"}
        </span>
      </div>
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
