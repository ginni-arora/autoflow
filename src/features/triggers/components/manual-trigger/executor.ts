import { NodeExecutor } from "@/features/executions/types";
import { manualTriggerChannel } from "@/inngest/channels/manual-trigger";

type ManualTriggerData = Record<string, unknown>;

export const manualTriggerExecutor: NodeExecutor<ManualTriggerData> = async ({
  context,
  step,
  publish,
  nodeId,
}) => {
  // Publish loading state for manual trigger
  await publish({ channel: "manual-trigger-execution", topic: "status", data: { nodeId, status: "loading" } });
  
  const result = await step.run("manual-trigger", async () => {
    return context;
  });

  // Publish success state for manual trigger
  await publish({ channel: "manual-trigger-execution", topic: "status", data: { nodeId, status: "success" } });
  
  return result;
};