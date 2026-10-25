"use client";

import { useState } from "react";
import type { SavedMeal } from "@/lib/types";
import { Button, Field, Input } from "./ui";

type Values = { name: string; calories: number; protein_g: number };

/** Add, edit and remove the household's saved meals. Either partner can change any of them. */
export function SavedMealsSheet({
  saved,
  busy,
  onCreate,
  onUpdate,
  onRemove,
  onClose,
}: {
  saved: SavedMeal[];
  busy: boolean;
  onCreate: (v: Values) => Promise<boolean>;
  onUpdate: (id: string, v: Values) => Promise<boolean>;
  onRemove: (id: string) => Promise<boolean>;
  onClose: () => void;
}) {
  const [editing, setEditing] = useState<string | "new" | null>(saved.length === 0 ? "new" : null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  function read(form: HTMLFormElement): Values {
    const f = new FormData(form);
    return { name: String(f.get("name")).trim(), calories: Number(f.get("calories")), protein_g: Number(f.get("protein") || 0) };
  }

  async function submit(e: React.FormEvent<HTMLFormElement>, id: string | "new") {
    e.preventDefault();
    const v = read(e.currentTarget);
    const ok = id === "new" ? await onCreate(v) : await onUpdate(id, v);
    if (ok) setEditing(null);
  }

  const form = (id: string | "new", m?: SavedMeal) => (
    <form key={id} onSubmit={(e) => void submit(e, id)} className="space-y-3 rounded-2xl bg-surface-2 p-3">
      <Field label="Name">
        <Input name="name" required maxLength={60} autoComplete="off" defaultValue={m?.name} placeholder="Chicken and rice" autoFocus />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Calories per serving">
          <Input name="calories" type="number" inputMode="numeric" min={0} max={9999} required defaultValue={m?.calories} />
        </Field>
        <Field label="Protein (g)">
          <Input name="protein" type="number" inputMode="decimal" step="0.1" min={0} max={999} defaultValue={m?.protein_g} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
        <Button type="submit" disabled={busy}>{id === "new" ? "Save meal" : "Save changes"}</Button>
      </div>
    </form>
  );

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="saved-title">
      <div className="max-h-[85vh] w-full max-w-md space-y-4 overflow-y-auto rounded-3xl border border-line bg-surface p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="saved-title" className="text-lg font-semibold">Saved meals</h2>
            <p className="text-sm text-muted">Shared with your partner. Either of you can change them.</p>
          </div>
          <button onClick={onClose} className="text-sm text-muted" aria-label="Close">Done</button>
        </div>

        {editing === "new" ? (
          form("new")
        ) : (
          <Button type="button" variant="ghost" className="w-full" onClick={() => setEditing("new")}>New saved meal</Button>
        )}

        <ul className="divide-y divide-line text-sm">
          {saved.map((m) =>
            editing === m.id ? (
              <li key={m.id} className="py-2">{form(m.id, m)}</li>
            ) : (
              <li key={m.id} className="flex items-center justify-between gap-3 py-2.5">
                <button onClick={() => setEditing(m.id)} className="min-w-0 text-left hover:text-you" aria-label={`Edit ${m.name}`}>
                  <span className="block truncate">{m.name}</span>
                  <span className="text-xs text-muted tabular-nums">{m.calories} kcal · {m.protein_g}g</span>
                </button>
                {confirmRemove === m.id ? (
                  <span className="flex shrink-0 gap-3">
                    <button onClick={() => setConfirmRemove(null)} className="text-muted">Keep</button>
                    <button
                      disabled={busy}
                      onClick={() => void onRemove(m.id).then(() => setConfirmRemove(null))}
                      className="font-medium text-danger"
                    >
                      Remove
                    </button>
                  </span>
                ) : (
                  <button onClick={() => setConfirmRemove(m.id)} aria-label={`Remove ${m.name}`} className="shrink-0 text-muted hover:text-danger">✕</button>
                )}
              </li>
            ),
          )}
          {saved.length === 0 && editing !== "new" && <li className="py-2 text-muted">No saved meals yet.</li>}
        </ul>
      </div>
    </div>
  );
}
