import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { Handlebars } from "@/lib/handlebars";
import { openaiChannel } from "@/inngest/channels/openai";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";

type OpenAIData = {
  variableName: string;
  systemPrompt?: string;
  userPrompt: string;
  credentialId: string;
};

export const openaiExecutor: NodeExecutor<OpenAIData> = async ({
  data,
  context,
  step,
  publish,
  nodeId,
  userId,
}) => {
  // Publish loading status
  await publish({ channel: "openai-execution", topic: "status", data: { nodeId, status: "loading" } });

  // Check if variable name is configured
  if (!data.variableName) {
    await publish({ channel: "openai-execution", topic: "status", data: { nodeId, status: "error" } });
    throw new NonRetriableError("OpenAI node: variable name is missing");
  }

  // Check if user prompt is configured
  if (!data.userPrompt) {
    await publish({ channel: "openai-execution", topic: "status", data: { nodeId, status: "error" } });
    throw new NonRetriableError("OpenAI node: user prompt is missing");
  }

  // Check if credential ID is configured
  if (!data.credentialId) {
    await publish({ channel: "openai-execution", topic: "status", data: { nodeId, status: "error" } });
    throw new NonRetriableError("OpenAI node: credential is required");
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
    await publish({ channel: "openai-execution", topic: "status", data: { nodeId, status: "error" } });
    throw new NonRetriableError("OpenAI node: credential not found");
  }

  const openai = createOpenAI({
    apiKey: decrypt(credential.value),
  });

  try {
    const { text } = await step.run("openai-generate-text", async () => {
      return await generateText({
        model: openai("gpt-4"),
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
    await publish({ channel: "openai-execution", topic: "status", data: { nodeId, status: "success" } });

    return {
      ...context,
      [data.variableName]: {
        text,
      },
    };
  } catch (error: unknown) {
    await publish({ channel: "openai-execution", topic: "status", data: { nodeId, status: "error" } });
    throw error;
  }
};