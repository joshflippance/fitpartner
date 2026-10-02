import { requireHousehold } from "@/lib/session";
import { Logger } from "@/components/Logger";

export default async function LogPage() {
  const { userId, household } = await requireHousehold();
  return <Logger userId={userId} householdId={household.id} />;
}
