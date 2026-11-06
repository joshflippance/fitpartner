import guides from "./exercise-guides.json";

/** Photos and steps for a starter exercise, from Free Exercise DB (public domain). */
export interface ExerciseGuide {
  slug: string;
  images: string[];
  steps: string[];
  source: string;
}

const byName = new Map(Object.entries(guides as Record<string, ExerciseGuide>).map(([name, g]) => [name.toLowerCase(), g]));

/** The guide for an exercise by name, ignoring case. Custom exercises usually have none. */
export function guideFor(name: string): ExerciseGuide | undefined {
  return byName.get(name.trim().toLowerCase());
}

/** A YouTube search for how to do the exercise. Works for every exercise, custom ones included. */
export function howToVideoUrl(name: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`how to ${name.trim()} exercise form`)}`;
}
