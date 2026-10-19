"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { EQUIPMENT } from "@/lib/lifting";
import { loadLocations } from "@/lib/lift-data";
import type { Location } from "@/lib/types";
import { Button, Card, Input } from "../ui";

const PRESETS: Record<string, string[]> = {
  "Full gym": EQUIPMENT.map((e) => e.id),
  "Dumbbells only": ["dumbbells"],
  "Home basics": ["dumbbells", "bench", "pull_up_bar", "bands"],
};

export function LocationsManager({ userId, householdId }: { userId: string; householdId: string }) {
  const supabase = useMemo(() => createClient(), []);
  const [locations, setLocations] = useState<Location[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const reload = async () => setLocations(await loadLocations(supabase, householdId));

  useEffect(() => {
    let cancelled = false;
    loadLocations(supabase, householdId)
      .then((l) => !cancelled && setLocations(l))
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [supabase, householdId]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const { error } = await supabase
      .from("locations")
      .insert({ household_id: householdId, name: name.trim(), equipment: [], created_by: userId });
    if (error) return setError(error.message.includes("duplicate") ? "You already have a location with that name." : error.message);
    setName("");
    setError(null);
    await reload();
  }

  async function save(loc: Location, equipment: string[], newName: string) {
    const { error } = await supabase.from("locations").update({ equipment, name: newName.trim() || loc.name }).eq("id", loc.id);
    if (error) return setError(error.message);
    setSavedId(loc.id);
    setTimeout(() => setSavedId(null), 1500);
    await reload();
  }

  async function remove(loc: Location) {
    const { error } = await supabase.from("locations").delete().eq("id", loc.id);
    if (error) return setError(error.message);
    await reload();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-1">
        <Link href="/lift" className="text-xl text-muted" aria-label="Back">‹</Link>
        <h1 className="text-2xl font-semibold tracking-tight">Locations</h1>
      </div>
      <p className="px-1 text-sm text-muted">Shared by both of you. Exercises filter to what each place has.</p>

      {error && <p className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>}

      {locations.map((loc) => (
        <LocationCard key={loc.id} loc={loc} saved={savedId === loc.id} onSave={save} onDelete={remove} />
      ))}

      <Card>
        <form onSubmit={add} className="flex gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Home, Gym, Cottage…" maxLength={40} />
          <Button type="submit" disabled={!name.trim()}>Add</Button>
        </form>
      </Card>
    </div>
  );
}

function LocationCard({
  loc,
  saved,
  onSave,
  onDelete,
}: {
  loc: Location;
  saved: boolean;
  onSave: (loc: Location, equipment: string[], name: string) => void;
  onDelete: (loc: Location) => void;
}) {
  const [equipment, setEquipment] = useState<string[]>(loc.equipment);
  const [name, setName] = useState(loc.name);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const dirty = name !== loc.name || equipment.slice().sort().join() !== loc.equipment.slice().sort().join();

  const toggle = (id: string) => setEquipment((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  return (
    <Card>
      <Input value={name} onChange={(e) => setName(e.target.value)} className="mb-4 font-medium" maxLength={40} aria-label="Location name" />
      <p className="mb-2 text-xs text-muted">Quick fill</p>
      <div className="mb-4 flex flex-wrap gap-2">
        {Object.entries(PRESETS).map(([label, ids]) => (
          <button key={label} onClick={() => setEquipment(ids)} className="rounded-full border border-line px-3 py-1 text-xs text-muted">
            {label}
          </button>
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-2">
        {EQUIPMENT.map((e) => (
          <li key={e.id}>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-surface-2 px-3 py-2.5 text-sm">
              <input type="checkbox" checked={equipment.includes(e.id)} onChange={() => toggle(e.id)} className="size-4 accent-[var(--you)]" />
              {e.label}
            </label>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-muted">Bodyweight exercises are always available.</p>
      <div className="mt-4 flex items-center justify-between gap-3">
        {confirmDelete ? (
          <span className="flex items-center gap-3 text-sm">
            <button onClick={() => onDelete(loc)} className="font-medium text-danger">Delete {loc.name}</button>
            <button onClick={() => setConfirmDelete(false)} className="text-muted">Cancel</button>
          </span>
        ) : (
          <button onClick={() => setConfirmDelete(true)} className="text-sm text-muted">Delete</button>
        )}
        <Button variant="ghost" disabled={!dirty} onClick={() => onSave(loc, equipment, name)}>
          {saved ? "Saved" : "Save"}
        </Button>
      </div>
    </Card>
  );
}
