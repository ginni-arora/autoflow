"use server";

import { getSubscriptionToken } from "@inngest/realtime";
import { inngest } from "@/inngest/client";

export async function fetchGeminiRealtimeToken() {
  const token = await getSubscriptionToken(
    inngest,
    {
      channel: "gemini-execution",
      topics: ["status"],
    }
  );

  return token;
}