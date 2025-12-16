import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { Handlebars } from "@/lib/handlebars";
import { discordChannel } from "@/inngest/channels/discord";
import ky from "ky";
import { decode } from "html-entities";

type DiscordData = {
  variableName: string;
  webhookUrl: string;
  content: string;
  username?: string;
};

export const discordExecutor: NodeExecutor<DiscordData> = async ({
  data,
  context,
  step,
  publish,
  nodeId,
}) => {
  // Publish loading status
  await publish({ channel: "discord-execution", topic: "status", data: { nodeId, status: "loading" } });

  // Check if variable name is configured
  if (!data.variableName) {
    await publish({ channel: "discord-execution", topic: "status", data: { nodeId, status: "error" } });
    throw new NonRetriableError("Discord node: variable name is missing");
  }

  // Check if webhook URL is configured
  if (!data.webhookUrl) {
    await publish({ channel: "discord-execution", topic: "status", data: { nodeId, status: "error" } });
    throw new NonRetriableError("Discord node: webhook URL is required");
  }

  // Check if content is configured
  if (!data.content) {
    await publish({ channel: "discord-execution", topic: "status", data: { nodeId, status: "error" } });
    throw new NonRetriableError("Discord node: message content is required");
  }

  // Compile templates
  const rawContent = Handlebars.compile(data.content)(context);
  const content = decode(rawContent);
  
  const username = data.username ? decode(Handlebars.compile(data.username)(context)) : undefined;

  try {
    const result = await step.run("discord-webhook", async () => {
      if (!data.variableName) {
        throw new NonRetriableError("Discord node: variable name is missing");
      }
      
      if (!data.webhookUrl) {
        throw new NonRetriableError("Discord node: webhook URL is required");
      }

      return await ky.post(data.webhookUrl, {
        json: {
          content: content.slice(0, 2000),
          ...(username && { username }),
        },
      });
    });

    // Publish success status
    await publish({ channel: "discord-execution", topic: "status", data: { nodeId, status: "success" } });

    return {
      ...context,
      [data.variableName]: {
        messageContent: content.slice(0, 2000),
      },
    };
  } catch (error: unknown) {
    await publish({ channel: "discord-execution", topic: "status", data: { nodeId, status: "error" } });
    throw error;
  }
};