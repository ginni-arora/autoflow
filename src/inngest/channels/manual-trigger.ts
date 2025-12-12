import { channel, topic } from "@inngest/realtime";

export const manualTriggerChannel = channel("manual-trigger-execution").addTopic(
  topic("status")
);