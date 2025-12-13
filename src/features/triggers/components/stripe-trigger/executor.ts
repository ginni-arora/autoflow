import { NodeExecutor } from "@/features/executions/types";
import { stripeTriggerChannel } from "@/inngest/channels/stripe-trigger";

type StripeTriggerData = Record<string, unknown>;

export const stripeTriggerExecutor: NodeExecutor<StripeTriggerData> = async ({
  context,
  step,
  publish,
  nodeId,
}) => {
  try {
    // Update status via API for client-side visibility
    await fetch('http://localhost:3000/api/node-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodeId, status: 'loading' })
    });
    
    // Publish loading state for Stripe trigger
    await publish({ channel: "stripe-trigger-execution", topic: "status", data: { nodeId, status: "loading" } });
    
    const result = await step.run("stripe-trigger", async () => {
      return context;
    });

    // Update status to success
    await fetch('http://localhost:3000/api/node-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodeId, status: 'success' })
    });

    // Publish success state for Stripe trigger
    await publish({ channel: "stripe-trigger-execution", topic: "status", data: { nodeId, status: "success" } });
    
    return result;
  } catch (error: unknown) {
    // Update status to error on failure
    try {
      await fetch('http://localhost:3000/api/node-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeId, status: 'error' })
      });
    } catch (statusError: unknown) {
      console.error('Failed to update status to error:', statusError);
    }

    // Publish error state
    await publish({ channel: "stripe-trigger-execution", topic: "status", data: { nodeId, status: "error" } });
    
    throw error; // Re-throw to stop workflow execution
  }
};