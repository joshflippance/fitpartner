import { requireHousehold } from "@/lib/session";
import { ActiveSession } from "@/components/lift/ActiveSession";

export default async function SessionPage(props: PageProps<"/lift/session/[id]">) {
  const { id } = await props.params;
  const { userId } = await requireHousehold();
  return <ActiveSession key={id} workoutId={id} userId={userId} />;
}
