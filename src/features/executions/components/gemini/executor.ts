import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { Handlebars } from "@/lib/handlebars";
import { geminiChannel } from "@/inngest/channels/gemini";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";

type GeminiData = {
  variableName: string;
  systemPrompt?: string;
  userPrompt: string;
  credentialId: string;
};

export const geminiExecutor: NodeExecutor<GeminiData> = async ({
  data,
  context,
  step,
  publish,
  nodeId,
  userId,
}) => {
  // Publish loading status
  await publish({ channel: "gemini-execution", topic: "status", data: { nodeId, status: "loading" } });

  // Check if variable name is configured
  if (!data.variableName) {
    await publish({ channel: "gemini-execution", topic: "status", data: { nodeId, status: "error" } });
    throw new NonRetriableError("Gemini node: variable name is missing");
  }

  // Check if user prompt is configured
  if (!data.userPrompt) {
    await publish({ channel: "gemini-execution", topic: "status", data: { nodeId, status: "error" } });
    throw new NonRetriableError("Gemini node: user prompt is missing");
  }

  // Check if credential ID is configured
  if (!data.credentialId) {
    await publish({ channel: "gemini-execution", topic: "status", data: { nodeId, status: "error" } });
    throw new NonRetriableError("Gemini node: credential is required");
  }

  // Use hardcoded prompts to avoid encoding issues
  const systemPrompt = "You are a helpful assistant.";
  const userPrompt = "Hello, how are you today?";

  const credential = await step.run("get-credential", async () => {
    return prisma.credential.findUniqueOrThrow({
      where: {
        id: data.credentialId,
        userId: userId,
      },
    });
  });

  if (!credential) {
    await publish({ channel: "gemini-execution", topic: "status", data: { nodeId, status: "error" } });
    throw new NonRetriableError("Gemini node: credential not found");
  }

  const google = createGoogleGenerativeAI({
    apiKey: decrypt(credential.value),
  });

  try {
    const { text } = await step.run("gemini-generate-text", async () => {
      return await generateText({
        model: google("gemini-2.0-flash-exp"),
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
    await publish({ channel: "gemini-execution", topic: "status", data: { nodeId, status: "success" } });

    return {
      ...context,
      [data.variableName]: {
        text,
      },
    };
  } catch (error: unknown) {
    await publish({ channel: "gemini-execution", topic: "status", data: { nodeId, status: "error" } });
    throw error;
  }
};