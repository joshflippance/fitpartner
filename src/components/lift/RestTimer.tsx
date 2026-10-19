"use client";

import { useEffect, useState } from "react";

/** Countdown banner above the bottom nav. Vibrates once when rest is over. */
export function RestTimer({ until, onAdd, onDone }: { until: number; onAdd: (seconds: number) => void; onDone: () => void }) {
  const [now, setNow] = useState(() => Date.now());
  const remaining = Math.max(0, Math.ceil((until - now) / 1000));

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (remaining > 0) return;
    try {
      navigator.vibrate?.([200, 100, 200]);
    } catch {}
    const id = setTimeout(onDone, 4000);
    return () => clearTimeout(id);
  }, [remaining, onDone]);

  const mm = Math.floor(remaining / 60);
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div
      role="timer"
      aria-live="polite"
      className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-20 mx-auto w-full max-w-md px-4"
    >
      <div
        className={`flex items-center justify-between rounded-2xl border px-4 py-3 shadow-lg ${
          remaining === 0 ? "border-you bg-you text-black" : "border-line bg-surface-2"
        }`}
      >
        <span className="text-sm">{remaining === 0 ? "Rest done. Next set." : "Rest"}</span>
        <span className="text-2xl font-semibold tabular-nums">
          {mm}:{ss}
        </span>
        <span className="flex gap-3 text-sm">
          {remaining > 0 && (
            <button onClick={() => onAdd(30)} className="text-muted">
              +30s
            </button>
          )}
          <button onClick={onDone} className={remaining === 0 ? "font-medium" : "text-muted"}>
            {remaining === 0 ? "OK" : "Skip"}
          </button>
        </span>
      </div>
    </div>
  );
}
