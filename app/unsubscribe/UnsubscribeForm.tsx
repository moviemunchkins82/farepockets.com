"use client";

import { useActionState } from "react";
import { unsubscribe, type UnsubscribeState } from "@/app/actions/unsubscribe";

const initialState: UnsubscribeState = { status: "idle", message: "" };

// A button rather than unsubscribing on page load: email security scanners open
// links automatically and would otherwise unsubscribe people by accident.
export default function UnsubscribeForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(unsubscribe, initialState);

  if (state.status === "done") {
    return <p role="status">{state.message}</p>;
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="token" value={token} />
      <p>Click below to stop receiving FarePockets deal alerts.</p>
      <button type="submit" className="button" disabled={pending} style={{ marginTop: 16 }}>
        {pending ? "Unsubscribing…" : "Unsubscribe"}
      </button>
      <p aria-live="polite" style={{ marginTop: 12, color: "var(--accent)", fontWeight: 600 }}>
        {state.status === "error" ? state.message : ""}
      </p>
    </form>
  );
}
