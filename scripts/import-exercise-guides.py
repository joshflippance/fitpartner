"""Import photos and steps for the starter exercises from Free Exercise DB (public domain, Unlicense).

Usage: python3 scripts/import-exercise-guides.py /path/to/free-exercise-db

Writes:
  public/exercises/<slug>-0.webp, <slug>-1.webp   start and end position photos, 480 px wide
  src/lib/exercise-guides.json                    { starter name: { slug, images, steps, source } }

Rerun after changing MATCHES. Source: https://github.com/yuhonas/free-exercise-db
"""

import json
import re
import sys
from pathlib import Path

from PIL import Image

# Starter exercise name (as seeded in the lifting migration) -> Free Exercise DB id.
MATCHES = {
    "Barbell Bench Press": "Barbell_Bench_Press_-_Medium_Grip",
    "Incline Dumbbell Press": "Incline_Dumbbell_Press",
    "Dumbbell Bench Press": "Dumbbell_Bench_Press",
    "Push-up": "Pushups",
    "Cable Fly": "Cable_Crossover",
    "Chest Press Machine": "Leverage_Chest_Press",
    "Pull-up": "Pullups",
    "Lat Pulldown": "Wide-Grip_Lat_Pulldown",
    "Barbell Row": "Bent_Over_Barbell_Row",
    "One-arm Dumbbell Row": "One-Arm_Dumbbell_Row",
    "Seated Cable Row": "Seated_Cable_Rows",
    "Deadlift": "Barbell_Deadlift",
    "Overhead Press": "Standing_Military_Press",
    "Dumbbell Shoulder Press": "Dumbbell_Shoulder_Press",
    "Lateral Raise": "Side_Lateral_Raise",
    "Face Pull": "Face_Pull",
    "Barbell Curl": "Barbell_Curl",
    "Dumbbell Curl": "Dumbbell_Bicep_Curl",
    "Hammer Curl": "Hammer_Curls",
    "Cable Curl": "Standing_Biceps_Cable_Curl",
    "Triceps Pushdown": "Triceps_Pushdown",
    "Overhead Triceps Extension": "Standing_Dumbbell_Triceps_Extension",
    "Dip": "Dips_-_Triceps_Version",
    "Close-grip Bench Press": "Close-Grip_Barbell_Bench_Press",
    "Back Squat": "Barbell_Squat",
    "Goblet Squat": "Goblet_Squat",
    "Leg Press": "Leg_Press",
    "Bulgarian Split Squat": "Split_Squat_with_Dumbbells",
    "Leg Extension": "Leg_Extensions",
    "Walking Lunge": "Dumbbell_Lunges",
    "Romanian Deadlift": "Romanian_Deadlift",
    "Dumbbell Romanian Deadlift": "Stiff-Legged_Dumbbell_Deadlift",
    "Leg Curl": "Lying_Leg_Curls",
    "Hip Thrust": "Barbell_Hip_Thrust",
    "Glute Bridge": "Butt_Lift_Bridge",
    "Cable Kickback": "One-Legged_Cable_Kickback",
    "Standing Calf Raise": "Standing_Dumbbell_Calf_Raise",
    "Seated Calf Raise": "Seated_Calf_Raise",
    "Plank": "Plank",
    "Hanging Leg Raise": "Hanging_Leg_Raise",
    "Cable Crunch": "Cable_Crunch",
    "Kettlebell Swing": "One-Arm_Kettlebell_Swings",
}

# Steps written for FitPartner where the source has none.
STEP_OVERRIDES = {
    "Kettlebell Swing": [
        "Stand with feet a little wider than your hips, the kettlebell on the floor just in front of you.",
        "Hinge at the hips with a flat back, grip the handle with both hands and hike the bell back between your legs.",
        "Drive your hips forward hard and squeeze your glutes so the bell floats up to chest height. Your arms guide it; they do not lift it.",
        "Let the bell fall back between your legs, hinging at the hips as it comes down, and go straight into the next rep.",
        "Keep your back flat and your core braced the whole time. To stop, let the bell swing back and set it down in front of you.",
    ],
}

WIDTH = 480


def slugify(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def main(src: Path) -> None:
    root = Path(__file__).resolve().parent.parent
    data = {e["id"]: e for e in json.loads((src / "dist" / "exercises.json").read_text())}
    out_dir = root / "public" / "exercises"
    out_dir.mkdir(parents=True, exist_ok=True)
    guides = {}
    for name, source_id in MATCHES.items():
        entry = data[source_id]
        slug = slugify(name)
        images = []
        for i, rel in enumerate(entry["images"][:2]):
            img = Image.open(src / "exercises" / rel).convert("RGB")
            img.thumbnail((WIDTH, WIDTH * 2))
            dest = out_dir / f"{slug}-{i}.webp"
            img.save(dest, "WEBP", quality=72, method=6)
            images.append(f"/exercises/{dest.name}")
        guides[name] = {"slug": slug, "images": images, "steps": STEP_OVERRIDES.get(name) or entry["instructions"], "source": source_id}
    (root / "src" / "lib" / "exercise-guides.json").write_text(json.dumps(guides, indent=2, ensure_ascii=False) + "\n")
    print(f"{len(guides)} guides, {sum(len(g['images']) for g in guides.values())} images")


if __name__ == "__main__":
    main(Path(sys.argv[1]))
