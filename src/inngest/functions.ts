
import prisma from "@/lib/db";
import { inngest } from "./client";
import { NonRetriableError } from "inngest";
import { topologicalSort } from "./utils";
import { getExecutor } from "@/features/executions/lib/executor-registry";
import { NodeType, ExecutionStatus } from "@prisma/client";
import { createId } from "@paralleldrive/cuid2";
import { httpRequestChannel } from "./channels/http-request";
import { manualTriggerChannel } from "./channels/manual-trigger";
import { googleFormTriggerChannel } from "./channels/google-form-trigger";
import { stripeTriggerChannel } from "./channels/stripe-trigger";
import { geminiChannel } from "./channels/gemini";
import { openaiChannel } from "./channels/openai";
import { anthropicChannel } from "./channels/anthropic";
import { discordChannel } from "./channels/discord";
import { slackChannel } from "./channels/slack";
import "@/lib/handlebars"; // Register global Handlebars helpers

export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    retries: process.env.NODE_ENV === "production" ? 3 : 0,
  },
  {
    event: "workflows/execute.workflow",
    channels: [httpRequestChannel, manualTriggerChannel, googleFormTriggerChannel, stripeTriggerChannel, geminiChannel, openaiChannel, anthropicChannel, discordChannel, slackChannel],
  },
  async ({ event, step, publish }) => {
    console.log("[Inngest] executeWorkflow triggered with event:", event);
    
    const workflowId = event.data.workflowId;
    if (!workflowId || !event.id) {
      console.error("[Inngest] Workflow ID or event ID is missing from event data");
      throw new Error("Workflow ID or event ID is missing");
    }
    
    console.log("[Inngest] Processing workflow:", workflowId);

    const userId = await step.run("find-user-id", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id: workflowId },
        select: { userId: true },
      });
      return workflow.userId;
    });

    await step.run("create-execution", async () => {
      return prisma.execution.create({
        data: {
          workflowId,
          inngestEventId: event.id,
          userId,
        },
      });
    });

    const sortedNodes = await step.run("prepare-workflow", async () => {
      const workflow = await prisma.workflow.findUnique({
        where: { id: workflowId },
        include: {
          nodes: true,
          connections: true,
        },
      });

      if (!workflow) {
        throw new NonRetriableError(`Workflow with ID ${workflowId} not found`);
      }

      return topologicalSort({
        nodes: workflow.nodes,
        connections: workflow.connections,
      });
    });

    // Initialize context with any initial data from the trigger
    let context = event.data.initialData || {};

    // Execute each node
    try {
      for (const node of sortedNodes) {
        const executor = getExecutor(node.type as NodeType);
        context = await executor({
          data: node.data as Record<string, unknown>,
          nodeId: node.id,
          context,
          step,
          publish,
          userId,
        });
      }

      // Update execution to success
      await step.run("update-execution-success", async () => {
        return prisma.execution.update({
          where: { inngestEventId: event.id },
          data: {
            status: ExecutionStatus.SUCCESS,
            completedAt: new Date(),
            output: context,
          },
        });
      });

      return {
        workflowId,
        result: context,
      };
    } catch (error) {
      // When execution fails, update all nodes to error status
      for (const node of sortedNodes) {
        const channelMap: Record<NodeType, string> = {
          [NodeType.HTTP_REQUEST]: "http-request-execution",
          [NodeType.GEMINI]: "gemini-execution",
          [NodeType.OPENAI]: "openai-execution", 
          [NodeType.ANTHROPIC]: "anthropic-execution",
          [NodeType.MANUAL_TRIGGER]: "manual-trigger-execution",
          [NodeType.GOOGLE_FORM_TRIGGER]: "google-form-trigger-execution",
          [NodeType.STRIPE_TRIGGER]: "stripe-trigger-execution",
          [NodeType.DISCORD]: "discord-execution",
          [NodeType.SLACK]: "slack-execution",
          [NodeType.INITIAL]: "initial-execution",
        };
        
        const channel = channelMap[node.type as NodeType];
        if (channel) {
          await publish({ 
            channel, 
            topic: "status", 
            data: { nodeId: node.id, status: "error" } 
          });
        }
      }
      throw error;
    }
  },
  {
    onFailure: async ({ event, step }) => {
      return prisma.execution.update({
        where: { inngestEventId: event.data.event.id },
        data: {
          status: ExecutionStatus.FAILED,
          completedAt: new Date(),
          error: event.data.error.message,
          errorStack: event.data.error.stack,
        },
      });
    },
  }
);
