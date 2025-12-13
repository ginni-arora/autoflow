import { channel, topic } from "@inngest/realtime";

export const stripeTriggerChannel = channel("stripe-trigger-execution").addTopic(
  topic("status")
);