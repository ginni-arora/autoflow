"use server";

import { getSubscriptionToken } from "@inngest/realtime";
import { inngest } from "@/inngest/client";

export async function fetchStripeTriggerRealtimeToken() {
  try {
    const token = await getSubscriptionToken(
      inngest,
      {
        channel: "stripe-trigger-execution",
        topics: ["status"],
      }
    );

    return token;
  } catch (error: unknown) {
    console.error("Failed to fetch Stripe trigger realtime token:", error);
    throw new Error("Unable to establish realtime connection for Stripe trigger");
  }
}