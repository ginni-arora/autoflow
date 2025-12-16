import { channel, topic } from "@inngest/realtime";

export const openaiChannel = channel("openai-execution").addTopic(
  topic("status")
);