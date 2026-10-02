import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { PairForm } from "@/components/PairForm";

export default async function PairPage() {
  const { profile } = await requireUser();
  if (profile.household_id) redirect("/");
  return <PairForm name={profile.display_name} />;
}
