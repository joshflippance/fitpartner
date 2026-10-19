import { requireHousehold } from "@/lib/session";
import { ExerciseLibrary } from "@/components/lift/ExerciseLibrary";

export default async function ExercisesPage() {
  const { userId, household } = await requireHousehold();
  return <ExerciseLibrary userId={userId} householdId={household.id} />;
}
