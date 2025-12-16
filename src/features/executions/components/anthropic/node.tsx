"use client";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { AnthropicFormValues, AnthropicDialog } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchAnthropicRealtimeToken } from "./actions";

type AnthropicNodeData = {
  variableName?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

type AnthropicNodeType = Node<AnthropicNodeData>;

export const AnthropicNode = memo((props: NodeProps<AnthropicNodeType>) => {
  const[dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: "anthropic-execution",
    topic: "status",
    refreshToken: fetchAnthropicRealtimeToken,
  });

   const handleOpenSettings = () => setDialogOpen(true);
   const handleSubmit = (values: AnthropicFormValues) =>{
  
  setNodes((nodes) =>
  nodes.map((node) => {
    if (node.id === props.id) {
      return {
        ...node,
        data: {
          ...node.data,
          ...values,
        }
      }
    }

    return node;
  })
);


  
};

    const nodeData = props.data ;

  const description = nodeData.userPrompt
    ? `Claude 3.5 Sonnet: ${nodeData.userPrompt.slice(0, 50)}...`
    : "Not configured";

   

  return (
    <>
    <AnthropicDialog
  open={dialogOpen}
  onOpenChange={setDialogOpen}
  onSubmit = {handleSubmit}
  defaultValues={nodeData}
  
/>

    <BaseExecutionNode
      {...props}
      icon="/logos/anthropic.svg"
      name="Anthropic"
      status={nodeStatus}
      description={description}
      onSettings={handleOpenSettings}
      onDoubleClick={handleOpenSettings}
    />
  </>
)
});

AnthropicNode.displayName = "AnthropicNode";


