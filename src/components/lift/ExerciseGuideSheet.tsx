"use client";

import { guideFor, howToVideoUrl } from "@/lib/exercise-guides";

/** Small start-position photo for list rows; renders nothing when the exercise has no guide. */
export function ExerciseThumb({ name }: { name: string }) {
  const g = guideFor(name);
  if (!g) return <span className="size-11 shrink-0 rounded-xl bg-surface-2" aria-hidden />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={g.images[0]} alt="" loading="lazy" className="size-11 shrink-0 rounded-xl bg-surface-2 object-cover" />
  );
}

/** How-to sheet: start and end photos, steps, and a YouTube search. */
export function ExerciseGuideSheet({ name, onClose }: { name: string; onClose: () => void }) {
  const g = guideFor(name);
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="guide-title" onClick={onClose}>
      <div className="max-h-[88vh] w-full max-w-md space-y-4 overflow-y-auto rounded-3xl border border-line bg-surface p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <h2 id="guide-title" className="text-lg font-semibold">{name}</h2>
          <button onClick={onClose} className="text-sm text-muted">Done</button>
        </div>

        {g ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              {g.images.map((src, i) => (
                <figure key={src} className="space-y-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`${name}, ${i === 0 ? "start" : "end"} position`} className="aspect-[4/3] w-full rounded-2xl bg-surface-2 object-cover" />
                  <figcaption className="text-center text-xs text-muted">{i === 0 ? "Start" : "End"}</figcaption>
                </figure>
              ))}
            </div>
            <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed">
              {g.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </>
        ) : (
          <p className="text-sm text-muted">No photos for this exercise yet. The video search below works for any exercise.</p>
        )}

        <a
          href={howToVideoUrl(name)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-you/40 px-4 py-3 text-sm font-medium text-you"
        >
          ▶ Watch how-to videos on YouTube
        </a>
        {g && <p className="text-center text-[11px] text-muted">Photos and steps: Free Exercise DB, public domain</p>}
      </div>
    </div>
  );
}
