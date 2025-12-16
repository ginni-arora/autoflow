"use client";

import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { SlackDialogue } from "./dialogue";
import { fetchSlackRealtimeToken } from "./actions";
import { slackChannelName } from "@/inngest/channels/slack";

export interface SlackNodeData {
  variableName: string;
  webhookUrl: string;
  content: string;
}

export const SlackNode = () => {
  return (
    <BaseExecutionNode<SlackNodeData>
      type="SLACK"
      title="Slack"
      icon="/logos/slack.svg"
      dialogue={SlackDialogue}
      getDescription={(data) => {
        if (data.content) {
          return `Send ${data.content.slice(0, 50)}...`;
        }
        return "Not configured";
      }}
      channelName={slackChannelName}
      fetchRealtimeToken={fetchSlackRealtimeToken}
    />
  );
};