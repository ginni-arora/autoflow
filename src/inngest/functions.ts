
import prisma from "@/lib/db";
import { inngest } from "./client";
import { NonRetriableError } from "inngest";
import { topologicalSort } from "./utils";
import { getExecutor } from "@/features/executions/lib/executor-registry";
import { NodeType } from "@prisma/client";
import { httpRequestChannel } from "./channels/http-request";
import { manualTriggerChannel } from "./channels/manual-trigger";
import { googleFormTriggerChannel } from "./channels/google-form-trigger";
import { stripeTriggerChannel } from "./channels/stripe-trigger";
import "@/lib/handlebars"; // Register global Handlebars helpers

export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    retries: 0, // TODO: change for production
  },
  {
    event: "workflows/execute.workflow",
    channels: [httpRequestChannel, manualTriggerChannel, googleFormTriggerChannel, stripeTriggerChannel],
  },
  async ({ event, step, publish }) => {
    console.log("[Inngest] executeWorkflow triggered with event:", event);
    
    const workflowId = event.data.workflowId;
    if (!workflowId) {
      console.error("[Inngest] Workflow ID is missing from event data");
      throw new Error("Workflow ID is missing");
    }
    
    console.log("[Inngest] Processing workflow:", workflowId);

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
    for (const node of sortedNodes) {
      const executor = getExecutor(node.type as NodeType);
      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        context,
        step,
        publish,
      });
    }

    return {
      workflowId,
      result: context,
    };
  }
);
