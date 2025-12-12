"use server";

import { getSubscriptionToken } from "@inngest/realtime";
import { inngest } from "@/inngest/client";

export async function fetchHttpRequestRealtimeToken() {
  const token = await getSubscriptionToken(
    inngest,
    {
      channel: "http-request-execution",
      topics: ["status"],
    }
  );

  return token;
}