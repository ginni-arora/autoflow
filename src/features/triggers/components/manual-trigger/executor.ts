import { NodeExecutor } from "@/features/executions/types";

type ManualTriggerData = Record<string, unknown>;

export const manualTriggerExecutor: NodeExecutor<ManualTriggerData> = async ({
  context,
  step,
}) => {
  // TODO: publish loading state for manual trigger
  
  const result = await step.run("manual-trigger", async () => {
    return context;
  });

  // TODO: publish success state for manual trigger
  
  return result;
};