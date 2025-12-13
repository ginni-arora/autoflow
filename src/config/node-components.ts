import type { NodeTypes } from "@xyflow/react";

import { InitialNode } from "@/components/initial-node";
import { HttpRequestNode } from "@/features/executions/components/http-request/node";
import { ManualTriggerNode } from "@/features/triggers/components/manual-trigger/node";
import { GoogleFormTriggerNode } from "@/features/triggers/components/google-form-trigger/node";
import { StripeTriggerNode } from "@/features/triggers/components/stripe-trigger/node";

export const nodeComponents = {
  INITIAL: InitialNode,
  HTTP_REQUEST: HttpRequestNode,
  MANUAL_TRIGGER: ManualTriggerNode,
  GOOGLE_FORM_TRIGGER: GoogleFormTriggerNode,
  STRIPE_TRIGGER: StripeTriggerNode,
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;