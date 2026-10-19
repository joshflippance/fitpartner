import { requireHousehold } from "@/lib/session";
import { loadPartner } from "@/lib/partner";
import { RoutineEditor } from "@/components/lift/RoutineEditor";

export default async function RoutinePage(props: PageProps<"/lift/routines/[id]">) {
  const { id } = await props.params;
  const { supabase, userId, household } = await requireHousehold();
  const partner = await loadPartner(supabase, household.id, userId);
  return (
    <RoutineEditor
      key={id}
      routineId={id === "new" ? "new" : id}
      userId={userId}
      householdId={household.id}
      partnerName={partner?.display_name ?? null}
    />
  );
}
