import { channel, topic } from "@inngest/realtime";

export const geminiChannel = channel("gemini-execution").addTopic(
  topic("status")
);