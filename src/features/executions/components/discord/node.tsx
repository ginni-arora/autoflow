"use client";

import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { DiscordDialogue } from "./dialogue";
import { fetchDiscordRealtimeToken } from "./actions";
import { discordChannelName } from "@/inngest/channels/discord";

export interface DiscordNodeData {
  variableName: string;
  webhookUrl: string;
  content: string;
  username?: string;
}

export const DiscordNode = () => {
  return (
    <BaseExecutionNode<DiscordNodeData>
      type="DISCORD"
      title="Discord"
      icon="/logos/discord.svg"
      dialogue={DiscordDialogue}
      getDescription={(data) => {
        if (data.content) {
          return `Send ${data.content.slice(0, 50)}...`;
        }
        return "Not configured";
      }}
      channelName={discordChannelName}
      fetchRealtimeToken={fetchDiscordRealtimeToken}
    />
  );
};