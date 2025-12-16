import { channel, topic } from "@inngest/realtime";

export const discordChannelName = "discord-execution";

export const discordChannel = channel("discord-execution").addTopic(
  topic("status")
);