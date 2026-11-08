import { requireHousehold } from "@/lib/session";
import { loadPartner } from "@/lib/partner";
import { ProgramSettings } from "@/components/lift/ProgramSettings";

export default async function ProgramPage() {
  const { supabase, userId, household } = await requireHousehold();
  const partner = await loadPartner(supabase, household.id, userId);
  return <ProgramSettings userId={userId} householdId={household.id} partnerName={partner?.display_name ?? null} />;
}
