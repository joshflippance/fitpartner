import { requireHousehold } from "@/lib/session";
import { signOut } from "@/app/login/actions";
import { Button, Card, Field, Input } from "@/components/ui";
import { leaveHousehold, updateProfile } from "./actions";

export default async function SettingsPage() {
  const { profile, household } = await requireHousehold();

  return (
    <div className="space-y-4">
      <h1 className="px-1 text-2xl font-semibold tracking-tight">Settings</h1>

      <Card>
        <h2 className="mb-4 font-medium">Your targets</h2>
        <form action={updateProfile} className="space-y-4">
          <Field label="Display name">
            <Input name="display_name" defaultValue={profile.display_name} maxLength={40} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Calories / day">
              <Input name="calorie_target" type="number" inputMode="numeric" min={800} max={8000} defaultValue={profile.calorie_target} />
            </Field>
            <Field label="Protein (g) / day">
              <Input name="protein_target" type="number" inputMode="numeric" min={0} max={500} defaultValue={profile.protein_target} />
            </Field>
          </div>
          <Field label="Workouts / week (streak target)">
            <Input name="weekly_workout_target" type="number" inputMode="numeric" min={1} max={7} defaultValue={profile.weekly_workout_target} />
          </Field>
          <Field label="Weight unit">
            <select
              name="weight_unit"
              defaultValue={profile.weight_unit}
              className="h-12 w-full rounded-2xl border border-line bg-surface px-4 text-base text-text"
            >
              <option value="lb">Pounds (lb)</option>
              <option value="kg">Kilograms (kg)</option>
            </select>
          </Field>
          <Button type="submit" className="w-full">Save</Button>
        </form>
      </Card>

      <Card>
        <h2 className="font-medium">{household.name}</h2>
        <p className="mt-1 text-sm text-muted">Pairing code</p>
        <p className="mt-1 font-mono text-2xl tracking-[0.25em] text-you">{household.pair_code}</p>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <form action={signOut}>
          <Button type="submit" variant="ghost" className="w-full">Sign out</Button>
        </form>
        <form action={leaveHousehold}>
          <Button type="submit" variant="danger" className="w-full">Leave household</Button>
        </form>
      </div>
    </div>
  );
}
