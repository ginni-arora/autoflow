import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { Handlebars } from "@/lib/handlebars";
import { slackChannel } from "@/inngest/channels/slack";
import ky from "ky";
import { decode } from "html-entities";

type SlackData = {
  variableName: string;
  webhookUrl: string;
  content: string;
};

export const slackExecutor: NodeExecutor<SlackData> = async ({
  data,
  context,
  step,
  publish,
  nodeId,
}) => {
  // Publish loading status
  await publish({ channel: "slack-execution", topic: "status", data: { nodeId, status: "loading" } });

  // Check if variable name is configured
  if (!data.variableName) {
    await publish({ channel: "slack-execution", topic: "status", data: { nodeId, status: "error" } });
    throw new NonRetriableError("Slack node: variable name is missing");
  }

  // Check if webhook URL is configured
  if (!data.webhookUrl) {
    await publish({ channel: "slack-execution", topic: "status", data: { nodeId, status: "error" } });
    throw new NonRetriableError("Slack node: webhook URL is required");
  }

  // Check if content is configured
  if (!data.content) {
    await publish({ channel: "slack-execution", topic: "status", data: { nodeId, status: "error" } });
    throw new NonRetriableError("Slack node: message content is required");
  }

  // Compile templates
  const rawContent = Handlebars.compile(data.content)(context);
  const content = decode(rawContent);

  try {
    const result = await step.run("slack-webhook", async () => {
      if (!data.variableName) {
        throw new NonRetriableError("Slack node: variable name is missing");
      }
      
      if (!data.webhookUrl) {
        throw new NonRetriableError("Slack node: webhook URL is required");
      }

      // The key depends on workflow config
      return await ky.post(data.webhookUrl, {
        json: {
          content: content,
        },
      });
    });

    // Publish success status
    await publish({ channel: "slack-execution", topic: "status", data: { nodeId, status: "success" } });

    return {
      ...context,
      [data.variableName]: {
        messageContent: content,
      },
    };
  } catch (error: unknown) {
    await publish({ channel: "slack-execution", topic: "status", data: { nodeId, status: "error" } });
    throw error;
  }
};