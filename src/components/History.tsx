"use client";

import { useState } from "react";
import { useHouseholdData } from "@/hooks/useHouseholdData";
import { addDays, toLocalDate } from "@/lib/dates";
import { weekStart } from "@/lib/streak";
import { trendChange, weightTrend } from "@/lib/trend";
import { fromKg } from "@/lib/units";
import type { Profile } from "@/lib/types";
import { Card } from "./ui";
import { WeightChart, type WeightSeries } from "./WeightChart";

const RANGES = [30, 90, 365] as const;
type Range = (typeof RANGES)[number];

export function History({ userId, householdId }: { userId: string; householdId: string }) {
  const today = toLocalDate();
  const thisWeek = weekStart(today);
  const [range, setRange] = useState<Range>(30);
  const [week, setWeek] = useState(thisWeek);
  const weekEnd = addDays(week, 6);

  const { profiles, meals, weights, workouts, loading } = useHouseholdData(householdId, {
    mealFrom: week,
    mealTo: weekEnd,
    weightDays: 365,
  });

  const me = profiles.find((p) => p.id === userId);
  const partner = profiles.find((p) => p.id !== userId);
  const people = [me, partner].filter((p): p is Profile => Boolean(p));
  const unit = me?.weight_unit ?? "lb";

  const series: WeightSeries[] = people
    .filter((p) => p.id === userId || p.share_weight)
    .map((p) => ({
      id: p.id,
      name: p.id === userId ? "You" : p.display_name,
      role: p.id === userId ? "you" : "partner",
      points: weightTrend(weights.filter((w) => w.user_id === p.id)),
    }));

  return (
    <div className="space-y-4">
      <h1 className="px-1 text-2xl font-semibold tracking-tight">History</h1>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-medium">Weight trend</h2>
          <div className="flex gap-1 rounded-xl bg-surface-2 p-1" role="tablist" aria-label="Range">
            {RANGES.map((r) => (
              <button
                key={r}
                role="tab"
                aria-selected={range === r}
                onClick={() => setRange(r)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium ${range === r ? "bg-you text-black" : "text-muted"}`}
              >
                {r === 365 ? "1y" : `${r}d`}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="h-52 animate-pulse rounded-2xl bg-surface-2" />
        ) : (
          <>
            {/* One chart per person, each on its own scale, so both trends stay readable. */}
            <div className="space-y-6">
              {series.map((s) => (
                <section key={s.id} aria-label={`${s.name} weight`}>
                  <div className="mb-1 flex items-baseline justify-between">
                    <h3 className="flex items-center gap-2 text-sm font-medium">
                      <span className={`size-2.5 rounded-full ${s.role === "you" ? "bg-you" : "bg-partner"}`} />
                      {s.name}
                    </h3>
                    <TrendSummary series={[s]} unit={unit} range={range} />
                  </div>
                  <WeightChart series={[s]} unit={unit} days={range} today={today} />
                </section>
              ))}
            </div>
            {partner && !partner.share_weight && (
              <p className="mt-2 text-xs text-muted">{partner.display_name} keeps weight private.</p>
            )}
          </>
        )}
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <button
            onClick={() => setWeek(addDays(week, -7))}
            className="flex size-9 items-center justify-center rounded-xl text-lg"
            aria-label="Previous week"
          >
            ‹
          </button>
          <h2 className="font-medium">{week === thisWeek ? "This week" : `Week of ${shortDate(week)}`}</h2>
          <button
            onClick={() => setWeek(addDays(week, 7))}
            disabled={week >= thisWeek}
            className="flex size-9 items-center justify-center rounded-xl text-lg disabled:opacity-30"
            aria-label="Next week"
          >
            ›
          </button>
        </div>

        <WeekTable
          week={week}
          today={today}
          people={people}
          userId={userId}
          meals={meals}
          workouts={workouts}
        />
      </Card>
    </div>
  );
}

function TrendSummary({ series, unit, range }: { series: WeightSeries[]; unit: "lb" | "kg"; range: number }) {
  const rows = series
    .map((s) => ({ s, change: trendChange(s.points, range) }))
    .filter((r): r is { s: WeightSeries; change: number } => r.change !== null);
  if (!rows.length) return null;
  return (
    <>
      {rows.map(({ s, change }) => {
        const v = fromKg(Math.abs(change), unit);
        return (
          <p key={s.id} className="text-sm tabular-nums text-muted">
            {v < 0.05 ? "Steady" : `${change < 0 ? "Down" : "Up"} ${v.toFixed(1)} ${unit}`} in {range === 365 ? "a year" : `${range} days`}
          </p>
        );
      })}
    </>
  );
}

function shortDate(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function WeekTable({
  week,
  today,
  people,
  userId,
  meals,
  workouts,
}: {
  week: string;
  today: string;
  people: Profile[];
  userId: string;
  meals: { user_id: string; log_date: string; calories: number; protein_g: number }[];
  workouts: { user_id: string; log_date: string; status: string; name: string }[];
}) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(week, i));

  const cell = (p: Profile, day: string) => {
    const dayMeals = meals.filter((m) => m.user_id === p.id && m.log_date === day);
    const kcal = dayMeals.reduce((s, m) => s + m.calories, 0);
    const protein = dayMeals.reduce((s, m) => s + m.protein_g, 0);
    const w = workouts.filter((x) => x.user_id === p.id && x.log_date === day && x.status !== "declined");
    return { kcal, protein, logged: dayMeals.length > 0, workout: w[0], pending: w.some((x) => x.status === "pending") };
  };

  return (
    <div className="-mx-1 overflow-x-auto">
      <table className="w-full text-sm tabular-nums">
        <thead>
          <tr className="text-left text-xs text-muted">
            <th className="px-1 pb-2 font-normal">Day</th>
            {people.map((p) => (
              <th key={p.id} className="px-1 pb-2 text-right font-normal">
                <span className="inline-flex items-center gap-1.5">
                  <span className={`size-2 rounded-full ${p.id === userId ? "bg-you" : "bg-partner"}`} />
                  {p.id === userId ? "You" : p.display_name}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {days.map((day) => {
            const future = day > today;
            return (
              <tr key={day} className={future ? "opacity-40" : undefined}>
                <td className="px-1 py-2.5 text-muted">{dayName(day)}</td>
                {people.map((p) => {
                  const hidden = p.id !== userId && !p.share_meals;
                  const c = cell(p, day);
                  return (
                    <td key={p.id} className="px-1 py-2.5 text-right">
                      <span className="block">
                        {c.workout && (
                          <span className="mr-1.5" title={c.pending ? "Waiting for partner's OK" : c.workout.name}>
                            {c.pending ? "⏳" : "🏋️"}
                          </span>
                        )}
                        {hidden ? (
                          <span className="text-muted">private</span>
                        ) : c.logged ? (
                          <span>{c.kcal.toLocaleString()}</span>
                        ) : (
                          <span className="text-muted">·</span>
                        )}
                      </span>
                      {!hidden && c.logged && <span className="text-xs text-muted">{Math.round(c.protein)} g protein</span>}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-2 px-1 text-xs text-muted">Calories per day. 🏋️ trained, ⏳ waiting for your partner&apos;s OK.</p>
    </div>
  );
}

function dayName(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: "short", day: "numeric" });
}
