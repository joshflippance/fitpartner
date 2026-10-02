"use client";

import { useState } from "react";
import { leaveHousehold } from "@/app/(app)/settings/actions";
import { Button, Input } from "./ui";

export function LeaveHousehold({ householdName, isLastMember }: { householdName: string; isLastMember: boolean }) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const canLeave = !isLastMember || typed.trim() === householdName;

  if (!open) {
    return (
      <Button type="button" variant="danger" className="w-full" onClick={() => setOpen(true)}>
        Leave household
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/60 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="leave-title">
      <div className="w-full max-w-md space-y-4 rounded-3xl border border-line bg-surface p-5">
        <h2 id="leave-title" className="text-lg font-semibold">Leave {householdName}?</h2>
        {isLastMember ? (
          <>
            <p className="text-sm text-muted">
              You&apos;re the only member. Leaving <span className="text-danger">permanently deletes</span> the household and every
              meal, weight and workout logged in it. This can&apos;t be undone.
            </p>
            <label className="block text-sm text-muted">
              Type <span className="font-medium text-text">{householdName}</span> to confirm
              <Input value={typed} onChange={(e) => setTyped(e.target.value)} className="mt-1.5" autoComplete="off" />
            </label>
          </>
        ) : (
          <p className="text-sm text-muted">
            You&apos;ll stop seeing your partner&apos;s data and they&apos;ll stop seeing yours. Your past entries stay with the household.
            You can join again with the pairing code.
          </p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="ghost" onClick={() => { setOpen(false); setTyped(""); }}>
            Cancel
          </Button>
          <form action={leaveHousehold}>
            <Button type="submit" variant="danger" disabled={!canLeave} className="w-full">
              Leave
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
