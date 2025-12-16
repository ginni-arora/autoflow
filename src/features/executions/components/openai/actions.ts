"use server";

import { getSubscriptionToken } from "@inngest/realtime";
import { inngest } from "@/inngest/client";

export async function fetchOpenAIRealtimeToken() {
  const token = await getSubscriptionToken(
    inngest,
    {
      channel: "openai-execution",
      topics: ["status"],
    }
  );

  return token;
}