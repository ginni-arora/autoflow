import { GetStepTools, Inngest } from "inngest";
import type { Realtime } from "@inngest/realtime";

export type WorkflowContext = Record<string, unknown>;

export type StepTools = GetStepTools<Inngest<any>>;

export interface NodeExecutorParams<TData = Record<string, unknown>> {
  data: TData;
  nodeId: string;
  context: WorkflowContext;
  step: StepTools;
  publish: Realtime.PublishFn;
  userId: string;
}

export type NodeExecutor<TData = Record<string, unknown>> = (
  params: NodeExecutorParams<TData>
) => Promise<WorkflowContext>;