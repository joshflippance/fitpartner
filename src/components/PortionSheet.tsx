"use client";

import { useState } from "react";
import { PORTIONS, scaleMeal, type MealTemplate } from "@/lib/meals";
import { Button, Input } from "./ui";

export function PortionSheet({
  meal,
  busy,
  onAdd,
  onCancel,
}: {
  meal: MealTemplate;
  busy: boolean;
  onAdd: (factor: number) => void;
  onCancel: () => void;
}) {
  const [factor, setFactor] = useState(1);
  const [custom, setCustom] = useState("");
  const effective = custom ? Number(custom) / 100 : factor;
  const preview = scaleMeal(meal, effective);
  const valid = Number.isFinite(effective) && effective > 0 && effective <= 5;

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="portion-title">
      <div className="w-full max-w-md space-y-4 rounded-3xl border border-line bg-surface p-5">
        <div>
          <h2 id="portion-title" className="text-lg font-semibold">Add {meal.name}</h2>
          <p className="text-sm text-muted">How much did you have compared with your partner?</p>
        </div>

        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Portion">
          {PORTIONS.map((p) => (
            <button
              key={p}
              role="radio"
              aria-checked={!custom && factor === p}
              onClick={() => {
                setFactor(p);
                setCustom("");
              }}
              className={`h-11 rounded-xl text-sm font-medium tabular-nums ${!custom && factor === p ? "bg-you text-black" : "bg-surface-2 text-text"}`}
            >
              {p}×
            </button>
          ))}
        </div>

        <label className="flex items-center gap-3 text-sm text-muted">
          Or a custom amount
          <span className="w-24">
            <Input
              type="number"
              inputMode="numeric"
              min={5}
              max={500}
              placeholder="100"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              className="h-10 text-right"
            />
          </span>
          %
        </label>

        <p className="rounded-xl bg-surface-2 px-4 py-3 text-sm tabular-nums">
          {valid ? (
            <>
              <span className="font-semibold">{preview.calories} kcal</span>
              <span className="text-muted"> · {preview.protein_g} g protein</span>
            </>
          ) : (
            <span className="text-danger">Pick a portion between 5% and 500%.</span>
          )}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button type="button" disabled={busy || !valid} onClick={() => onAdd(effective)}>Add to mine</Button>
        </div>
      </div>
    </div>
  );
}
