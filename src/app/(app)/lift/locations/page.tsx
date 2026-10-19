import { requireHousehold } from "@/lib/session";
import { LocationsManager } from "@/components/lift/LocationsManager";

export default async function LocationsPage() {
  const { userId, household } = await requireHousehold();
  return <LocationsManager userId={userId} householdId={household.id} />;
}
