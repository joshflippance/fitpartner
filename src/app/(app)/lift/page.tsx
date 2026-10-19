import { requireHousehold } from "@/lib/session";
import { loadPartner } from "@/lib/partner";
import { LiftHome } from "@/components/lift/LiftHome";

export default async function LiftPage() {
  const { supabase, userId, household } = await requireHousehold();
  const partner = await loadPartner(supabase, household.id, userId);
  return <LiftHome userId={userId} householdId={household.id} partner={partner} />;
}
