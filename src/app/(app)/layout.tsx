import { requireHousehold } from "@/lib/session";
import { BottomNav } from "@/components/BottomNav";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  await requireHousehold();
  return (
    <>
      <div className="flex-1 px-4 pb-28 pt-4">{children}</div>
      <BottomNav />
    </>
  );
}
