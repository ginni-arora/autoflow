"use server";

import { getSubscriptionToken } from "@inngest/realtime";
import { inngest } from "@/inngest/client";

export async function fetchManualTriggerRealtimeToken() {
  const token = await getSubscriptionToken(
    inngest,
    {
      channel: "manual-trigger-execution",
      topics: ["status"],
    }
  );

  return token;
}