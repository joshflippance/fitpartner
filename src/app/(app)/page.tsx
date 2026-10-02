import { requireHousehold } from "@/lib/session";
import { Dashboard } from "@/components/Dashboard";

export default async function HomePage() {
  const { userId, household } = await requireHousehold();
  return <Dashboard userId={userId} householdId={household.id} pairCode={household.pair_code} />;
}
