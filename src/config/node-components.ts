import type { NodeTypes } from "@xyflow/react";

import { InitialNode } from "@/components/initial-node";
import { HttpRequestNode } from "@/features/executions/components/http-request/node";
import { GeminiNode } from "@/features/executions/components/gemini/node";
import { OpenAINode } from "@/features/executions/components/openai/node";
import { AnthropicNode } from "@/features/executions/components/anthropic/node";
import { ManualTriggerNode } from "@/features/triggers/components/manual-trigger/node";
import { GoogleFormTriggerNode } from "@/features/triggers/components/google-form-trigger/node";
import { StripeTriggerNode } from "@/features/triggers/components/stripe-trigger/node";
import { DiscordNode } from "@/features/executions/components/discord/node";
import { SlackNode } from "@/features/executions/components/slack/node";

export const nodeComponents = {
  INITIAL: InitialNode,
  HTTP_REQUEST: HttpRequestNode,
  GEMINI: GeminiNode,
  OPENAI: OpenAINode,
  ANTHROPIC: AnthropicNode,
  MANUAL_TRIGGER: ManualTriggerNode,
  GOOGLE_FORM_TRIGGER: GoogleFormTriggerNode,
  STRIPE_TRIGGER: StripeTriggerNode,
  DISCORD: DiscordNode,
  SLACK: SlackNode,
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;