"use client";

import { useId, useMemo, useRef, useState } from "react";
import { addDays } from "@/lib/dates";
import { dayLabel } from "@/lib/logging";
import type { TrendPoint } from "@/lib/trend";
import { fromKg } from "@/lib/units";
import type { WeightUnit } from "@/lib/types";

export interface WeightSeries {
  id: string;
  name: string;
  role: "you" | "partner";
  points: TrendPoint[]; // kg, ascending by date
}

const W = 340;
const H = 200;
const MARGIN = { top: 12, bottom: 24, left: 36 };
const PLOT_H = H - MARGIN.top - MARGIN.bottom;

const STROKE = { you: "var(--you)", partner: "var(--partner)" } as const;
// Partner is dashed so the two lines differ by more than color.
const DASH = { you: undefined, partner: "5 4" } as const;

function niceStep(span: number) {
  const raw = span / 4;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
}

function dayIndex(from: string, date: string) {
  const [ay, am, ad] = from.split("-").map(Number);
  const [by, bm, bd] = date.split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000);
}

export function WeightChart({
  series,
  unit,
  days,
  today,
}: {
  series: WeightSeries[];
  unit: WeightUnit;
  days: number;
  today: string;
}) {
  const clipId = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null); // day index
  const [asTable, setAsTable] = useState(false);
  const from = addDays(today, -days);

  const visible = useMemo(
    () =>
      series.map((s) => ({
        ...s,
        pts: s.points
          .filter((p) => p.date >= from && p.date <= today)
          .map((p) => ({ ...p, i: dayIndex(from, p.date), w: fromKg(p.weight, unit), t: fromKg(p.trend, unit) })),
      })),
    [series, from, today, unit],
  );

  const all = visible.flatMap((s) => s.pts.flatMap((p) => [p.w, p.t]));
  if (all.length === 0) {
    return <p className="rounded-2xl bg-surface-2 px-4 py-10 text-center text-sm text-muted">No weigh-ins in this range yet.</p>;
  }

  const lo0 = Math.min(...all);
  const hi0 = Math.max(...all);
  const step = niceStep(Math.max(hi0 - lo0, unit === "kg" ? 2 : 4));
  const lo = Math.floor(lo0 / step) * step;
  const hi = Math.ceil(hi0 / step) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Number(v.toFixed(2)));

  // Room for end labels only when there are two lines to tell apart.
  const M = { ...MARGIN, right: visible.length > 1 ? 52 : 12 };
  const PLOT_W = W - M.left - M.right;
  const x = (i: number) => M.left + (i / days) * PLOT_W;
  const y = (v: number) => M.top + (1 - (v - lo) / (hi - lo || 1)) * PLOT_H;

  // End labels: nudge apart when the two lines finish close together.
  const ends = visible
    .filter((s) => s.pts.length)
    .map((s) => ({ id: s.id, name: s.name, y: y(s.pts.at(-1)!.t), x: x(s.pts.at(-1)!.i) }))
    .sort((a, b) => a.y - b.y);
  for (let k = 1; k < ends.length; k++) if (ends[k].y - ends[k - 1].y < 14) ends[k].y = ends[k - 1].y + 14;

  function onMove(e: React.PointerEvent<SVGRectElement>) {
    const box = svgRef.current?.getBoundingClientRect();
    if (!box) return;
    const sx = ((e.clientX - box.left) / box.width) * W;
    const i = Math.round(((sx - M.left) / PLOT_W) * days);
    const candidates = visible.flatMap((s) => s.pts.map((p) => p.i));
    if (!candidates.length) return;
    const nearest = candidates.reduce((a, b) => (Math.abs(b - i) < Math.abs(a - i) ? b : a));
    setHover(nearest);
  }

  const hoverDate = hover === null ? null : addDays(from, hover);
  const hoverRows = hover === null ? [] : visible.map((s) => ({ s, p: s.pts.find((p) => p.i === hover) })).filter((r) => r.p);
  const tipLeft = hover === null ? 0 : (x(hover) / W) * 100;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <ul className={`flex gap-4 text-xs text-muted ${visible.length < 2 ? "invisible" : ""}`}>
          {visible.map((s) => (
            <li key={s.id} className="flex items-center gap-1.5">
              <svg width="18" height="6" aria-hidden>
                <line x1="1" y1="3" x2="17" y2="3" stroke={STROKE[s.role]} strokeWidth="2" strokeDasharray={DASH[s.role]} strokeLinecap="round" />
              </svg>
              {s.name}
            </li>
          ))}
        </ul>
        <button onClick={() => setAsTable(!asTable)} className="text-xs text-muted underline-offset-4 hover:underline">
          {asTable ? "Show chart" : "Show table"}
        </button>
      </div>

      {asTable ? (
        <WeightTable visible={visible} unit={unit} today={today} />
      ) : (
        <div className="relative">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="w-full touch-pan-y select-none"
            role="img"
            aria-label={`Weight trend over the last ${days} days`}
          >
            <defs>
              <clipPath id={clipId}>
                <rect x={M.left} y={M.top - 4} width={PLOT_W} height={PLOT_H + 8} />
              </clipPath>
            </defs>

            {ticks.map((t) => (
              <g key={t}>
                <line x1={M.left} x2={M.left + PLOT_W} y1={y(t)} y2={y(t)} stroke="var(--border)" strokeWidth="1" />
                <text x={M.left - 6} y={y(t)} textAnchor="end" dominantBaseline="middle" fontSize="10" fill="var(--muted)">
                  {Number.isInteger(t) ? t : t.toFixed(1)}
                </text>
              </g>
            ))}
            <text x={M.left} y={H - 6} fontSize="10" fill="var(--muted)">{dayLabel(from, today)}</text>
            <text x={M.left + PLOT_W} y={H - 6} textAnchor="end" fontSize="10" fill="var(--muted)">Today</text>

            <g clipPath={`url(#${clipId})`}>
              {visible.map((s) => (
                <g key={s.id}>
                  {s.pts.map((p) => (
                    <circle key={p.date} cx={x(p.i)} cy={y(p.w)} r="2.5" fill={STROKE[s.role]} opacity="0.35" />
                  ))}
                  {s.pts.length > 1 && (
                    <polyline
                      points={s.pts.map((p) => `${x(p.i)},${y(p.t)}`).join(" ")}
                      fill="none"
                      stroke={STROKE[s.role]}
                      strokeWidth="2"
                      strokeDasharray={DASH[s.role]}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  )}
                </g>
              ))}
            </g>

            {ends.length > 1 && ends.map((e) => (
              <text key={e.id} x={M.left + PLOT_W + 6} y={e.y} dominantBaseline="middle" fontSize="11" fill="var(--text)">
                {e.name}
              </text>
            ))}

            {hover !== null && (
              <g>
                <line x1={x(hover)} x2={x(hover)} y1={M.top} y2={M.top + PLOT_H} stroke="var(--muted)" strokeWidth="1" />
                {hoverRows.map(({ s, p }) => (
                  <circle key={s.id} cx={x(p!.i)} cy={y(p!.t)} r="4" fill={STROKE[s.role]} stroke="var(--surface)" strokeWidth="2" />
                ))}
              </g>
            )}

            <rect
              x={M.left}
              y={M.top}
              width={PLOT_W}
              height={PLOT_H}
              fill="transparent"
              onPointerMove={onMove}
              onPointerDown={onMove}
              onPointerLeave={() => setHover(null)}
            />
          </svg>

          {hoverDate && hoverRows.length > 0 && (
            <div
              className="pointer-events-none absolute bottom-8 z-10 whitespace-nowrap rounded-xl border border-line bg-bg/95 px-3 py-2 text-xs shadow-lg"
              style={{ left: `${tipLeft}%`, transform: `translateX(${tipLeft > 60 ? "-105%" : "5%"})` }}
            >
              <p className="mb-1 text-muted">{dayLabel(hoverDate, today)}</p>
              {hoverRows.map(({ s, p }) => (
                <div key={s.id} className="tabular-nums">
                  {hoverRows.length > 1 && <p className="font-medium">{s.name}</p>}
                  <p>
                    Weighed <span className="font-semibold">{p!.w.toFixed(1)} {unit}</span>
                  </p>
                  <p className="text-muted">Trend {p!.t.toFixed(1)} {unit}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <p className="mt-2 text-xs text-muted">Dots are daily weigh-ins. Lines are the smoothed trend, which ignores day to day water swings.</p>
    </div>
  );
}

function WeightTable({
  visible,
  unit,
  today,
}: {
  visible: { id: string; name: string; pts: { date: string; w: number; t: number }[] }[];
  unit: WeightUnit;
  today: string;
}) {
  const dates = [...new Set(visible.flatMap((s) => s.pts.map((p) => p.date)))].sort().reverse().slice(0, 30);
  return (
    <div className="max-h-72 overflow-y-auto rounded-2xl border border-line">
      <table className="w-full text-sm tabular-nums">
        <thead className="sticky top-0 bg-surface text-left text-xs text-muted">
          <tr>
            <th className="px-3 py-2 font-normal">Date</th>
            {visible.map((s) => (
              <th key={s.id} className="px-3 py-2 text-right font-normal">
                {s.name} ({unit})
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {dates.map((d) => (
            <tr key={d}>
              <td className="px-3 py-2 text-muted">{dayLabel(d, today)}</td>
              {visible.map((s) => {
                const p = s.pts.find((q) => q.date === d);
                return (
                  <td key={s.id} className="px-3 py-2 text-right">
                    {p ? (
                      <>
                        {p.w.toFixed(1)} <span className="text-xs text-muted">({p.t.toFixed(1)})</span>
                      </>
                    ) : (
                      <span className="text-muted">·</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
