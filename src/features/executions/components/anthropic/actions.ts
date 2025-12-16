"use server";

import { getSubscriptionToken } from "@inngest/realtime";
import { inngest } from "@/inngest/client";

export async function fetchAnthropicRealtimeToken() {
  const token = await getSubscriptionToken(
    inngest,
    {
      channel: "anthropic-execution",
      topics: ["status"],
    }
  );

  return token;
}