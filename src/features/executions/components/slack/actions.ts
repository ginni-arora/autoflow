import { slackChannel } from "@/inngest/channels/slack";

export const slackToken = "slack-token";

export const fetchSlackRealtimeToken = () => {
  return slackToken;
};