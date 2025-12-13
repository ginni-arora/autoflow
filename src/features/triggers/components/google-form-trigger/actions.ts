"use server";

import { getSubscriptionToken } from "@inngest/realtime";
import { inngest } from "@/inngest/client";

export async function fetchGoogleFormTriggerRealtimeToken() {
  try {
    const token = await getSubscriptionToken(
      inngest,
      {
        channel: "google-form-trigger-execution",
        topics: ["status"],
      }
    );

    return token;
  } catch (error: unknown) {
    console.error("Failed to fetch Google Form trigger realtime token:", error);
    throw new Error("Unable to establish realtime connection for Google Form trigger");
  }
}