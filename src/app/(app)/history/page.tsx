import { requireHousehold } from "@/lib/session";
import { History } from "@/components/History";

export default async function HistoryPage() {
  const { userId, household } = await requireHousehold();
  return <History userId={userId} householdId={household.id} />;
}
