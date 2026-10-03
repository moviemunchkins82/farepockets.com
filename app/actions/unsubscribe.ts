"use server";

import { unsubscribeByToken } from "@/lib/db/queries/subscribers";

export interface UnsubscribeState {
  status: "idle" | "done" | "error";
  message: string;
}

const TOKEN = /^[A-Za-z0-9_-]{20,64}$/;

export async function unsubscribe(_prev: UnsubscribeState, formData: FormData): Promise<UnsubscribeState> {
  const token = String(formData.get("token") ?? "");
  if (!TOKEN.test(token)) {
    return { status: "error", message: "This unsubscribe link isn't valid. Please use the link from one of our emails." };
  }
  try {
    const found = await unsubscribeByToken(token);
    return found
      ? { status: "done", message: "You're unsubscribed. We won't send you any more deal alerts." }
      : { status: "error", message: "We couldn't find that subscription. It may already have been removed." };
  } catch (error) {
    console.error("unsubscribe failed", error);
    return { status: "error", message: "Something went wrong. Please try again in a moment." };
  }
}
