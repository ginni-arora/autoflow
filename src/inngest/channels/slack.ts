import { channel, topic } from "@inngest/realtime";

export const slackChannelName = "slack-execution";

export const slackChannel = channel("slack-execution").addTopic(
  topic("status")
);