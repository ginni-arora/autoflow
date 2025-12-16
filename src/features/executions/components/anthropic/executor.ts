import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { Handlebars } from "@/lib/handlebars";
import { anthropicChannel } from "@/inngest/channels/anthropic";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";

type AnthropicData = {
  variableName: string;
  systemPrompt?: string;
  userPrompt: string;
  credentialId: string;
};

export const anthropicExecutor: NodeExecutor<AnthropicData> = async ({
  data,
  context,
  step,
  publish,
  nodeId,
  userId,
}) => {
  // Publish loading status
  await publish({ channel: "anthropic-execution", topic: "status", data: { nodeId, status: "loading" } });

  // Check if variable name is configured
  if (!data.variableName) {
    await publish({ channel: "anthropic-execution", topic: "status", data: { nodeId, status: "error" } });
    throw new NonRetriableError("Anthropic node: variable name is missing");
  }

  // Check if user prompt is configured
  if (!data.userPrompt) {
    await publish({ channel: "anthropic-execution", topic: "status", data: { nodeId, status: "error" } });
    throw new NonRetriableError("Anthropic node: user prompt is missing");
  }

  // Check if credential ID is configured
  if (!data.credentialId) {
    await publish({ channel: "anthropic-execution", topic: "status", data: { nodeId, status: "error" } });
    throw new NonRetriableError("Anthropic node: credential is required");
  }

  // Compile templates
  const systemPrompt = Handlebars.compile(data.systemPrompt || "You are a helpful assistant")(context);
  const userPrompt = Handlebars.compile(data.userPrompt)(context);

  const credential = await step.run("get-credential", async () => {
    return prisma.credential.findUniqueOrThrow({
      where: {
        id: data.credentialId,
        userId: userId,
      },
    });
  });

  if (!credential) {
    await publish({ channel: "anthropic-execution", topic: "status", data: { nodeId, status: "error" } });
    throw new NonRetriableError("Anthropic node: credential not found");
  }

  const anthropic = createAnthropic({
    apiKey: decrypt(credential.value),
  });

  try {
    const { text } = await step.run("anthropic-generate-text", async () => {
      return await generateText({
        model: anthropic("claude-3-5-sonnet-20241022"),
        system: systemPrompt,
        prompt: userPrompt,
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      });
    });

    // Publish success status
    await publish({ channel: "anthropic-execution", topic: "status", data: { nodeId, status: "success" } });

    return {
      ...context,
      [data.variableName]: {
        text,
      },
    };
  } catch (error: unknown) {
    await publish({ channel: "anthropic-execution", topic: "status", data: { nodeId, status: "error" } });
    throw error;
  }
};